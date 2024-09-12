# Environment API

:::warning 低レベル API
この API の初期研究は、Vite 5.1 で「Vite ランタイム API」という名前で導入されました。このガイドでは、Environment API と改名された改訂版 API について説明します。この API は Vite 6 でリリースされる予定です。すでに最新の `vite@6.0.0-alpha.x` バージョンでテストできます。

リソース:

- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)
- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)

問題を発見したら、お気軽に `v6/environment-api` ブランチに PR を送ってください。提案をテストしてからフィードバックを共有してください。
:::

Vite 6 は環境の概念が形式化され、環境を作成・設定するための新しい API を導入するとともに、一貫した API でオプションやコンテキストユーティリティにアクセスできるようになりました。Vite 2 以降、2 つの暗黙的な環境（`client` と `ssr`）が存在していました。プラグインフックは、最後のオプションパラメーターで `ssr` という真偽値を受け取り、処理される各モジュールのターゲット環境を識別しました。いくつかの API はモジュールを正しい環境に適切に関連付けるために、オプションの最後の `ssr` パラメーターを受け付けていました（例えば `server.moduleGraph.getModuleByUrl(url, { ssr })`）。`ssr` 環境は、クライアント環境に存在するオプションの一部が設定された `config.ssr` を使って設定されました。開発時には、`client` 環境と `ssr` 環境の両方が単一の共有プラグインパイプラインで同時に実行されていました。ビルド時には、各ビルドは新しいプラグインのセットを含む新しい解決済みの設定インスタンスを取得していました。

新しい Environment API はこれら 2 つのデフォルト環境を明示的にするだけでなく、ユーザーが必要な数だけ名前付き環境を作成できるようにします。環境を設定するための統一された方法（`config.environment` を使用）があり、処理中のモジュールに関連する環境オプションとコンテキストユーティリティーは、`this.environment` を使用してプラグインフックでアクセスできます。以前は `ssr` という真偽値を受け取っていた API は適切な環境にスコープされるようになりました（例えば `environment.moduleGraph.getModuleByUrl(url)`）。開発中は、以前と同じようにすべての環境が同時に実行されます。ビルド時には、後方互換性のために、各ビルドは独自の解決された設定インスタンスを取得します。ただし、プラグインやユーザーは共有ビルドパイプラインにオプトインできます。

内部的に大きな変更があり、新しいオプトイン API があったとしても、Vite 5 からの破壊的変更はありません。Vite 6 の最初の目標は、エコシステムをできるだけスムーズに新メジャーに移行させ、プラグインの新バージョンを利用できる十分なユーザーが揃うまで、プラグインの新 API の採用促進を遅らせることです。

## Vite サーバーでの環境の使用

単一の Vite 開発サーバーを使用して、異なるモジュール実行環境と同時にやり取りできます。ここでは環境という言葉は、ID を解決し、ソースコードをロードし、処理でき、コードが実行されるランタイムに接続されている、構成された Vite 処理パイプラインを指します。変換されたソースコードはモジュールと呼ばれ、各環境で処理されるモジュール間の関係はモジュールグラフに保持されます。これらのモジュールのコードは、実行される各環境に関連付けられたランタイムに送信されます。モジュールが評価されると、ランタイムはインポートされたモジュールを要求し、モジュールグラフのセクションの処理をトリガーします。典型的な Vite アプリでは、環境はクライアントに提供される ES モジュールと SSR を行うサーバープログラムに使用されます。アプリは Node サーバーだけでなく、[Cloudflare の workerd](https://github.com/cloudflare/workerd) のような他の JS ランタイムでも SSR を行うことができます。つまり、ブラウザー環境、Node 環境、workerd 環境など、さまざまなタイプの環境を同じ Vite サーバー上に持つことができるのです。

Vite モジュールランナーは、最初に Vite プラグインで処理することで任意のコードを実行できます。`server.ssrLoadModule` とは異なり、ランナーの実装はサーバーから切り離されています。これにより、ライブラリやフレームワークの作者は Vite サーバーとランナー間の通信レイヤーを実装できます。ブラウザーは、サーバーの Web ソケットや HTTP リクエストを使って対応する環境と通信します。Node モジュールランナーは、同じプロセスで実行されているため、モジュールを処理するための関数呼び出しを直接行うことができます。他の環境では、workerd のような JS ランタイムに接続するモジュールや Vitest のようにワーカースレッドに接続するモジュールを実行できます。

これらの環境はすべて Vite の HTTP サーバー、ミドルウェア、Web ソケットを共有しています。解決された設定とプラグインのパイプラインも共有されますが、プラグインは `apply` を使うことができるので、フックは特定の環境でのみ呼び出されます。環境はフック内部でアクセスすることもでき、きめ細かい制御が可能です。

![Vite Environments](../images/vite-environments.svg)

Vite 開発サーバーはデフォルトで `client` 環境と `ssr` 環境の 2 つの環境を公開します。クライアント環境はデフォルトではブラウザー環境であり、モジュールランナーは `/@vite/client` という仮想モジュールをクライアントアプリにインポートすることで実装されています。SSR 環境はデフォルトで Vite サーバーと同じ Node ランタイムで実行され、HMR を完全にサポートした開発中のリクエストのレンダリングにアプリケーションサーバーを使用できます。フレームワークやユーザーがデフォルトのクライアントと SSR 環境の環境タイプを変更したり、新しい環境を登録したりする方法については後で説明します（例えば [RSC](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components) 用の独立したモジュールグラフを持つなど）。

利用可能な環境は `server.environments` を使ってアクセスできます:

```js
const environment = server.environments.client

environment.transformRequest(url)

console.log(server.environments.ssr.moduleGraph)
```

ほとんどの場合、現在の `environment` インスタンスは実行中のコードのコンテキストの一部として利用できるので、 `server.environments` を使ってアクセスする必要はほとんどないはずです。例えば、プラグインフックの内部では、環境は `PluginContext` の一部として公開されるので、`this.environment` を使ってアクセスできます。

開発環境は `DevEnvironment` クラスのインスタンスです:

```ts
class DevEnvironment {
  /**
   * Vite サーバー内の環境の一意な識別子。
   * デフォルトでは、Vite は 'client' と 'ssr' 環境を公開します。
   */
  name: string
  /**
   * ターゲットランタイム内の関連モジュールランナーから
   * メッセージを送受信するための通信チャネル。
   */
  hot: HotChannel | null
  /**
   * 処理されたモジュールと処理されたコードのキャッシュ結果との間の
   * インポートされた関係を示すモジュールノードのグラフ。
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * この環境の解決済みプラグイン。
   * 環境ごとの `create` フックを使って作成されたものも含む。
   */
  plugins: Plugin[]
  /**
   * 環境プラグインパイプラインを通じて、
   * コードの解決、ロード、変換を可能にする
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * この環境の解決された設定オプション。
   * サーバーのグローバルスコープのオプションはすべての環境のデフォルトとして扱われ、
   * オーバーライドすることができます (resolve conditions、external、optimizedDeps)。
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(name, config, { hot, options }: DevEnvironmentSetup)

  /**
   * URL を id に解決してロードし、プラグインパイプラインを使ってコードを処理する。
   * モジュールグラフも更新されます。
   */
  async transformRequest(url: string): TransformResult

  /**
   * 低い優先度で処理されるリクエストを登録します。ウォーターフォールを回避するのに
   * 役立ちます。Vite サーバーは他のリクエストによってインポートされたモジュールに関する
   * 情報を持っているため、モジュールがリクエストされたときにすでに処理されているよう、
   * モジュールグラフをウォームアップできます。
   */
  async warmupRequest(url: string): void
}
```

`TransformResult` は次のようになります:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Vite サーバーの環境インスタンスでは、`environment.transformRequest(url)` メソッドを使用して URL を処理できます。この関数はプラグインパイプラインを使用して `url` をモジュール `id` に解決し、（ファイルシステムからファイルを読み込むか、仮想モジュールを実装するプラグインを介して）モジュールをロードし、コードを変換します。モジュールを変換している間、インポートやその他のメタデータは、対応するモジュールノードを作成または更新することで、環境モジュールグラフに記録されます。処理が完了すると、変換結果もモジュールに保存されます。

しかし、モジュールが実行されるランタイムが Vite サーバーが実行されているランタイムと異なる可能性があるため、環境インスタンスはコード自体を実行することはできません。これはブラウザー環境の場合です。HTML がブラウザーに読み込まれると、そのスクリプトが実行され、静的モジュールグラフ全体の評価が開始されます。インポートされた各 URL は、モジュールコードを取得するために Vite サーバーへのリクエストを生成します。このリクエストは、`server.environment.client.transformRequest(url)` を呼び出すことによって、変換ミドルウェアによって処理されます。サーバーの環境インスタンスとブラウザーのモジュールランナー間の接続は、この場合 HTTP を通して行われます。


:::info transformRequest の命名
この提案の現在のバージョンでは `transformRequest(url)` と `warmupRequest(url)` を使っているので、Vite の現在の API に慣れているユーザーにとっては議論しやすく、理解しやすいと思います。リリースする前に、これらの名前を見直す機会を設ける可能性があります。例えば、プラグインフックで Rollup の `context.load(id)` からページを取得する `environment.processModule(url)` や `environment.loadModule(url)` という名前にすることもできます。今のところは現在の名前のままで、この議論を遅らせる方が良いと考えています。

:::info モジュールの実行
最初の提案では、コンシューマが `transport` オプションを使うことでランナー側でインポートを呼び出すことができる `run` メソッドがありました。テスト中に、この API を推奨するほど汎用的なものではないことがわかりました。私たちはフレームワークからのフィードバックに基づいて、リモート SSR 実装のための組み込みレイヤーを実装する予定です。それまでの間、Vite はランナー RPC の複雑さを隠すために [`RunnerTransport` API](#runnertransport) を公開しています。
:::

デフォルトで Node で動作する `ssr` 環境では、Vite は開発サーバーと同じ JS ランタイムで動作される `new AsyncFunction` を使って評価を実装するモジュールランナーを作成します。このランナーは `ModuleRunner` のインスタンスで、次のように公開します:

```ts
class ModuleRunner {
  /**
   * 実行するURL。ルートからの相対的なファイルパス、サーバーパス、ID を受け付けます。
   * インスタンス化されたモジュールを返します (ssrLoadModule と同じ)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * その他の ModuleRunner メソッド...
   */
```

:::info
v5.1 のランタイム API では `executeUrl` メソッドと `executeEntryPoint` メソッドがありましたが、現在は単一の `import` メソッドに統合されています。HMR のサポートを停止したい場合は、`hmr: false` フラグを付けてランナーを作成します。
:::

デフォルトの SSR Node モジュールランナーは公開されていません。`createNodeEnvironment` API と `createServerModuleRunner` を一緒に使うことで、同じスレッドでコードを実行し、HMR をサポートし、SSR の実装と衝突しないランナーを作成できます（設定でオーバーライドされている場合）。[SSR セットアップガイド](/guide/ssr#setting-up-the-dev-server)で説明されているように、ミドルウェアモードに設定された Vite サーバーがあるとして、Environment API を使って SSR ミドルウェアを実装してみましょう。エラー処理は省略します。

```js
import {
  createServer,
  createServerHotChannel,
  createServerModuleRunner,
  createNodeDevEnvironment,
} from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    node: {
      dev: {
        // デフォルトの Vite SSR 環境はコンフィグで上書きできるので、
        // リクエストを受け取る前に Node 環境があることを確認してください。
        createEnvironment(name, config) {
          return createNodeDevEnvironment(name, config, {
            hot: createServerHotChannel(),
          })
        },
      },
    },
  },
})

const runner = createServerModuleRunner(server.environments.node)

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. index.html を読み込む
  let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')

  // 2. Vite HTML 変換を適用します。これにより、Vite HMR クライアントが挿入され、
  //    Vite プラグインからの HTML 変換も適用されます。
  //    例: global preambles from @vitejs/plugin-react
  template = await server.transformIndexHtml(url, template)

  // 3. サーバーエントリをロードします。import(url) は、
  //    ESM ソースコードを Node.js で使用できるように自動的に変換します。
  //    バンドルは不要で、完全な HMR サポートを提供します。
  const { render } = await runner.import('/src/entry-server.js')

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

## 環境に依存しない SSR

::: info
最も一般的な SSR のユースケースをカバーするために Vite がどのような API を提供すべきかはまだ明確ではありません。私たちはエコシステムがまず共通のパターンを探索できるように、環境に依存しない SSR を行うための公式な方法なしに Environment API をリリースすることを考えています。
:::

## 独立したモジュールグラフ

各環境は独立したモジュールグラフを持ちます。すべてのモジュールグラフは同じシグネチャーを持つので、環境に依存せずにグラフをクロールしたりクエリしたりする汎用的なアルゴリズムを実装できます。`hotUpdate` が良い例です。ファイルが変更されると、各環境のモジュールグラフを使用して、影響を受けるモジュールを検出し、各環境に対して個別に HMR を実行します。

::: info
Vite v5 ではクライアントと SSR のモジュールグラフが混在していました。未処理のノードや無効化されたノードがあった場合、それがクライアントに対応するのか、SSR に対応するのか、あるいは両方の環境に対応するのかを知ることはできません。モジュールノードには、`clientImportedModules` や `ssrImportedModules` (および両者の和を返す `importedModules`) のようなプレフィックス付きのプロパティがあります。`importers` には、各モジュールノードのクライアントと SSR 環境のすべてのインポーターが含まれます。モジュールノードには `transformResult` と `ssrTransformResult` もあります。後方互換性レイヤーはエコシステムが非推奨の `server.moduleGraph` から移行できます。
:::

各モジュールは `EnvironmentModuleNode` インスタンスで表現されます。モジュールはまだ処理されていなくてもグラフに登録できます（その場合 `transformResult` は `null` となります）。モジュールが処理されると `importers` と `importedModules` も更新されます。

```ts
class EnvironmentModuleNode {
  environment: string

  url: string
  id: string | null = null
  file: string | null = null

  type: 'js' | 'css'

  importers = new Set<EnvironmentModuleNode>()
  importedModules = new Set<EnvironmentModuleNode>()
  importedBindings: Map<string, Set<string>> | null = null

  info?: ModuleInfo
  meta?: Record<string, any>
  transformResult: TransformResult | null = null

  acceptedHmrDeps = new Set<EnvironmentModuleNode>()
  acceptedHmrExports: Set<string> | null = null
  isSelfAccepting?: boolean
  lastHMRTimestamp = 0
  lastInvalidationTimestamp = 0
}
```

`environment.moduleGraph` は `EnvironmentModuleGraph` のインスタンスです:

```ts
export class EnvironmentModuleGraph {
  environment: string

  urlToModuleMap = new Map<string, EnvironmentModuleNode>()
  idToModuleMap = new Map<string, EnvironmentModuleNode>()
  etagToModuleMap = new Map<string, EnvironmentModuleNode>()
  fileToModulesMap = new Map<string, Set<EnvironmentModuleNode>>()

  constructor(
    environment: string,
    resolveId: (url: string) => Promise<PartialResolvedId | null>,
  )

  async getModuleByUrl(
    rawUrl: string,
  ): Promise<EnvironmentModuleNode | undefined>

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = Date.now(),
    isHmr: boolean = false,
  ): void

  invalidateAll(): void

  async ensureEntryFromUrl(
    rawUrl: string,
    setIsSelfAccepting = true,
  ): Promise<EnvironmentModuleNode>

  createFileOnlyEntry(file: string): EnvironmentModuleNode

  async resolveUrl(url: string): Promise<ResolvedUrl>

  updateModuleTransformResult(
    mod: EnvironmentModuleNode,
    result: TransformResult | null,
  ): void

  getModuleByEtag(etag: string): EnvironmentModuleNode | undefined
}
```

## 新しい環境の作成

この機能の目的のひとつは、コードを処理し実行するためのカスタマイズ可能な API を提供することです。ユーザーは、公開されているプリミティブを使って新しい環境タイプを作成できます。

```ts
import { DevEnvironment, RemoteEnvironmentTransport } from 'vite'

function createWorkerdDevEnvironment(name: string, config: ResolvedConfig, context: DevEnvironmentContext) {
  const hot = /* ... */
  const connection = /* ... */
  const transport = new RemoteEnvironmentTransport({
    send: (data) => connection.send(data),
    onMessage: (listener) => connection.on('message', listener),
  })

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot,
    runner: {
      transport,
    },
  })
  return workerdDevEnvironment
}
```

そして、ユーザーは以下を使用して SSR を実行するための workerd 環境を作成できます:

```js
const ssrEnvironment = createWorkerdEnvironment('ssr', config)
```

## 環境設定

環境は `environments` 設定オプションで明示的に設定します。

```js
export default {
  environments: {
    client: {
      resolve: {
        conditions: [], // クライアント環境を設定する
      },
    },
    ssr: {
      dev: {
        optimizeDeps: {}, // SSR 環境を設定する
      },
    },
    rsc: {
      resolve: {
        noExternal: true, // カスタム環境を設定する
      },
    },
  },
}
```

すべての環境設定はユーザーのルート設定から拡張され、ユーザーはルートレベルですべての環境のデフォルトを追加できます。これは、Vite クライアントのみのアプリを設定するような一般的なユースケースで、`environments.client` を経由せずに設定できるため、非常に便利です。

```js
export default {
  resolve: {
    conditions: [], // すべての環境のデフォルトを設定する
  },
}
```

`EnvironmentOptions` インターフェースは環境ごとのオプションをすべて公開します。`resolve` のように、`build` と `dev` の両方に適用される `SharedEnvironmentOptions` があります。また、開発環境やビルド環境固有のオプション（`dev.optimizeDeps` や `build.outDir` など）については、`DevEnvironmentOptions` と `BuildEnvironmentOptions` があります。

```ts
interface EnvironmentOptions extends SharedEnvironmentOptions {
  dev: DevOptions
  build: BuildOptions
}
```

説明したように、ユーザー設定のルートレベルで定義された環境固有のオプションは、デフォルトのクライアント環境に使用されます（`UserConfig` インターフェースは `EnvironmentOptions` インターフェースを継承しています）。また、環境は `environments` レコードを使用して明示的に設定できます。たとえ `environments` に空のオブジェクトが設定されていたとしても、開発中は `client` と `ssr` の環境は常に存在します。これは `server.ssrLoadModule(url)` と `server.moduleGraph` との後方互換性を保つためです。ビルド時には `client` 環境が常に存在し、`ssr` 環境は明示的に設定された場合（`environments.ssr` または後方互換性のために `build.ssr` を使用します）のみ存在します。

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // その他のオプション
}
```

::: info

トップレベルプロパティの `ssr` には `EnvironmentOptions` と共通する多くのオプションがあります。このオプションは `environments` と同じユースケースのために作成されましたが、設定できるオプションは限られていました。環境設定を統一的に定義するために、このオプションは非推奨とします。

:::

## カスタム環境インスタンス

カスタムの開発環境やビルド環境のインスタンスを作成するには、`dev.createEnvironment` または `build.createEnvironment` 関数を使用します。

```js
export default {
  environments: {
    rsc: {
      dev: {
        createEnvironment(name, config, { watcher }) {
          // 開発時に 'rsc' と解決されたコンフィグで呼び出される
          return createNodeDevEnvironment(name, config, {
            hot: customHotChannel(),
            watcher
          })
        }
      },
      build: {
        createEnvironment(name, config) {
          // ビルド時に 'rsc' と解決されたコンフィグで呼び出される
          return createNodeBuildEnvironment(name, config)
        }
        outDir: '/dist/rsc',
      },
    },
  },
}
```

この環境は `server.environments` を通してミドルウェアやプラグインフックでアクセスできます。プラグインフックでは、環境インスタンスがオプションで渡されるので、設定方法に応じて条件を実行できます。

Workerd のような環境プロバイダーは、開発環境とビルド環境の両方に同じランタイムを使うという最も一般的なケースのために、環境プロバイダーを公開できます。デフォルトの環境オプションも設定できるので、ユーザーは設定する必要がありません。

```js
function createWorkedEnvironment(userConfig) {
  return mergeConfig(
    {
      resolve: {
        conditions: [
          /*...*/
        ],
      },
      dev: {
        createEnvironment(name, config, { watcher }) {
          return createWorkerdDevEnvironment(name, config, {
            hot: customHotChannel(),
            watcher,
          })
        },
      },
      build: {
        createEnvironment(name, config) {
          return createWorkerdBuildEnvironment(name, config)
        },
      },
    },
    userConfig,
  )
}
```

設定ファイルは次のように記述できます

```js
import { createWorkerdEnvironment } from 'vite-environment-workerd'

export default {
  environments: {
    ssr: createWorkerdEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
    rsc: createWorkerdEnvironment({
      build: {
        outDir: '/dist/rsc',
      },
    }),
  ],
}
```

この例では、`ssr` 環境がランタイムとして workerd を使用するようにどのように設定できるかが分かります。さらに、workerd ランタイムの別のインスタンスによってサポートされる新しいカスタム RSC 環境も定義されます。

## プラグインと環境

### フックで現在の環境にアクセスする

Vite サーバーには共有プラグインパイプラインがありますが、モジュールが処理されるときは常に指定された環境のコンテキストで行われます。`environment` インスタンスは `resolveId`、`load`、`transform` のプラグインコンテキストで利用できます。

プラグインは `environment` インスタンスを次のように使用できます:

- 特定の環境に対してのみロジックを適用する。
- `environment.config` を使用してアクセスできる環境の設定に応じて、動作方法を変更する。例えば vite core resolve プラグインは、`environment.config.resolve.conditions` に基づいて id を解決する方法を変更します。

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

### フックを使用して新しい環境を登録する

プラグインは `config` フックで新しい環境を追加できます:

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

環境を登録するには空のオブジェクトで十分で、デフォルト値はルートレベルの環境設定から取得されます。

### フックを使用した環境の設定

`config` フックが実行されている間、環境の完全なリストはまだ分かっておらず、環境はルートレベルの環境設定からのデフォルト値、または `config.environments` レコードを通して明示的に影響を受ける可能性があります。
プラグインは `config` フックを使ってデフォルト値を設定してください。各環境を設定するには、新しい `configEnvironment` フックを使用します。このフックは、最終的なデフォルト値の解決を含む、部分的に解決された設定を持つ各環境に対して呼び出されます。

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

### `hotUpdate` フック

- **型:** `(this: { environment: DevEnvironment }, options: HotUpdateOptions) => Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>`
- **参照:** [HMR API](./api-hmr)

`hotUpdate` フックを使用すると、プラグインが指定された環境に対してカスタム HMR 更新処理を実行できるようになります。ファイルが変更されると、HMR アルゴリズムは `server.environments` の順番に従って各環境で順に実行されるので、`hotUpdate` フックは複数回呼び出されることになります。このフックは以下のシグネチャを持つコンテキストオブジェクトを受け取ります:

```ts
interface HotUpdateContext {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment` は現在ファイルの更新が処理されているモジュール実行環境です。

- `modules` は、変更されたファイルの影響を受ける、この環境のモジュールの配列です。1 つのファイルが複数のモジュール（Vue SFC など）にマッピングされる可能性があるため、配列になっています。

- `read` はファイルの内容を返す非同期の読み込み関数です。システムによっては、エディターがファイルの更新を終了する前にファイル変更コールバックが高速に実行され、`fs.readFile` が空の内容を返すことがあるためです。渡された読み込み関数はこの動作を正常化します。

フックは以下を選択できます:

- HMR がより正確になるように、影響を受けるモジュールリストをフィルタリングして絞り込む。

- 空の配列を返し、フルリロードを実行する:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // モジュールを手動で無効化
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- 空の配列を返し、カスタムイベントをクライアントに送信することで、完全なカスタム HMR 処理を行う：

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  クライアントコードは [HMR API](./api-hmr) を使って対応するハンドラーを登録する必要があります（これは同じプラグインの `transform` フックによって注入できます）：

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // カスタム更新を実行する
    })
  }
  ```

### 環境ごとのプラグイン

プラグインは `applyToEnvironment` 関数で、適用する環境を定義できます。

```js
const UnoCssPlugin = () => {
  // 共有グローバル状態
  return {
    buildStart() {
      // WeakMap<Environment,Data>, this.environment を使って環境ごとの状態を初期化
    },
    configureServer() {
      // グローバルフックを通常どおり使用
    },
    applyToEnvironment(environment) {
      // このプラグインがこの環境でアクティブになる必要がある場合は true を返します
      // この関数が提供されていない場合、プラグインはすべての環境でアクティブになります
    },
    resolveId(id, importer) {
      // このプラグインが適用される環境に対してのみ呼び出されます
    },
  }
}
```

## `ModuleRunner`

モジュールランナーはターゲットランタイムでインスタンス化されます。次のセクションの全ての API は、特に断りのない限り `vite/module-runner` からインポートされます。このエクスポート・エントリーポイントは可能な限り軽量に保たれており、モジュールランナーを作成するために必要な最小限のものだけがエクスポートされます。

**型シグネチャー:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator,
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * 実行するURL。ルートからの相対的なファイルパス、サーバーパス、ID を受け付けます。
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * HMR リスナーを含むすべてのキャッシュをクリアします。
   */
  public clearCache(): void
  /**
   * すべてのキャッシュをクリアし、すべての HMR リスナーを削除し、ソースマップのサポートをリセットします。
   * このメソッドは HMR 接続を停止しません。
   */
  public async destroy(): Promise<void>
  /**
   * ランナーが `destroy()` メソッドを呼び出して破棄された場合は `true` を返します。
   */
  public isDestroyed(): boolean
}
```

`ModuleRunner` のモジュール評価機能はコードの実行を担当します。Vite は `ESModulesEvaluator` をエクスポートしており、`new AsyncFunction` を使用してコードを評価します。JavaScript ランタイムが安全でない評価をサポートしていない場合は、独自の実装を提供できます。

モジュールランナーは `import` メソッドを公開します。Vite サーバーが `full-reload` HMR イベントをトリガーすると、影響を受けるすべてのモジュールが再実行されます。このとき、モジュールランナーは `exports` オブジェクトを更新しないことに注意してください（上書きされます）。最新の `exports` オブジェクトが必要であれば、 `import` を実行するか、もう一度 `moduleCache` からモジュールを取得する必要があります。

**使用例:**

```js
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner'
import { root, fetchModule } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    root,
    fetchModule,
    // HMR をサポートするために hmr.connection を提供することもできます
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts
export interface ModuleRunnerOptions {
  /**
   * プロジェクトのルート
   */
  root: string
  /**
   * サーバーと通信するための一連のメソッド。
   */
  transport: RunnerTransport
  /**
   * ソースマップの解決方法を設定します。`process.setSourceMapsEnabled` が使用可能な場合は `node` を優先します。
   * それ以外の場合は、デフォルトで `prepareStackTrace` を使用し、`Error.prepareStackTrace` メソッドをオーバーライドします。
   * Vite によって処理されなかったファイルのファイル内容とソースマップの解決方法を設定するオブジェクトを提供できます。
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * HMR を無効にするか、HMR オプションを設定します。
   */
  hmr?:
    | false
    | {
        /**
         * HMR がクライアントとサーバー間で通信する方法を設定します。
         */
        connection: ModuleRunnerHMRConnection
        /**
         * HMR ロガーを設定します。
         */
        logger?: false | HMRLogger
      }
  /**
   * カスタムモジュールキャッシュ。指定されていない場合は、モジュールランナーインスタンスごとに個別のモジュールキャッシュが作成されます。
   */
  moduleCache?: ModuleCacheMap
}
```

## `ModuleEvaluator`

**型シグネチャー:**

```ts
export interface ModuleEvaluator {
  /**
   * Vite によって変換されたコードを評価します。
   * @param context 関数コンテキスト
   * @param code 変換されたコード
   * @param id モジュールを取得するために使用された ID 
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * 外部化されたモジュールを評価します。
   * @param file 外部モジュールへのファイル URL 
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite はデフォルトでこのインターフェイスを実装した `ESModulesEvaluator` をエクスポートします。コードの評価には `new AsyncFunction` を使用するので、インライン化されたソースマップがある場合は、新しい行が追加されたことを考慮して [2 行分のオフセット](https://tc39.es/ecma262/#sec-createdynamicfunction)を追加する必要があります。これはサーバーノード環境で自動的に行われます。ランナーの実装にこの制約がない場合は、（`vite` からエクスポートされている）`fetchModule` を直接使用する必要があります。

## RunnerTransport

**型シグネチャー:**

```ts
interface RunnerTransport {
  /**
   * モジュールに関する情報を取得するメソッド。
   */
  fetchModule: FetchFunction
}
```

RPC 経由または関数を直接呼び出して環境と通信するトランスポートオブジェクト。デフォルトでは、`fetchModule` メソッドでオブジェクトを渡す必要があります。このメソッド内ではどのようなタイプの RPC も使用できますが、Vite では設定を簡単にするために `RemoteRunnerTransport` クラスを使用して双方向のトランスポートインターフェースを公開しています。モジュールランナーがワーカースレッドで作成される次の例のように、サーバー上の `RemoteEnvironmentTransport` インスタンスと合わせる必要があります:

::: code-group

```ts [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import {
  ESModulesEvaluator,
  ModuleRunner,
  RemoteRunnerTransport,
} from 'vite/module-runner'

const runner = new ModuleRunner(
  {
    root: fileURLToPath(new URL('./', import.meta.url)),
    transport: new RemoteRunnerTransport({
      send: (data) => parentPort.postMessage(data),
      onMessage: (listener) => parentPort.on('message', listener),
      timeout: 5000,
    }),
  },
  new ESModulesEvaluator(),
)
```

```ts [server.js]
import { BroadcastChannel } from 'node:worker_threads'
import { createServer, RemoteEnvironmentTransport, DevEnvironment } from 'vite'

function createWorkerEnvironment(name, config, context) {
  const worker = new Worker('./worker.js')
  return new DevEnvironment(name, config, {
    hot: /* custom hot channel */,
    runner: {
      transport: new RemoteEnvironmentTransport({
        send: (data) => worker.postMessage(data),
        onMessage: (listener) => worker.on('message', listener),
      }),
    },
  })
}

await createServer({
  environments: {
    worker: {
      dev: {
        createEnvironment: createWorkerEnvironment,
      },
    },
  },
})
```

:::

`RemoteRunnerTransport` と `RemoteEnvironmentTransport` は一緒に使うことを想定していますが、必ずしも使う必要はありません。独自の関数を定義して、ランナーとサーバー間の通信を行えます。例えば、HTTP リクエストで環境に接続する場合、`fetchModule` 関数で `fetch().json()` を呼び出せます:

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    root: fileURLToPath(new URL('./', import.meta.url)),
    transport: {
      async fetchModule(id, importer) {
        const response = await fetch(
          `http://my-vite-server/fetch?id=${id}&importer=${importer}`,
        )
        return response.json()
      },
    },
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

::: warning サーバー上のモジュールへのアクセス
私たちはサーバーとランナー間の通信を推奨するつもりはありません。`vite.ssrLoadModule` で明らかになった問題の 1 つは、処理されたモジュールの内部でサーバーの状態に依存しすぎていることです。これにより、ユーザー環境がサーバー API にアクセスできない可能性があるため、ランタイムに依存しない SSR を実装することを難しくします。例えば、次のコードは Vite サーバーとユーザーコードが同じコンテキストで実行できることを想定しています:

```ts
const vite = createServer()
const routes = collectRoutes()

const { processRoutes } = await vite.ssrLoadModule('internal:routes-processor')
processRoutes(routes)
```

これでは、サーバーの状態とユーザーの状態が連動しているため、ユーザーコードをプロダクション（たとえばエッジなど）と同じように実行できません。そのため、代わりに仮想モジュールを使って状態をインポートし、ユーザーモジュール内で処理することを推奨します:

```ts
// このコードは別のマシンまたは別のスレッドで実行されます

import { runner } from './ssr-module-runner.js'
import { processRoutes } from './routes-processor.js'

const { routes } = await runner.import('virtual:ssr-routes')
processRoutes(routes)
```

[SSR ガイド](/guide/ssr)にあるようなシンプルなセットアップで、プロダクション環境でサーバーが別のプロセスで実行されることが想定されていない場合なら、`server.transformIndexHtml` を直接使用できます。しかし、サーバーがエッジ環境や別のプロセスで実行される場合は、HTML をロードする仮想モジュールを作成することをお勧めします:

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
          html = await fs.promises.readFile('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = await fs.promises.readFile('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

そして SSR のエントリーポイントで `import('virtual:index-html')` を呼び出すと、処理された HTML を取り出すことができます:

```ts
import { render } from 'framework'

// この例では、cloudflare 構文を使用します
export default {
  async fetch() {
    // 開発時は、変換された HTML を返します
    // ビルド時は、基本的な index.html を文字列にバンドルします
    const { default: html } = await import('virtual:index-html')
    return new Response(render(html), {
      headers: { 'content-type': 'text/html' },
    })
  },
}
```

これにより、HTML 処理はサーバーに依存しなくなります。

:::

## ModuleRunnerHMRConnection

**型シグネチャー:**

```ts
export interface ModuleRunnerHMRConnection {
  /**
   * クライアントにメッセージを送信する前にチェックされます。
   */
  isReady(): boolean
  /**
   * クライアントにメッセージを送信します。
   */
  send(message: string): void
  /**
   * この接続が更新をトリガーしたときに HMR がどのように処理されるかを設定します。
   * このメソッドは、接続が HMR 更新のリッスンを開始し、受信時にこのコールバックを呼び出すことを想定しています。
   */
  onUpdate(callback: (payload: HotPayload) => void): void
}
```

このインターフェイスは HMR 通信の確立方法を定義します。Vite の SSR 中に HMR をサポートするために、Vite は `ServerHMRConnector` をメインエントリーからエクスポートします。`isReady` と `send` メソッドは通常、カスタムイベントがトリガーされたときに呼び出されます（`import.meta.hot.send("my-event")` のように）。

`onUpdate` は、新しいモジュールランナーが初期化されたときに一度だけ呼ばれます。接続が HMR イベントをトリガーしたときに呼び出されるメソッドを渡します。実装は接続の種類（例として、`WebSocket`/`EventEmitter`/`MessageChannel`）に依存しますが、通常は以下のようになります:

```js
function onUpdate(callback) {
  this.connection.on('hmr', (event) => callback(event.data))
}
```

コールバックはキューに入れられ、次の更新を処理する前に現在の更新が解決されるのを待ちます。ブラウザーの実装とは異なり、モジュールランナーにおける HMR の更新は、モジュールを更新する前に、すべてのリスナー（`vite:beforeUpdate`/`vite:beforeFullReload` など）が終了するまで待機します。

## ビルド中の環境

CLI において、`vite build` と `vite build --ssr` を呼び出すと、後方互換性のためにクライアントのみの環境と ssr のみの環境がビルドされます。

`builder.entireApp` が `true` の場合（または `vite build --app` を呼び出した場合）、`vite build` はアプリ全体のビルドを行います。これは将来のメジャーバージョンではデフォルトになる予定です。`ViteBuilder` インスタンス（ビルド時の `ViteDevServer` に相当）が作成され、プロダクション環境用に設定されたすべての環境がビルドされます。デフォルトでは、環境のビルドは `environments` レコードの順番に従って直列に実行されます。フレームワークやユーザーは環境を構築する方法を設定できます:

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

### ビルドフックの環境

開発時と同じように、プラグインフックもビルド時に環境インスタンスを受け取り、`ssr` ブール値を置き換えます。
これは `renderChunk` や `generateBundle` などのビルド専用のフックでも動作します。

### ビルド時の共有プラグイン

Vite 6 以前は、プラグインパイプラインは開発時とビルド時に異なる方法で動作していました:

- **開発時:** プラグインは共有されます
- **ビルド時:** プラグインは環境ごとに分離されます（`vite build` と `vite build --ssr` という別々のプロセスで分離されます）。

このため、フレームワークはファイルシステムに書き込まれたマニフェストファイルを通して `client` ビルドと `ssr` ビルドの間で状態を共有することを余儀なくされていました。Vite 6 では、すべての環境を単一のプロセスでビルドするようになったので、プラグインのパイプラインと環境間通信の方法を開発時と合わせることができるようになりました。

将来のメジャー（Vite 7 または 8）では、完全な整合性を実現することを目指しています:

- **開発時とビルド時:** プラグインは[環境ごとのフィルタリング](#per-environment-plugins)で共有されます

また、ビルド時に共有される `ResolvedConfig` インスタンスは 1 つになり、開発時に `WeakMap<ResolvedConfig, CachedData>` を使っていたのと同じように、アプリのビルドプロセスレベル全体でキャッシュが可能になります。

Vite 6 では、後方互換性を保つために小さなステップを行う必要があります。エコシステムのプラグインは現在、設定へアクセスするために `environment.config.build` ではなく `config.build` を使用しているため、デフォルトでは環境ごとに新しい `ResolvedConfig` を作成する必要があります。プロジェクトは `builder.sharedConfigBuild` を `true` に設定することで、完全な設定とプラグインパイプラインを共有できます。

このオプションは、最初のうちは小さなプロジェクトのサブセットでしか機能しないため、プラグインの作者は `sharedDuringBuild` フラグを `true` に設定することで、特定のプラグインを共有するように選択できます。これにより、通常のプラグインでも簡単に状態を共有できるようになります:

```js
function myPlugin() {
  // 開発環境とビルド環境のすべての環境で状態を共有する
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // すべての環境で単一のインスタンスにオプトインする
    sharedDuringBuild: true,
  }
}
```

## 後方互換性

現在の Vite サーバーAPI はまだ非推奨ではなく、Vite 5 との後方互換性があります。新しい Environment API は実験的なものです。

`server.moduleGraph` はクライアントと ssr のモジュールグラフの混合ビューを返します。後方互換性のある混合モジュールノードがすべてのメソッドから返されます。同じスキームが `handleHotUpdate` に渡されるモジュールノードにも使用されます。

現時点では、Environment API への切り替えはまだお勧めしません。私たちは、プラグインが 2 つのバージョンを維持する必要がないように、ユーザーベースのかなりの部分が Vite 6 を採用することを目標としています。今後の廃止予定とアップグレードパスについては、今後の変更点をチェックしてください:

- [フック内の `this.environment`](/changes/this-environment-in-hooks)
- [HMR `hotUpdate` プラグインフック](/changes/hotupdate-hook)
- [環境ごとの API への移行](/changes/per-environment-apis)
- [`ModuleRunner` API を使った SSR](/changes/ssr-using-modulerunner)
- [ビルド時の共有プラグイン](/changes/shared-plugins-during-build)
