# JavaScript API

Vite の JavaScript API は完全に型付けされているので、自動補完とバリデーションを活用するために VS Code の JS 型チェックを有効にするか、TypeScript を使用することをおすすめします。

## `createServer`

**型シグネチャ:**

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
    // 有効なユーザ設定オプションに `mode` と `configFile` を追加
    configFile: false,
    root: __dirname,
    server: {
      port: 1337
    }
  })
  await server.listen()

  server.printUrls()
})()
```

::: tip 注意
同じ Node.js プロセス内で `createServer` と `build` を使用する場合、どちらの関数も `process.env.`<wbr>`NODE_ENV` に依存して正しく動作しますが、これは `mode` 設定オプションに依存します。 矛盾した挙動にならないよう、`process.env.`<wbr>`NODE_ENV` または 2 つの API の `mode` を `development` に設定します。もしくは、子プロセスを生成して、2 つの API を別々に実行することができます。
:::

## `InlineConfig`

`InlineConfig` インタフェイスは、追加のプロパティで `UserConfig` を拡張します:

- `configFile`: 使用する設定ファイルを指定します。設定されていない場合、Vite はプロジェクトルートからファイルを自動的に解決しようとします。自動解決を無効にするには `false` に設定します。
- `envFile`: `.env` ファイルを無効にするには `false` に設定します。

## `ResolvedConfig`

`ResolvedConfig` インタフェイスは、`UserConfig` の同一のすべてのプロパティを持ちます。ただし、ほとんどの値は解決済みで undefined ではありません。次のようなユーティリティも含んでいます:

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
   * - 開発サーバにカスタムミドルウェアを追加するために使用できます。
   * - カスタム HTTP サーバのハンドラ関数として、もしくは任意の接続スタイルの
   *   Node.js フレームワークのミドルウェアとして使用することもできます。
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * ネイティブの Node HTTP サーバインスタンス。
   * ミドルウェアモードでは null になります。
   */
  httpServer: http.Server | null
  /**
   * chokidar watcher のインスタンス。
   * https://github.com/paulmillr/chokidar#api
   */
  watcher: FSWatcher
  /**
   * `send(payload)` メソッドを持つ WebSocket サーバ。
   */
  ws: WebSocketServer
  /**
   * 指定したファイル上でプラグインフックを実行できる Rollup プラグインコンテナ。
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
    options?: TransformOptions
  ): Promise<TransformResult | null>
  /**
   * Vite の組み込み HTML 変換と、プラグイン HTML 変換を適用します。
   */
  transformIndexHtml(url: string, html: string): Promise<string>
  /**
   * 指定された URL を SSR 用にインスタンス化されたモジュールとして読み込みます。
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean }
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
   * サーバを起動します。
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * サーバを再起動します。
   *
   * @param forceOptimize - オプティマイザに再バンドルを強制する。--force cliフラグと同じ
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * サーバを停止します。
   */
  close(): Promise<void>
}
```

## `build`

**型シグネチャ:**

```ts
async function build(
  inlineConfig?: InlineConfig
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
      }
    }
  })
})()
```

## `preview`

**型シグネチャ:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**使用例:**

```js
import { preview } from 'vite'
;(async () => {
  const previewServer = await preview({
    // 有効なユーザ設定オプションに加え、`mode` と `configFile`
    preview: {
      port: 8080,
      open: true
    }
  })

  previewServer.printUrls()
})()
```

## `resolveConfig`

**型シグネチャ:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development'
): Promise<ResolvedConfig>
```

`command` の値は、開発時（CLI で `vite`、`vite dev`、`vite serve` がエイリアス）は `serve` になります。

## `mergeConfig`

**型シグネチャ:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true
): Record<string, any>
```

2 つの Vite の設定をディープマージします。`isRoot` はマージされる Vite の設定内の階層を表します。例えば、2 つの `build` オプションをマージする場合は `false` にします。

## `searchForWorkspaceRoot`

**型シグネチャ:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current)
): string
```

**関連:** [server.fs.allow](/config/server-options.md#server-fs-allow)

条件を満せば、ワークスペースの候補のルートを検索します。そうでなければ、`root` にフォールバックします:

- `package.json` に `workspaces` フィールドが含まれている
- 以下のいずれかのファイルを含んでいる
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**型シグネチャ:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_'
): Record<string, string>
```

**関連:** [`.env` Files](./env-and-mode.md#env-files)

`envDir` 内の `.env` ファイルを読み込みます。デフォルトでは `prefixes` が変更されない限り、`VITE_` のプレフィックスのある環境変数のみが読み込まれます。

## `normalizePath`

**型シグネチャ:**

```ts
function normalizePath(id: string): string
```

**関連:** [Path Normalization](./api-plugin.md#path-normalization)

Vite プラグイン間で相互運用するためにパスを正規化します。

## `transformWithEsbuild`

**型シグネチャ:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object
): Promise<ESBuildTransformResult>
```

esbuild で JavaScript か TypeScript を変換します。Vite の内部での esbuild の変換に合わせたいプラグインにとって有用です。

## `loadConfigFromFile`

**型シグネチャ:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

esbuild で Vite の設定ファイルを手動で読み込みます。
