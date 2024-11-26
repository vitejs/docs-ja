# ランタイム向けの Environment API

:::warning 実験的機能
この API の初期研究は、Vite 5.1 で「Vite ランタイム API」という名前で導入されました。このガイドでは、Environment API と改名された改訂版 API について説明します。この API は Vite 6 で実験的機能としてリリースされる予定です。すでに最新の `vite@6.0.0-beta.x` バージョンでテストできます。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

この提案をテストする際には、ぜひフィードバックをお寄せください。
:::

## 環境ファクトリー {#environment-factories}

環境ファクトリーは、エンドユーザーではなく、Cloudflare などの環境プロバイダーによって実装されることを目的としています。環境ファクトリーは、開発環境とビルド環境の両方でターゲットランタイムを使用する最も一般的なケースで、`EnvironmentOptions` を返します。デフォルトの環境オプションも設定できるため、ユーザーが設定する必要はありません。

```ts
function createWorkerdEnvironment(
  userConfig: EnvironmentOptions,
): EnvironmentOptions {
  return mergeConfig(
    {
      resolve: {
        conditions: [
          /*...*/
        ],
      },
      dev: {
        createEnvironment(name, config) {
          return createWorkerdDevEnvironment(name, config, {
            hot: true,
            transport: customHotChannel(),
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

設定ファイルは次のように記述できます:

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
  },
}
```

フレームワークは次のコードを使用して、workerd ランタイム環境で SSR を実行できます:

```js
const ssrEnvironment = server.environments.ssr
```

## 新しい環境ファクトリーの作成 {#creating-a-new-environment-factory}

Vite 開発サーバーは、デフォルトで `client` 環境と `ssr` 環境の 2 つの環境を公開します。クライアント環境はデフォルトではブラウザー環境であり、モジュールランナーは仮想モジュール `/@vite/client` をクライアントアプリにインポートすることによって実装されます。SSR 環境は、デフォルトでは Vite サーバーと同じ Node ランタイムで実行され、開発時は完全な HMR サポートによって、アプリケーションサーバーを使用してリクエストをレンダリングできます。

変換されたソースコードはモジュールと呼ばれ、各環境で処理されるモジュール間の関係はモジュールグラフに保持されます。これらのモジュールの変換されたコードは、実行される各環境に関連付けられたランタイムに送信されます。ランタイムでモジュールが評価されると、そのモジュールにインポートされたモジュールがリクエストされ、モジュールグラフのセクションの処理がトリガーされます。

Vite モジュールランナーは、最初に Vite プラグインで処理することで、任意のコードを実行できます。ランナーの実装がサーバーから分離されている点が `server.ssrLoadModule` とは異なります。これによりライブラリーおよびフレームワークの作者は、Vite サーバーとランナー間の通信レイヤーを実装できます。ブラウザーは、サーバーの Web ソケットと HTTP リクエストを使用して、対応する環境と通信します。Node モジュールランナーは、同じプロセスで実行されているため、モジュールを処理するために関数呼び出しを直接実行できます。他の環境では、workerd などの JS ランタイムに接続するモジュール、または Vitest のようなワーカースレッドを実行するモジュールを実行できます。

この機能の目的の 1 つは、コードを処理および実行するためのカスタマイズ可能な API を提供することです。ユーザーは、公開されたプリミティブを使用して新しい環境ファクトリーを作成できます。

```ts
import { DevEnvironment, HotChannel } from 'vite'

function createWorkerdDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context: DevEnvironmentContext
) {
  const connection = /* ... */
  const transport: HotChannel = {
    on: (listener) => { connection.on('message', listener) },
    send: (data) => connection.send(data),
  }

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot: true,
    transport,
  })
  return workerdDevEnvironment
}
```

## `ModuleRunner`

モジュールランナーはターゲットランタイムでインスタンス化されます。次のセクションの全ての API は、特に断りのない限り `vite/module-runner` からインポートされます。このエクスポート・エントリーポイントは可能な限り軽量に保たれており、モジュールランナーを作成するために必要な最小限のものだけがエクスポートされます。

**型シグネチャー:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * 実行するURL。
   * ルートからの相対的なファイルパス、サーバーパス、ID を受け付けます。
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * HMR リスナーを含むすべてのキャッシュをクリアします。
   */
  public clearCache(): void
  /**
   * 全キャッシュをクリア、全 HMR リスナーを削除、ソースマップサポートをリセットします。
   * このメソッドは HMR 接続を停止しません。
   */
  public async close(): Promise<void>
  /**
   * `close()` を呼び出してランナーを終了した場合は `true` を返します。
   */
  public isClosed(): boolean
}
```

`ModuleRunner` のモジュール評価機能はコードの実行を担当します。Vite は `ESModulesEvaluator` をエクスポートしており、`new AsyncFunction` を使用してコードを評価します。JavaScript ランタイムが安全でない評価をサポートしていない場合は、独自の実装を提供できます。

モジュールランナーは `import` メソッドを公開します。Vite サーバーが `full-reload` HMR イベントをトリガーすると、影響を受けるすべてのモジュールが再実行されます。このとき、モジュールランナーは `exports` オブジェクトを更新しないことに注意してください（上書きされます）。最新の `exports` オブジェクトが必要であれば、 `import` を実行するか、もう一度 `evaluatedModules` からモジュールを取得する必要があります。

**使用例:**

```js
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner'
import { root, transport } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    root,
    transport,
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts twoslash
import type {
  InterceptorOptions as InterceptorOptionsRaw,
  ModuleRunnerHmr as ModuleRunnerHmrRaw,
  EvaluatedModules,
} from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type InterceptorOptions = Debug<InterceptorOptionsRaw>
type ModuleRunnerHmr = Debug<ModuleRunnerHmrRaw>
/** see below */
type ModuleRunnerTransport = unknown

// ---cut---
interface ModuleRunnerOptions {
  /**
   * プロジェクトのルート
   */
  root: string
  /**
   * サーバーと通信するための一連のメソッド。
   */
  transport: ModuleRunnerTransport
  /**
   * ソースマップの解決方法を設定します。
   * `process.setSourceMapsEnabled` が使用可能な場合は `node` を優先します。
   * それ以外の場合は、デフォルトで `prepareStackTrace` を使用し、
   * `Error.prepareStackTrace` メソッドをオーバーライドします。
   * Vite によって処理されなかったファイルのファイル内容とソースマップの解決方法を設定する
   * オブジェクトを提供できます。
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
         * HMR ロガーを設定します。
         */
        logger?: false | HMRLogger
      }
  /**
   * カスタムモジュールキャッシュ。指定されていない場合は、モジュールランナーの
   * インスタンスごとに個別のモジュールキャッシュが作成されます。
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**型シグネチャー:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---cut---
export interface ModuleEvaluator {
  /**
   * 変換後のコードに含まれるプレフィックスの行数。
   */
  startOffset?: number
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

Vite はデフォルトでこのインターフェイスを実装した `ESModulesEvaluator` をエクスポートします。コードの評価には `new AsyncFunction` を使用するので、インライン化されたソースマップがある場合は、新しい行が追加されたことを考慮して [2 行分のオフセット](https://tc39.es/ecma262/#sec-createdynamicfunction)を追加する必要があります。これは `ESModulesEvaluator` によって自動的に実行されます。カスタムの Evaluator は行を追加しません。

## `ModuleRunnerTransport`

**型シグネチャー:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** オブジェクト */
type HotPayload = unknown
// ---cut---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(
    data: HotPayload,
  ): Promise<{ /** result */ r: any } | { /** error */ e: any }>
  timeout?: number
}
```

RPC 経由または関数を直接呼び出して環境と通信するトランスポートオブジェクト。`invoke` メソッドが実装されていない場合、`send` メソッドと `connect` メソッドの実装が必須となります。Vite は内部で `invoke` を構築します。

次の例のように、モジュールランナーがワーカー スレッドで作成されるサーバー上の `HotChannel` インスタンスと結合する必要があります:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @type {import('vite/module-runner').ModuleRunnerTransport} */
const transport = {
  connect({ onMessage, onDisconnection }) {
    parentPort.on('message', onMessage)
    parentPort.on('close', onDisconnection)
  },
  send(data) {
    parentPort.postMessage(data)
  },
}

const runner = new ModuleRunner(
  {
    root: fileURLToPath(new URL('./', import.meta.url)),
    transport,
  },
  new ESModulesEvaluator(),
)
```

```js [server.js]
import { BroadcastChannel } from 'node:worker_threads'
import { createServer, RemoteEnvironmentTransport, DevEnvironment } from 'vite'

function createWorkerEnvironment(name, config, context) {
  const worker = new Worker('./worker.js')
  const handlerToWorkerListener = new WeakMap()

  const workerHotChannel = {
    send: (data) => w.postMessage(data),
    on: (event, handler) => {
      if (event === 'connection') return

      const listener = (value) => {
        if (value.type === 'custom' && value.event === event) {
          const client = {
            send(payload) {
              w.postMessage(payload)
            },
          }
          handler(value.data, client)
        }
      }
      handlerToWorkerListener.set(handler, listener)
      w.on('message', listener)
    },
    off: (event, handler) => {
      if (event === 'connection') return
      const listener = handlerToWorkerListener.get(handler)
      if (listener) {
        w.off('message', listener)
        handlerToWorkerListener.delete(handler)
      }
    },
  }

  return new DevEnvironment(name, config, {
    transport: workerHotChannel,
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

HTTP リクエストを使用してランナーとサーバー間で通信する別の例:

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    root: fileURLToPath(new URL('./', import.meta.url)),
    transport: {
      async invoke(data) {
        const response = await fetch(`http://my-vite-server/invoke`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      },
    },
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

この場合、`NormalizedHotChannel` の `handleInvoke` メソッドを使用できます:

```ts
const customEnvironment = new DevEnvironment(name, config, context)

server.onRequest((request: Request) => {
  const url = new URL(request.url)
  if (url.pathname === '/invoke') {
    const payload = (await request.json()) as HotPayload
    const result = customEnvironment.hot.handleInvoke(payload)
    return new Response(JSON.stringify(result))
  }
  return Response.error()
})
```

ただし、HMR をサポートするためには `send` メソッドと `connect` メソッドが必要です。`send` メソッドは通常、カスタムイベントがトリガーされたときに呼び出されます（`import.meta.hot.send("my-event")` のように）。

Vite は SSR 中の HMR をサポートするために、メインエントリーポイントから `createServerHotChannel` をエクスポートします。
