# Vite ランタイム API

:::warning 低レベル API
この API は Vite 5.1 で実験的機能として導入されました。[フィードバックの収集](https://github.com/vitejs/vite/discussions/15774)に追加されています。おそらく Vite 5.2 で破壊的な変更があるため、使用する場合は Vite のバージョンを `~5.1.0` に固定するようにしてください。この機能は、ライブラリやフレームワークの作者向けの低レベル API です。アプリケーションを作ることが目的なら、はじめに高レベルの SSR プラグインと [Awesome Vite SSR section](https://github.com/vitejs/awesome-vite#ssr) にあるツールを確認してください。
:::

「Vite ランタイム」は、はじめに Vite プラグインで処理することにより、任意のコードを実行できるようにするツールです。ランタイムの実装がサーバーから分離されているため、`server.ssrLoadModule` とは異なります。これにより、ライブラリやフレームワークの作者は、サーバーとランタイム間に独自の通信レイヤーを実装できるようになります。

この機能の目的の 1 つは、カスタマイズ可能な API を提供して、コードを処理・実行できるようにすることです。Vite は、Vite ランタイムをデフォルトで使えるようにするための十分なツールを提供していますが、Vite のビルトインの実装がユーザーニーズに合わない場合には、ユーザーがそれをベースに構築することができます。

すべての API は、インポート不可であると明示されていない限り `vite/runtime` からインポートできます。

## `ViteRuntime`

**型シグネチャー:**

```ts
export class ViteRuntime {
  constructor(
    public options: ViteRuntimeOptions,
    public runner: ViteModuleRunner,
    private debug?: ViteRuntimeDebugger,
  ) {}
  /**
   * 実行する URL。ルートから相対的なファイルパス、サーバーパス、または id を受け取ります。
   */
  public async executeUrl<T = any>(url: string): Promise<T>
  /**
   * 実行するエントリーポイントの URL。ルートから相対的なファイルパス、サーバーパス、または id を受け取ります。
   * HMR により完全なリロードがトリガーされた場合、このモジュールがリロードされます。
   * このメソッドが複数回実行された場合、すべてのエントリーポイントは1度に1つずつリロードされます。
   */
  public async executeEntrypoint<T = any>(url: string): Promise<T>
  /**
   * HMR リスナーを含むすべてのキャッシュをクリアします。
   */
  public clearCache(): void
  /**
   * すべてのキャッシュをクリアし、すべての HMR リスナーを削除し、ソースマップのサポートをリセットします。
   * このメソッドは HMR コネクションを停止しません。
   */
  public async destroy(): Promise<void>
  /**
   * `destroy()` メソッドの呼び出しによりランタイムが破棄された場合に `true` を返します。
   */
  public isDestroyed(): boolean
}
```

::: tip 高度な使用方法
`server.ssrLoadModule` からマイグレーションしたばかりで HMR をサポートしたい場合は、代わりに [`createViteRuntime`](#createviteruntime) を使用することを検討してください。
:::

`ViteRuntime` クラスは、初期化時に `root` と `fetchModule` オプションを必要とします。Vite SSR とのインテグレーションを簡単にするため、Vite は `ssrFetchModule` を [`server`](/guide/api-javascript) インスタンス上に公開しています。Vite はメインエントリーポイントから `fetchModule` もエクスポートしています。`new Function` を使用してコードを実行することが期待されている `ssrFetchModule` とは異なり、コードの実行方法については何の前提もありません。このことは、これらの関数が返すソースマップで確認できます。

`ViteRuntime` 内のランナーには、コードを実行する責務があります。Vite はデフォルトで `ESModulesRunner` をエクスポートしており、コードの実行に `new AsyncFunction` を使用します。もし JavaScript ランタイムが安全ではない評価をサポートしていない場合は、自分自身の実装を提供できます。

ランタイムが公開している主な 2 つのメソッドは、`executeUrl` と `executeEntrypoint` です。メソッド間の唯一の違いは、HMR が `full-reload` イベントをトリガーした場合に、`executeEntrypoint` によって実行されるすべてのモジュールが再実行されるという点です。このとき、Vite ランタイムは `exports` オブジェクトを更新しないことに注意してください（上書きします）。最新の `exports` オブジェクトがあることに依存する場合は、再度 `executeUrl` を実行するか、`moduleCache` からモジュールを取得する必要があります。

**使用例:**

```js
import { ViteRuntime, ESModulesRunner } from 'vite/runtime'
import { root, fetchModule } from './rpc-implementation.js'

const runtime = new ViteRuntime(
  {
    root,
    fetchModule,
    // HMR をサポートするために hmr.connection も提供できます
  },
  new ESModulesRunner(),
)

await runtime.executeEntrypoint('/src/entry-point.js')
```

## `ViteRuntimeOptions`

```ts
export interface ViteRuntimeOptions {
  /**
   * プロジェクトのルート
   */
  root: string
  /**
   * モジュールの情報を取得するためのメソッド。
   * SSR の場合、Vite はここで指定できる `server.ssrFetchModule` 関数を公開します。
   * 他のランタイムのユースケースの場合、メインエントリーポイントから `fetchModule` も公開します。
   */
  fetchModule: FetchFunction
  /**
   * ソースマップの解決方法を設定します。`process.setSourceMapsEnabled` が利用可能な場合は `node` を優先します。それ以外の場合は、デフォルトで `Error.prepareStackTrace` メソッドをオーバーライドする `prepareStackTrace` を使用します。
   * オブジェクトを提供すると、Vite によって処理されなかったファイルに対する、ファイルコンテンツとソースマップの解決方法を設定できます。
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * HMR を無効化するか、HMR オプションを設定します。
   */
  hmr?:
    | false
    | {
        /**
         * HMR がクラインアントとサーバー間で通信する方法を設定します。
         */
        connection: HMRRuntimeConnection
        /**
         * HMR ロガーを設定します。
         */
        logger?: false | HMRLogger
      }
  /**
   * カスタムのモジュールキャッシュ。指定しない場合、ViteRuntime インスタンスごとに別のモジュールキャッシュを作成します。
   */
  moduleCache?: ModuleCacheMap
}
```

## `ViteModuleRunner`

**型シグネチャー:**

```ts
export interface ViteModuleRunner {
  /**
   * Vite によって変換されたコードを実行します。
   * @param context 関数のコンテキスト
   * @param code 変換されたコード
   * @param id モジュールをフェッチするために使われる ID
   */
  runViteModule(
    context: ViteRuntimeModuleContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * 外部化されたモジュールを実行します。
   * @param file 外部モジュールのファイルの URL
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite は、このインターフェイスを実行している `ESModulesRunner` をデフォルトでエクスポートします。コードの実行に `new AsyncFunction` を使用するため、コードがソースマップをインライン化している場合、新しく追加される行に対応するために、[2行のオフセット](https://tc39.es/ecma262/#sec-createdynamicfunction)を含む必要があります。これは `server.ssrFetchModule` によって自動的に行われます。もし自分のランナー実装にこの制約がない場合は、（`vite` からエクスポートされた）`fetchModule` を直接使用する必要があります。

## HMRRuntimeConnection

**型シグネチャー:**

```ts
export interface HMRRuntimeConnection {
  /**
   * メッセージをクライアントに送信する前にチェックされます。
   */
  isReady(): boolean
  /**
   * メッセージをクライアントに送信します。
   */
  send(message: string): void
  /**
   * このコネクションが更新をトリガーするときの HMR のハンドリング方法を設定します。
   * このメソッドは、コネクションが HMR の更新のリッスンを開始し、受信時にこのコールバックを呼び出すことを期待します。
   */
  onUpdate(callback: (payload: HMRPayload) => void): void
}
```

このインターフェイスは HMR の通信の確立方法を定義します。Vite は Vite SSR 中の HMR をサポートするために、`ServerHMRConnector` をメインエントリーポイントからエクスポートしています。`isReady` と `send` メソッドは通常、カスタムイベントがトリガーされたときに呼ばれます（たとえば、`import.meta.hot.send("my-event")`）。

`onUpdate` は、新しいランタイムが初期化されたときに 1 回だけ呼び出されます。コネクションが HMR イベントをトリガーするときに呼ばれるメソッドが渡されます。実装はコネクションの種類に依存しますが（例として `WebSocket`/`EventEmitter`/`MessageChannel` などがある）、メソッドは通常次のような形になります:

```js
function onUpdate(callback) {
  this.connection.on('hmr', (event) => callback(event.data))
}
```

コールバックはキューに追加され、次の更新が処理される前に、現在の更新が解決されるまで待ちます。ブラウザーの実装とは違い、Vite ランタイム内の HMR の更新は、モジュールの更新前にすべてのリスナー（`vite:beforeUpdate`/`vite:beforeFullReload` など）が完了するまで待機します。

## `createViteRuntime`

**型シグネチャー:**

```ts
async function createViteRuntime(
  server: ViteDevServer,
  options?: MainThreadRuntimeOptions,
): Promise<ViteRuntime>
```

**使用例:**

```js
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

;(async () => {
  const server = await createServer({
    root: __dirname,
  })
  await server.listen()

  const runtime = await createViteRuntime(server)
  await runtime.executeEntrypoint('/src/entry-point.js')
})()
```

このメソッドは `server.ssrLoadModule` の簡単な代替として機能します。`ssrLoadModule` とは違い、`createViteRuntime` はデフォルトで HMR のサポートを提供します。[`options`](#mainthreadruntimeoptions) を渡すことで、ニーズに合わせて SSR ランタイムの振る舞いをカスタマイズできます。

## `MainThreadRuntimeOptions`

```ts
export interface MainThreadRuntimeOptions
  extends Omit<ViteRuntimeOptions, 'root' | 'fetchModule' | 'hmr'> {
  /**
   * HMR を無効化するか、HMR ロガーを設定します。
   */
  hmr?:
    | false
    | {
        logger?: false | HMRLogger
      }
  /**
   * カスタムのモジュールランナーを提供します。これによりコードの実行方法を制御します。
   */
  runner?: ViteModuleRunner
}
```
