# JavaScript API

Vite の JavaScript API は完全に型付けされているので、自動補完とバリデーションを活用するために VSCode の JS 型チェックを有効にするか、TypeScript を使用することをおすすめします。

## `createServer`

**型シグネチャ:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**使用例:**

```js
const { createServer } = require('vite')

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

## `InlineConfig`

`InlineConfig` インタフェイスは、追加のプロパティで `UserConfig` を拡張します:

- `configFile`: 使用する設定ファイルを指定します。設定されていない場合、Vite はプロジェクトルートからファイルを自動的に解決しようとします。自動解決を無効にするには `false` に設定します。
- `envFile`: `.env` ファイルを無効にするには `false` に設定します。

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
const path = require('path')
const { build } = require('vite')

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

**実験的機能**

**型シグネチャ:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**使用例:**

```js
const { preview } = require('vite')

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
  defaultMode?: string
): Promise<ResolvedConfig>
```

`command` の値は、開発時（CLI で `vite`、`vite dev`、`vite serve` がエイリアス）は `serve` になります。

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
