# 環境 API

:::warning 低レベル API
この API の初期研究は、Vite 5.1 で「Vite ランタイム API」という名前で導入されました。このガイドでは、Environment API と改名された改訂版 API について説明します。この API は Vite 6 でリリースされる予定です。すでに最新の `vite@6.0.0-alpha.x` バージョンでテストできます。

リソース:

- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)
- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)

問題を発見したら、お気軽に `v6/environment-api` ブランチに PR を送ってください。提案をテストしてからフィードバックを共有してください。
:::

Vite 6 は環境の概念が形式化され、環境を作成・設定するための新しい API を導入するとともに、一貫した API でオプションやコンテキストユーティリティにアクセスできるようになりました。Vite 2 以降、2 つの暗黙的な環境（`client` と `ssr`）が存在していました。プラグインフックは、最後のオプションパラメーターで `ssr` という真偽値を受け取り、処理される各モジュールのターゲット環境を識別しました。いくつかの API はモジュールを正しい環境に適切に関連付けるために、オプションの最後の `ssr` パラメーターを受け付けていました（例えば `server.moduleGraph.getModuleByUrl(url, { ssr })`）。`ssr` 環境は、クライアント環境に存在するオプションの一部が設定された `config.ssr` を使って設定されました。開発時には、`client` 環境と `ssr` 環境の両方が単一の共有プラグインパイプラインで同時に実行されていました。ビルド時には、各ビルドは新しいプラグインのセットを含む新しい解決済みの設定インスタンスを取得していました。

新しい環境 API はこれら 2 つのデフォルト環境を明示的にするだけでなく、ユーザーが必要な数だけ名前付き環境を作成できるようにします。環境を設定するための統一された方法（`config.environment` を使用）があり、処理中のモジュールに関連する環境オプションとコンテキストユーティリティーは、`this.environment` を使用してプラグインフックでアクセスできます。以前は `ssr` という真偽値を受け取っていた API は適切な環境にスコープされるようになりました（例えば `environment.moduleGraph.getModuleByUrl(url)`）。開発中は、以前と同じようにすべての環境が同時に実行されます。ビルド時には、後方互換性のために、各ビルドは独自の解決された設定インスタンスを取得します。ただし、プラグインやユーザーは共有ビルドパイプラインにオプトインできます。

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

デフォルトの SSR Node モジュールランナーは公開されていません。`createNodeEnvironment` API と `createServerModuleRunner` を一緒に使うことで、同じスレッドでコードを実行し、HMR をサポートし、SSR の実装と衝突しないランナーを作成できます（設定でオーバーライドされている場合）。[SSR セットアップガイド](/guide/ssr#setting-up-the-dev-server)で説明されているように、ミドルウェアモードに設定された Vite サーバーがあるとして、環境 API を使って SSR ミドルウェアを実装してみましょう。エラー処理は省略します。

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

## Environment agnostic SSR

::: info
It isn't clear yet what APIs Vite should provide to cover the most common SSR use cases. We are thinking on releasing the Environment API without an official way to do environment agnostic SSR to let the ecosystem explore common patterns first.
:::

## Separate module graphs

Each environment has an isolated module graph. All module graphs have the same signature, so generic algorithms can be implemented to crawl or query the graph without depending on the environment. `hotUpdate` is a good example. When a file is modified, the module graph of each environment will be used to discover the affected modules and perform HMR for each environment independently.

::: info
Vite v5 had a mixed Client and SSR module graph. Given an unprocessed or invalidated node, it isn't possible to know if it corresponds to the Client, SSR, or both environments. Module nodes have some properties prefixed, like `clientImportedModules` and `ssrImportedModules` (and `importedModules` that returns the union of both). `importers` contains all importers from both the Client and SSR environment for each module node. A module node also has `transformResult` and `ssrTransformResult`. A backward compatibility layer allows the ecosystem to migrate from the deprecated `server.moduleGraph`.
:::

Each module is represented by a `EnvironmentModuleNode` instance. Modules may be registered in the graph without yet being processed (`transformResult` would be `null` in that case). `importers` and `importedModules` are also updated after the module is processed.

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

`environment.moduleGraph` is an instance of `EnvironmentModuleGraph`:

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

## Creating new environments

One of the goals of this feature is to provide a customizable API to process and run code. Users can create new environment types using the exposed primitives.

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

Then users can create a workerd environment to do SSR using:

```js
const ssrEnvironment = createWorkerdEnvironment('ssr', config)
```

## Environment Configuration

Environments are explicitly configured with the `environments` config option.

```js
export default {
  environments: {
    client: {
      resolve: {
        conditions: [], // configure the Client environment
      },
    },
    ssr: {
      dev: {
        optimizeDeps: {}, // configure the SSR environment
      },
    },
    rsc: {
      resolve: {
        noExternal: true, // configure a custom environment
      },
    },
  },
}
```

All environment configs extend from user's root config, allowing users add defaults for all environments at the root level. This is quite useful for the common use case of configuring a Vite client only app, that can be done without going through `environments.client`.

```js
export default {
  resolve: {
    conditions: [], // configure a default for all environments
  },
}
```

The `EnvironmentOptions` interface exposes all the per-environment options. There are `SharedEnvironmentOptions` that apply to both `build` and `dev`, like `resolve`. And there are `DevEnvironmentOptions` and `BuildEnvironmentOptions` for dev and build specific options (like `dev.optimizeDeps` or `build.outDir`).

```ts
interface EnvironmentOptions extends SharedEnvironmentOptions {
  dev: DevOptions
  build: BuildOptions
}
```

As we explained, Environment specific options defined at the root level of user config are used for the default client environment (the `UserConfig` interface extends from the `EnvironmentOptions` interface). And environments can be configured explicitly using the `environments` record. The `client` and `ssr` environments are always present during dev, even if an empty object is set to `environments`. This allows backward compatibility with `server.ssrLoadModule(url)` and `server.moduleGraph`. During build, the `client` environment is always present, and the `ssr` environment is only present if it is explicitly configured (using `environments.ssr` or for backward compatibility `build.ssr`).

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // other options
}
```

::: info

The `ssr` top level property has many options in common with `EnvironmentOptions`. This option was created for the same use case as `environments` but only allowed configuration of a small number of options. We're going to deprecate it in favour of a unified way to define environment configuration.

:::

## Custom environment instances

To create custom dev or build environment instances, you can use the `dev.createEnvironment` or `build.createEnvironment` functions.

```js
export default {
  environments: {
    rsc: {
      dev: {
        createEnvironment(name, config, { watcher }) {
          // Called with 'rsc' and the resolved config during dev
          return createNodeDevEnvironment(name, config, {
            hot: customHotChannel(),
            watcher
          })
        }
      },
      build: {
        createEnvironment(name, config) {
          // Called with 'rsc' and the resolved config during build
          return createNodeBuildEnvironment(name, config)
        }
        outDir: '/dist/rsc',
      },
    },
  },
}
```

The environment will be accessible in middlewares or plugin hooks through `server.environments`. In plugin hooks, the environment instance is passed in the options so they can do conditions depending on the way they are configured.

Environment providers like Workerd, can expose an environment provider for the most common case of using the same runtime for both dev and build environments. The default environment options can also be set so the user doesn't need to do it.

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

Then the config file can be written as

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

In this case we see how the `ssr` environment can be configured to use workerd as it's runtime. Additionally a new custom RSC environment is also defined, backed by a separate instance of the workerd runtime.

## Plugins and environments

### Accessing the current environment in hooks

The Vite server has a shared plugin pipeline, but when a module is processed it is always done in the context of a given environment. The `environment` instance is available in the plugin context of `resolveId`, `load`, and `transform`.

A plugin could use the `environment` instance to:

- Only apply logic for certain environments.
- Change the way they work depending on the configuration for the environment, which can be accessed using `environment.config`. The vite core resolve plugin modifies the way it resolves ids based on `environment.config.resolve.conditions` for example.

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

### Registering new environments using hooks

Plugins can add new environments in the `config` hook:

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

An empty object is enough to register the environment, default values from the root level environment config.

### Configuring environment using hooks

While the `config` hook is running, the complete list of environments isn't yet known and the environments can be affected by both the default values from the root level environment config or explicitly through the `config.environments` record.
Plugins should set default values using the `config` hook. To configure each environment, they can use the new `configEnvironment` hook. This hook is called for each environment with its partially resolved config including resolution of final defaults.

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

### The `hotUpdate` hook

- **Type:** `(this: { environment: DevEnvironment }, options: HotUpdateOptions) => Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>`
- **See also:** [HMR API](./api-hmr)

The `hotUpdate` hook allows plugins to perform custom HMR update handling for a given environment. When a file changes, the HMR algorithm is run for each environment in series according to the order in `server.environments`, so the `hotUpdate` hook will be called multiple times. The hook receives a context object with the following signature:

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

- `this.environment` is the module execution environment where a file update is currently being processed.

- `modules` is an array of modules in this environment that are affected by the changed file. It's an array because a single file may map to multiple served modules (e.g. Vue SFCs).

- `read` is an async read function that returns the content of the file. This is provided because, on some systems, the file change callback may fire too fast before the editor finishes updating the file, and direct `fs.readFile` will return empty content. The read function passed in normalizes this behavior.

The hook can choose to:

- Filter and narrow down the affected module list so that the HMR is more accurate.

- Return an empty array and perform a full reload:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // Invalidate modules manually
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

- Return an empty array and perform complete custom HMR handling by sending custom events to the client:

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

  Client code should register the corresponding handler using the [HMR API](./api-hmr) (this could be injected by the same plugin's `transform` hook):

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // perform custom update
    })
  }
  ```

### Per-environment Plugins

A plugin can define what are the environments it should apply to with the `applyToEnvironment` function.

```js
const UnoCssPlugin = () => {
  // shared global state
  return {
    buildStart() {
      // init per environment state with WeakMap<Environment,Data>, this.environment
    },
    configureServer() {
      // use global hooks normally
    },
    applyToEnvironment(environment) {
      // return true if this plugin should be active in this environment
      // if the function isn't provided, the plugin is active in all environments
    },
    resolveId(id, importer) {
      // only called for environments this plugin apply to
    },
  }
}
```

## `ModuleRunner`

A module runner is instantiated in the target runtime. All APIs in the next section are imported from `vite/module-runner` unless stated otherwise. This export entry point is kept as lightweight as possible, only exporting the minimal needed to create module runners.

**Type Signature:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator,
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL to execute. Accepts file path, server path, or id relative to the root.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Clear all caches including HMR listeners.
   */
  public clearCache(): void
  /**
   * Clears all caches, removes all HMR listeners, and resets source map support.
   * This method doesn't stop the HMR connection.
   */
  public async destroy(): Promise<void>
  /**
   * Returns `true` if the runner has been destroyed by calling `destroy()` method.
   */
  public isDestroyed(): boolean
}
```

The module evaluator in `ModuleRunner` is responsible for executing the code. Vite exports `ESModulesEvaluator` out of the box, it uses `new AsyncFunction` to evaluate the code. You can provide your own implementation if your JavaScript runtime doesn't support unsafe evaluation.

Module runner exposes `import` method. When Vite server triggers `full-reload` HMR event, all affected modules will be re-executed. Be aware that Module Runner doesn't update `exports` object when this happens (it overrides it), you would need to run `import` or get the module from `moduleCache` again if you rely on having the latest `exports` object.

**Example Usage:**

```js
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner'
import { root, fetchModule } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    root,
    fetchModule,
    // you can also provide hmr.connection to support HMR
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts
export interface ModuleRunnerOptions {
  /**
   * Root of the project
   */
  root: string
  /**
   * A set of methods to communicate with the server.
   */
  transport: RunnerTransport
  /**
   * Configure how source maps are resolved. Prefers `node` if `process.setSourceMapsEnabled` is available.
   * Otherwise it will use `prepareStackTrace` by default which overrides `Error.prepareStackTrace` method.
   * You can provide an object to configure how file contents and source maps are resolved for files that were not processed by Vite.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Disable HMR or configure HMR options.
   */
  hmr?:
    | false
    | {
        /**
         * Configure how HMR communicates between the client and the server.
         */
        connection: ModuleRunnerHMRConnection
        /**
         * Configure HMR logger.
         */
        logger?: false | HMRLogger
      }
  /**
   * Custom module cache. If not provided, it creates a separate module cache for each module runner instance.
   */
  moduleCache?: ModuleCacheMap
}
```

## `ModuleEvaluator`

**Type Signature:**

```ts
export interface ModuleEvaluator {
  /**
   * Evaluate code that was transformed by Vite.
   * @param context Function context
   * @param code Transformed code
   * @param id ID that was used to fetch the module
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * evaluate externalized module.
   * @param file File URL to the external module
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite exports `ESModulesEvaluator` that implements this interface by default. It uses `new AsyncFunction` to evaluate code, so if the code has inlined source map it should contain an [offset of 2 lines](https://tc39.es/ecma262/#sec-createdynamicfunction) to accommodate for new lines added. This is done automatically in the server node environment. If your runner implementation doesn't have this constraint, you should use `fetchModule` (exported from `vite`) directly.

## RunnerTransport

**Type Signature:**

```ts
interface RunnerTransport {
  /**
   * A method to get the information about the module.
   */
  fetchModule: FetchFunction
}
```

Transport object that communicates with the environment via an RPC or by directly calling the function. By default, you need to pass an object with `fetchModule` method - it can use any type of RPC inside of it, but Vite also exposes bidirectional transport interface via a `RemoteRunnerTransport` class to make the configuration easier. You need to couple it with the `RemoteEnvironmentTransport` instance on the server like in this example where module runner is created in the worker thread:

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

`RemoteRunnerTransport` and `RemoteEnvironmentTransport` are meant to be used together, but you don't have to use them at all. You can define your own function to communicate between the runner and the server. For example, if you connect to the environment via an HTTP request, you can call `fetch().json()` in `fetchModule` function:

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

::: warning Acessing Module on the Server
We do not want to encourage communication between the server and the runner. One of the problems that was exposed with `vite.ssrLoadModule` is over-reliance on the server state inside the processed modules. This makes it harder to implement runtime-agnostic SSR since user environment might have no access to server APIs. For example, this code assumes that Vite server and user code can run in the same context:

```ts
const vite = createServer()
const routes = collectRoutes()

const { processRoutes } = await vite.ssrLoadModule('internal:routes-processor')
processRoutes(routes)
```

This makes it impossible to run user code in the same way it might run in production (for example, on the edge) because the server state and user state are coupled. So instead, we recommend using virtual modules to import the state and process it inside the user module:

```ts
// this code runs on another machine or in another thread

import { runner } from './ssr-module-runner.js'
import { processRoutes } from './routes-processor.js'

const { routes } = await runner.import('virtual:ssr-routes')
processRoutes(routes)
```

Simple setups like in [SSR Guide](/guide/ssr) can still use `server.transformIndexHtml` directly if it's not expected that the server will run in a different process in production. However, if the server will run in an edge environment or a separate process, we recommend creating a virtual module to load HTML:

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

Then in SSR entry point you can call `import('virtual:index-html')` to retrieve the processed HTML:

```ts
import { render } from 'framework'

// this example uses cloudflare syntax
export default {
  async fetch() {
    // during dev, it will return transformed HTML
    // during build, it will bundle the basic index.html into a string
    const { default: html } = await import('virtual:index-html')
    return new Response(render(html), {
      headers: { 'content-type': 'text/html' },
    })
  },
}
```

This keeps the HTML processing server agnostic.

:::

## ModuleRunnerHMRConnection

**Type Signature:**

```ts
export interface ModuleRunnerHMRConnection {
  /**
   * Checked before sending messages to the client.
   */
  isReady(): boolean
  /**
   * Send a message to the client.
   */
  send(message: string): void
  /**
   * Configure how HMR is handled when this connection triggers an update.
   * This method expects that the connection will start listening for HMR updates and call this callback when it's received.
   */
  onUpdate(callback: (payload: HotPayload) => void): void
}
```

This interface defines how HMR communication is established. Vite exports `ServerHMRConnector` from the main entry point to support HMR during Vite SSR. The `isReady` and `send` methods are usually called when the custom event is triggered (like, `import.meta.hot.send("my-event")`).

`onUpdate` is called only once when the new module runner is initiated. It passed down a method that should be called when connection triggers the HMR event. The implementation depends on the type of connection (as an example, it can be `WebSocket`/`EventEmitter`/`MessageChannel`), but it usually looks something like this:

```js
function onUpdate(callback) {
  this.connection.on('hmr', (event) => callback(event.data))
}
```

The callback is queued and it will wait for the current update to be resolved before processing the next update. Unlike the browser implementation, HMR updates in a module runner will wait until all listeners (like, `vite:beforeUpdate`/`vite:beforeFullReload`) are finished before updating the modules.

## Environments during build

In the CLI, calling `vite build` and `vite build --ssr` will still build the client only and ssr only environments for backward compatibility.

When `builder.entireApp` is `true` (or when calling `vite build --app`), `vite build` will opt-in into building the entire app instead. This would later on become the default in a future major. A `ViteBuilder` instance will be created (build-time equivalent to a `ViteDevServer`) to build all configured environments for production. By default the build of environments is run in series respecting the order of the `environments` record. A framework or user can further configure how the environments are built using:

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

### Environment in build hooks

In the same way as during dev, plugin hooks also receive the environment instance during build, replacing the `ssr` boolean.
This also works for `renderChunk`, `generateBundle`, and other build only hooks.

### Shared plugins during build

Before Vite 6, the plugins pipelines worked in a different way during dev and build:

- **During dev:** plugins are shared
- **During Build:** plugins are isolated for each environment (in different processes: `vite build` then `vite build --ssr`).

This forced frameworks to share state between the `client` build and the `ssr` build through manifest files written to the file system. In Vite 6, we are now building all environments in a single process so the way the plugins pipeline and inter-environment communication can be aligned with dev.

In a future major (Vite 7 or 8), we aim to have complete alignment:

- **During both dev and build:** plugins are shared, with [per-environment filtering](#per-environment-plugins)

There will also be a single `ResolvedConfig` instance shared during build, allowing for caching at entire app build process level in the same way as we have been doing with `WeakMap<ResolvedConfig, CachedData>` during dev.

For Vite 6, we need to do a smaller step to keep backward compatibility. Ecosystem plugins are currently using `config.build` instead of `environment.config.build` to access configuration, so we need to create a new `ResolvedConfig` per environment by default. A project can opt-in into sharing the full config and plugins pipeline setting `builder.sharedConfigBuild` to `true`.

This option would only work of a small subset of projects at first, so plugin authors can opt-in for a particular plugin to be shared by setting the `sharedDuringBuild` flag to `true`. This allows for easily sharing state both for regular plugins:

```js
function myPlugin() {
  // Share state among all environments in dev and build
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // Opt-in into a single instance for all environments
    sharedDuringBuild: true,
  }
}
```

## Backward Compatibility

The current Vite server API are not yet deprecated and are backward compatible with Vite 5. The new Environment API is experimental.

The `server.moduleGraph` returns a mixed view of the client and ssr module graphs. Backward compatible mixed module nodes will be returned from all its methods. The same scheme is used for the module nodes passed to `handleHotUpdate`.

We don't recommend switching to Environment API yet. We are aiming for a good portion of the user base to adopt Vite 6 before so plugins don't need to maintain two versions. Checkout the future breaking changes section for information on future deprecations and upgrade path:

- [`this.environment` in Hooks](/changes/this-environment-in-hooks)
- [HMR `hotUpdate` Plugin Hook](/changes/hotupdate-hook)
- [Move to per-environment APIs](/changes/per-environment-apis)
- [SSR using `ModuleRunner` API](/changes/ssr-using-modulerunner)
- [Shared plugins during build](/changes/shared-plugins-during-build)
