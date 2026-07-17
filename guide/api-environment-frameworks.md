# フレームワーク向けの Environment API

:::info Release Candidate
Environment API は一般的にリリース候補段階にあります。エコシステムがそれらを実験し、構築できるように、メジャーリリース間での API の安定性を維持します。ただし、[一部の特定の API](/changes/#considering) はまだ実験的であることに注意してください。

ダウンストリームプロジェクトが新しい機能を実験し、それらを検証する時間を持った後、将来のメジャーリリースでこれらの新しい API を安定化する予定です（破壊的変更を含む可能性あり）。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

ぜひフィードバックをお寄せください。
:::

## DevEnvironment の通信レベル {#devenvironment-communication-levels}

環境は異なるランタイムで実行される可能性があるため、環境との通信にはランタイムに応じて制約がある場合があります。フレームワークがランタイムに依存しないコードを簡単に記述できるように、Environment API は 3 種類の通信レベルを提供します。

### `RunnableDevEnvironment`

`RunnableDevEnvironment` は、アプリケーションコードと任意の JavaScript の値を通信できる環境です。モジュールをインポートすると、そのモジュールの本物のライブエクスポート（関数、クラスインスタンス、その他の値）が返されるため、フレームワークはサーバーエントリーを直接実行できます。暗黙的な `ssr` 環境とその他の非クライアント環境では、開発中にデフォルトで `RunnableDevEnvironment` が使用されます。`isRunnableDevEnvironment` 関数を使用して、ランナーへのアクセスを保護できます。

その `runner` は `ModuleRunner` です。`runner.import(url)` を通じてモジュールをインポートします。これは Vite モジュールグラフからモジュールをフェッチ、変換、評価し（`url` はルートからの相対的なファイルパス、サーバーパス、ID を受け付けます）、完全な HMR サポートを持つインスタンス化されたモジュールを返します。これは `server.ssrLoadModule` の現代的な代替品であり、フレームワークはそれに移行して SSR 開発ストーリーの HMR を有効にできます。

:::info 任意の値を通信できる理由
`RunnableDevEnvironment` は Vite サーバーと同じランタイムでモジュールを評価するため、値はシリアライズされることなくプロセス内で境界を越えます。これが Fetch API 経由でシリアライズされた `Request`/`Response` オブジェクトを通じてのみ通信できる [`FetchableDevEnvironment`](#fetchabledevenvironment) との違いです。そのため、`RunnableDevEnvironment` を使用するにはランナーのランタイムが Vite サーバーと同じである必要があります。
:::

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * 実行する URL。
   * ルートからの相対的なファイルパス、サーバーパス、ID を受け付けます。
   * インスタンス化されたモジュールを返します (ssrLoadModule と同じ)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * その他の ModuleRunner メソッド...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
`runner` は、初めてアクセスされたときにのみ遅延評価されます。Vite は、`process.setSourceMapsEnabled` を呼び出して `runner` が作成されたとき、またはそれが利用できない場合は `Error.prepareStackTrace` をオーバーライドすることによって、ソースマップのサポートを有効にすることに注意してください。
:::

[SSR セットアップガイド](/guide/ssr#setting-up-the-dev-server)で説明されているように、ミドルウェアモードに設定された Vite サーバーがあるとして、Environment API を使って SSR ミドルウェアを実装してみましょう。これは `ssr` と呼ばれる必要はないので、この例では `server` と名付けます。エラー処理は省略します。

```js
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // デフォルトでは、モジュールは vite サーバーと同じプロセスで実行されます
    },
  },
})

// TypeScript でこれを RunnableDevEnvironment にキャストするか、ランナーへのアクセスを
// 保護するために isRunnableDevEnvironment を使用する必要があるかもしれません
const serverEnvironment = viteServer.environments.server

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. index.html を読み込む
  const indexHtmlPath = path.resolve(import.meta.dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Vite HTML 変換を適用します。これにより、Vite HMR クライアントが挿入され、
  //    Vite プラグインからの HTML 変換も適用されます。
  //    例: global preambles from @vitejs/plugin-react
  template = await viteServer.transformIndexHtml(url, template)

  // 3. サーバーエントリをロードします。import(url) は、
  //    ESM ソースコードを Node.js で使用できるように自動的に変換します。
  //    バンドルは不要で、完全な HMR サポートを提供します。
  const { render } = await serverEnvironment.runner.import(
    '/src/entry-server.js',
  )

  // 4. アプリの HTML をレンダリングします。これは、entry-server.js のエクスポートされた
  //    `render` 関数が適切なフレームワーク SSR API を呼び出すことを前提としています。
  //    例: ReactDOMServer.renderToString()
  const appHtml = await render(url)

  // 5. アプリでレンダリングされた HTML をテンプレートに挿入します。
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. レンダリングされた HTML を送信します。
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

HMR をサポートする環境（`RunnableDevEnvironment` など）を使用する場合は、最適な動作を得るために、サーバーエントリファイルに `import.meta.hot.accept()` を追加する必要があります。これを行わないと、サーバーファイルの変更によってサーバーモジュールグラフ全体が無効になります:

```js
// src/entry-server.js
export function render(...) { ... }

if (import.meta.hot) {
  import.meta.hot.accept()
}
```

### `FetchableDevEnvironment`

:::info

[`FetchableDevEnvironment` プロポーザル](https://github.com/vitejs/vite/discussions/18191)に関するフィードバックを募集しています。

:::

`FetchableDevEnvironment` は、[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) インターフェースを介してランタイムと通信できる環境です。`RunnableDevEnvironment` は限られたランタイムでしか実装できないため、`RunnableDevEnvironment` の代わりに `FetchableDevEnvironment` を使用することをお勧めします。

これを使う一般的な理由は、Vite を直接実行できないランタイム（例: Cloudflare Workers）をサポートしたいフレームワークです。そのようなランタイムでは、値をプロセス内で境界越えさせるためにランナーが Vite サーバーのランタイムを共有する必要があるため、`RunnableDevEnvironment` は使用できません。Fetch API に標準化することで、フレームワークはすべてのターゲットランタイムにわたって単一のリクエスト処理パスを維持できます。開発ミドルウェアはブラウザーから受信した各リクエストを `Request` として転送し、返された `Response` をブラウザーに送り返すことで、本番環境でのアプリのリクエスト処理を反映します。

この環境は、`handleRequest` メソッドを介してリクエストを処理する標準化された方法を提供します。

```ts
import {
  createServer,
  createFetchableDevEnvironment,
  isFetchableDevEnvironment,
} from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    custom: {
      dev: {
        createEnvironment(name, config) {
          return createFetchableDevEnvironment(name, config, {
            handleRequest(request: Request): Promise<Response> | Response {
              // リクエストを処理し、レスポンスを返します
            },
          })
        },
      },
    },
  },
})

// Environment API のどの利用者からも `dispatchFetch` を呼び出せるようになりました
if (isFetchableDevEnvironment(server.environments.custom)) {
  const response: Response = await server.environments.custom.dispatchFetch(
    new Request('http://example.com/request-to-handle'),
  )
}
```

:::warning
Vite は、`dispatchFetch` メソッドの入力と出力を検証します。リクエストはグローバル `Request` クラスのインスタンスである必要があり、レスポンスはグローバル `Response` クラスのインスタンスである必要があります。そうでない場合、Vite は `TypeError` をスローします。

`FetchableDevEnvironment` はクラスとして実装されていますが、Vite チームからは実装の詳細と見なされており、いつでも変更される可能性があることに注意してください。
:::

### 未加工の `DevEnvironment`

環境が `RunnableDevEnvironment` または `FetchableDevEnvironment` インターフェースを実装していない場合は、手動で通信を設定する必要があります。

ユーザーモジュールと同じランタイムでコードを実行できる場合（つまり、Node.js 固有の API に依存しない場合）、仮想モジュールを使用できます。このアプローチにより、Vite の API を使用してコードから値にアクセスする必要がなくなります。

```ts
// Vite の API を使用するコード
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // `virtual:entrypoint` を処理するプラグイン
    {
      name: 'virtual-module',
      /* プラグインの実装 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// コードを実行する各環境ファクトリーによって公開されている関数を使用します
// 各環境ファクトリーについて、それらが提供するものをチェックします
if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('http://example.com/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

たとえば、ユーザーモジュールで `transformIndexHtml` を呼び出すには、次のプラグインを使用できます:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

コードに Node.js API が必要な場合は、`hot.send` を使用して、ユーザーモジュールから Vite の API を使用するコードと通信できます。ただし、このアプローチはビルドプロセス後に同じように機能しない可能性があることに注意してください。

```ts
// Vite の API を使用するコード
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // `virtual:entrypoint` を処理するプラグイン
    {
      name: 'virtual-module',
      /* プラグインの実装 */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// コードを実行する各環境ファクトリーによって公開されている関数を使用します
// 各環境ファクトリーについて、それらが提供するものをチェックします
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('http://example.com/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('http://example.com/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## ビルド中の環境 {#environments-during-build}

CLI において、`vite build` と `vite build --ssr` を呼び出すと、後方互換性のためにクライアントのみの環境と ssr のみの環境がビルドされます。

`builder` オプションが設定されている場合（空のオブジェクト `{}` でも、`vite build --app` が行うのはこれです）、`vite build` はアプリ全体のビルドを行います。これは将来のメジャーバージョンではデフォルトになる予定です。このモードでは、Vite は `ViteBuilder` インスタンス（ビルド時の `ViteDevServer` に相当）を作成し、プロダクション環境用に設定されたすべての環境をビルドします。デフォルトでは、環境のビルドは `environments` レコードの順番に従って直列に実行されます。

### `builder.buildApp` でアプリのビルドを設定する

フレームワークやユーザーは `builder.buildApp` オプションを通じて環境のビルド方法を制御できます。これは `ViteBuilder` インスタンス（以下の例では `builder` という名前）を受け取り、各環境のビルドを担当します。たとえば、一部の環境を並列でビルドするには:

```js [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      await Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
})
```

### `buildApp` プラグインフック

- **型:** `(this: MinimalPluginContextWithoutEnvironment, builder: ViteBuilder) => Promise<void>`
- **種類:** `async`, `sequential`
- **スコープ:** [グローバル](/guide/api-environment-plugins#per-environment-hooks-and-global-hooks)

`builder.buildApp` 設定オプションに加えて、プラグインは `buildApp` フックを定義してアプリのビルドに参加できます。設定オプションとプラグインフックは定義された順序で実行されます。order が `'pre'` または `null` のフックが最初に実行され、次に設定された `builder.buildApp`、その後 order が `'post'` のフックが実行されます。フック内では、`environment.isBuilt` で環境がすでにビルドされているかどうかを確認でき、プラグインが同じ環境を二重にビルドするのを防げます。

### `createBuilder` でプログラム的にビルドする

自分のコードからアプリのビルドをトリガーするには、スタンドアロンの `build` 関数の代わりに `createBuilder` を使用してください。`createBuilder` はビルド時の `createServer` に相当します。設定を解決して `ViteBuilder` を返し、その `buildApp` メソッドがすべての設定された環境をビルドします。`builder.build(environment)` を使用して単一の環境をビルドすることもできます。

```js [build.js]
import { createBuilder } from 'vite'

const builder = await createBuilder()
await builder.buildApp()
```

`createBuilder` は環境対応ビルドにおいてスタンドアロンの `build` 関数の後継です。`build` は上記のレガシーなクライアントのみおよび ssr のみのビルドの簡単なエントリーポイントとして引き続き機能しますが、任意の環境をビルドすることはできません。`builder.buildApp()` の実行は `vite build --app` のプログラム的な相当です。

## 環境に依存しないコード {#environment-agnostic-code}

ほとんどの場合、現在の `environment` インスタンスは実行中のコードのコンテキストの一部として利用できるため、`server.environments` を介してアクセスする必要はほとんどありません。たとえば、プラグインフック内では、環境は `PluginContext` の一部として公開されるため、`this.environment` を使用してアクセスできます。環境対応プラグインの構築方法については、[プラグイン向けの Environment API](./api-environment-plugins.md) を参照してください。
