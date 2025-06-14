# フレームワーク向けの Environment API

:::warning 実験的機能
Environment API は実験的なものです。エコシステムでの実験と開発を可能にするため、メジャーリリース間の API の安定性は維持されます。ダウンストリームプロジェクトが新機能を実験して検証した後、将来のメジャーリリースでこれらの新しい API を安定化する予定です（破壊的変更を含む可能性あり）。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

ぜひフィードバックをお寄せください。
:::

## 環境とフレームワーク {#environments-and-frameworks}

暗黙的な `ssr` 環境とその他の非クライアント環境では、開発中にデフォルトで `RunnableDevEnvironment` が使用されます。これには、Vite サーバーが実行しているのと同じランタイムが必要ですが、`ssrLoadModule` と同様に動作し、フレームワークが SSR 開発ストーリーの HMR を移行して有効にできるようにします。`isRunnableDevEnvironment` 関数を使用して、実行可能な環境をすべて保護できます。

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * 実行するURL。
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

`Fetch API`（[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)）を介してランタイムと通信するフレームワークは、`handleRequest` メソッドを通じてリクエストを標準化された方法で処理する `FetchableDevEnvironment` を利用できます:

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
    new Request('/request-to-handle'),
  )
}
```

:::warning
Vite は、`dispatchFetch` メソッドの入力と出力を検証します。リクエストはグローバル `Request` クラスのインスタンスである必要があり、レスポンスはグローバル `Response` クラスのインスタンスである必要があります。そうでない場合、Vite は `TypeError` をスローします。

`FetchableDevEnvironment` はクラスとして実装されていますが、Vite チームからは実装の詳細と見なされており、いつでも変更される可能性があることに注意してください。
:::

## Default `RunnableDevEnvironment`

[SSR セットアップガイド](/guide/ssr#setting-up-the-dev-server)で説明されているように、ミドルウェアモードに設定された Vite サーバーがあるとして、Environment API を使って SSR ミドルウェアを実装してみましょう。これは `ssr` と呼ばれる必要はないので、この例では `server` と名付けます。エラー処理は省略します。

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
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

## ランタイムに依存しない SSR {#runtime-agnostic-ssr}

`RunnableDevEnvironment` は Vite サーバーと同じランタイムでコードを実行する目的のみで使用できるため、Vite サーバーを実行できるランタイム（Node.js と互換性のあるランタイム）が必要です。つまり、ランタイムに依存しないようにするには、生の `DevEnvironment` を使用する必要があります。

:::info `FetchableDevEnvironment` プロポーザル

当初の提案では、`DevEnvironment` クラスに `run` メソッドがあり、利用者は `transport` オプションを使用してランナー側でインポートを呼び出すことができました。テスト中に、この API は推奨するには汎用性が足りないことがわかりました。現在、[`FetchableDevEnvironment` プロポーザル](https://github.com/vitejs/vite/discussions/18191)に関するフィードバックを募集しています。

:::

`RunnableDevEnvironment` には、モジュールの値を返す `runner.import` 関数があります。ただし、この関数は生の `DevEnvironment` では使用できず、Vite の API を使用するコードとユーザーモジュールを分離する必要があります。

たとえば、次の例では、Vite の API を使用するコードからユーザーモジュールの値を使用しています:

```ts
// Vite の API を使用するコード
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

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
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

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

const req = new Request('/')

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

const response = handler(new Request('/'))

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

`builder` が `undefined` でない場合（または `vite build --app` を呼び出した場合）、`vite build` はアプリ全体のビルドを行います。これは将来のメジャーバージョンではデフォルトになる予定です。`ViteBuilder` インスタンス（ビルド時の `ViteDevServer` に相当）が作成され、プロダクション環境用に設定されたすべての環境がビルドされます。デフォルトでは、環境のビルドは `environments` レコードの順番に従って直列に実行されます。フレームワークやユーザーは環境を構築する方法を設定できます:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

プラグインは `buildApp` フックを定義することもできます。order が `'pre'` および `null` のフックは、設定された `builder.buildApp` の前に実行され、`'post'` のフックはその後で実行されます。`environment.isBuilt` を使用して、環境がすでにビルドされているかどうかを確認できます。

## 環境に依存しないコード {#environment-agnostic-code}

ほとんどの場合、現在の `environment` インスタンスは実行中のコードのコンテキストの一部として利用できるため、`server.environments` を介してアクセスする必要はほとんどありません。たとえば、プラグインフック内では、環境は `PluginContext` の一部として公開されるため、`this.environment` を使用してアクセスできます。環境対応プラグインの構築方法については、[プラグイン向けの Environment API](./api-environment-plugins.md) を参照してください。
