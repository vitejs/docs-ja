# JavaScript API

Vite の JavaScript API は完全に型付けされているので、自動補完とバリデーションを活用するために VS Code の JS 型チェックを有効にするか、TypeScript を使用することをおすすめします。

## `createServer`

**型シグネチャー:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**使用例:**

```js
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

;(async () => {
  const server = await createServer({
    // 有効なユーザー設定オプションに `mode` と `configFile` を追加
    configFile: false,
    root: __dirname,
    server: {
      port: 1337,
    },
  })
  await server.listen()

  server.printUrls()
  server.bindCLIShortcuts({ print: true })
})()
```

::: tip 注意
同じ Node.js プロセス内で `createServer` と `build` を使用する場合、どちらの関数も `process.env.NODE_ENV` に依存して正しく動作しますが、これは `mode` 設定オプションに依存します。 矛盾した挙動にならないよう、`process.env.NODE_ENV` または 2 つの API の `mode` を `development` に設定します。もしくは、子プロセスを生成して、2 つの API を別々に実行することができます。
:::

::: tip 注意
[ミドルウェアモード](/config/server-options.html#server-middlewaremode)と [WebSocket のプロキシ設定](/config/server-options.html#server-proxy)を組み合わせて使用する場合、プロキシを正しくバインドするには `middlewareMode` で親 http サーバーを指定する必要があります。

<details>
<summary>Example</summary>

```ts
import http from 'http'
import { createServer } from 'vite'

const parentServer = http.createServer() // もしくは express や koa など

const vite = await createServer({
  server: {
    // ミドルウェアモードを有効化
    middlewareMode: {
      // プロキシ WebSocket 用の親 http サーバーを提供
      server: parentServer,
    },
  },
  proxy: {
    '/ws': {
      target: 'ws://localhost:3000',
      // WebSocket をプロキシ
      ws: true,
    },
  },
})

parentServer.use(vite.middlewares)
```

</details>
:::

## `InlineConfig`

`InlineConfig` インターフェイスは、追加のプロパティで `UserConfig` を拡張します:

- `configFile`: 使用する設定ファイルを指定します。設定されていない場合、Vite はプロジェクトルートからファイルを自動的に解決しようとします。自動解決を無効にするには `false` に設定します。
- `envFile`: `.env` ファイルを無効にするには `false` に設定します。

## `ResolvedConfig`

`ResolvedConfig` インターフェイスは、`UserConfig` の同一のすべてのプロパティを持ちます。ただし、ほとんどの値は解決済みで undefined ではありません。次のようなユーティリティーも含んでいます:

- `config.assetsInclude`: `id` がアセットとしてみなされるかどうかをチェックする関数。
- `config.logger`: Vite の内部的なロガーオブジェクト。

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * 解決された Vite の設定オブジェクト。
   */
  config: ResolvedConfig
  /**
   * 接続アプリのインスタンス
   * - 開発サーバーにカスタムミドルウェアを追加するために使用できます。
   * - カスタム HTTP サーバーのハンドラー関数として、もしくは任意の接続スタイルの
   *   Node.js フレームワークのミドルウェアとして使用することもできます。
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * ネイティブの Node HTTP サーバーインスタンス。
   * ミドルウェアモードでは null になります。
   */
  httpServer: http.Server | null
  /**
   * chokidar watcher のインスタンス。`config.server.watch` が `null` に
   * 設定されている場合、何もしないイベントエミッターを返します。
   * https://github.com/paulmillr/chokidar#api
   */
  watcher: FSWatcher
  /**
   * `send(payload)` メソッドを持つ WebSocket サーバー。
   */
  ws: WebSocketServer
  /**
   * 指定したファイル上でプラグインフックを実行できる Rollup プラグインコンテナー。
   */
  pluginContainer: PluginContainer
  /**
   * インポートの関係、URL からファイルへのマッピング、HMR の状態を追跡する
   * モジュールグラフ。
   */
  moduleGraph: ModuleGraph
  /**
   * Vite が CLI に表示する解決済みの URL。ミドルウェアモードの場合や `server.listen` が
   * 呼び出される前は null になります。
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * プログラムで URL を解決、読込、変換して、HTTP リクエストパイプラインを
   * 経由せずに結果を取得します。
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Vite の組み込み HTML 変換と、プラグイン HTML 変換を適用します。
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * 指定された URL を SSR 用にインスタンス化されたモジュールとして読み込みます。
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * SSR のエラースタックトレースを修正します。
   */
  ssrFixStacktrace(e: Error): void
  /**
   * モジュールグラフにあるモジュールに対して HMR をトリガーします。server.moduleGraph` API を使用して、
   * リロードするモジュールを取得できます。`hmr` が false の場合、このコマンドは実行されません。
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * サーバーを起動します。
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * サーバーを再起動します。
   *
   * @param forceOptimize - オプティマイザーに再バンドルを強制する。--force cliフラグと同じ
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * サーバーを停止します。
   */
  close(): Promise<void>
  /**
   * CLI ショートカットをバインドします。
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * `await server.waitForRequestsIdle(id)` を呼ぶと、すべての静的インポートが処理されるまで待ちます。
   * load または transform プラグインフックから呼ばれた場合は、デッドロックを避けるために id を引数として
   * 渡す必要があります。モジュールグラフの最初の静的インポートセクションが処理された後にこの関数を呼んだ場合、
   * 即座に解決されます。
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` は、Vite 開発サーバーのオンデマンドな性質に従うと実装できない機能の DX を改善するためのエスケープハッチとして使われることを目的としています。起動時に Tailwind などのツールで使用することで、アプリのコードが見えるようになるまでアプリの CSS クラスの生成を遅延させて、スタイル変更によるフラッシュを避けることができます。この関数が load または transform フック内で使用され、デフォルトの HTTP1 サーバーが使用された場合、6 つの HTTP チャンネルのうち 1 つは、サーバーがすべての静的インポートを処理するまでブロックされます。Vite の依存関係オプティマイザーは現在この関数を使用して、事前バンドルされた依存関係をすべてのインポートされた依存関係が静的インポートされたソースから収集されるまで遅延させることにより、見つからない依存関係上でのページ全体のリロードを防いでいます。Vite の将来のメジャーリリースでは、大規模なアプリケーションでコールドスタート中に性能低下を防ぐために、デフォルトで `optimizeDeps.crawlUntilStaticImports: false` に設定して、異なる戦略に切り替えるかもしれません。
:::

## `build`

**型シグネチャー:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**使用例:**

```js
import path from 'path'
import { fileURLToPath } from 'url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

;(async () => {
  await build({
    root: path.resolve(__dirname, './project'),
    base: '/foo/',
    build: {
      rollupOptions: {
        // ...
      },
    },
  })
})()
```

## `preview`

**型シグネチャー:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**使用例:**

```js
import { preview } from 'vite'
;(async () => {
  const previewServer = await preview({
    // 有効なユーザー設定オプションに加え、`mode` と `configFile`
    preview: {
      port: 8080,
      open: true,
    },
  })

  previewServer.printUrls()
  previewServer.bindCLIShortcuts({ print: true })
})()
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * 解決された vite config オブジェクト
   */
  config: ResolvedConfig
  /**
   * connect アプリのインスタンス。
   * - プレビューサーバーにカスタムミドルウェアをアタッチするために使用できます。
   * - カスタム http サーバーのハンドラー関数として、もしくは connect スタイルの
   *   Node.js フレームワークのミドルウェアとしても使用可能
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * ネイティブの Node http サーバーインスタンス
   */
  httpServer: http.Server
  /**
   * Vite が CLI に表示する解決済みURL
   * サーバーがリッスンする前は null
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * サーバーの URL を表示
   */
  printUrls(): void
  /**
   * CLI ショートカットをバインドする
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**型シグネチャー:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

`command` の値は dev と preview では `serve`、build では `build` になります。

## `mergeConfig`

**型シグネチャー:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

2 つの Vite の設定をディープマージします。`isRoot` はマージされる Vite の設定内の階層を表します。例えば、2 つの `build` オプションをマージする場合は `false` にします。

::: tip 注意
`mergeConfig` はオブジェクト形式の設定のみを受け付けます。コールバック形式の設定がある場合は、 `mergeConfig` に渡す前にコールバックを呼び出す必要があります。

`defineConfig` ヘルパーを使うと、コールバック形式の設定を別の設定にマージすることができます。

```ts
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**型シグネチャー:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**関連:** [server.fs.allow](/config/server-options.md#server-fs-allow)

条件を満せば、ワークスペースの候補のルートを検索します。そうでなければ、`root` にフォールバックします:

- `package.json` に `workspaces` フィールドが含まれている
- 以下のいずれかのファイルを含んでいる
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**型シグネチャー:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**関連:** [`.env` ファイル](./env-and-mode.md#env-files)

`envDir` 内の `.env` ファイルを読み込みます。デフォルトでは `prefixes` が変更されない限り、`VITE_` のプレフィックスのある環境変数のみが読み込まれます。

## `normalizePath`

**型シグネチャー:**

```ts
function normalizePath(id: string): string
```

**関連:** [Path Normalization](./api-plugin.md#path-normalization)

Vite プラグイン間で相互運用するためにパスを正規化します。

## `transformWithEsbuild`

**型シグネチャー:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

esbuild で JavaScript か TypeScript を変換します。Vite の内部での esbuild の変換に合わせたいプラグインにとって有用です。

## `loadConfigFromFile`

**型シグネチャー:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

esbuild で Vite の設定ファイルを手動で読み込みます。
