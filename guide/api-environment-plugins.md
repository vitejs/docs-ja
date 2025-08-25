# プラグイン向けの Environment API

:::info Release Candidate
Environment API は一般的にリリース候補段階にあります。エコシステムがそれらを実験し、構築できるように、メジャーリリース間での API の安定性を維持します。ただし、[一部の特定の API](/changes/#considering) はまだ実験的であることに注意してください。

ダウンストリームプロジェクトが新しい機能を実験し、それらを検証する時間を持った後、将来のメジャーリリースでこれらの新しい API を安定化する予定です（破壊的変更を含む可能性あり）。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

ぜひフィードバックをお寄せください。
:::

## フック内で現在の環境にアクセスする　{}

Vite 6 までは環境が 2 つ (`client` と `ssr`) しかなかったため、Vite API の現在の環境を識別するのは `ssr` ブール値で十分でした。プラグインフックは最後のオプションパラメーターで `ssr` ブール値を受け取り、いくつかの API はモジュールを正しい環境に適切に関連付けるためにオプションの最後の `ssr` パラメーターを必要としていました (たとえば、`server.moduleGraph.getModuleByUrl(url, { ssr })`)。

設定可能な環境の登場により、プラグイン内のオプションやインスタンスにアクセスするための統一された方法が用意されました。プラグインフックはコンテキスト内で `this.environment` を公開するようになり、以前は `ssr` ブール値を期待していた API は適切な環境にスコープされるようになりました (たとえば `environment.moduleGraph.getModuleByUrl(url)`)。

Vite サーバーには共有プラグインパイプラインがありますが、モジュールが処理されるときは常に特定の環境のコンテキストで実行されます。`environment` インスタンスはプラグインコンテキストで使用できます。

プラグインは、`environment` インスタンスを使用して、環境の設定（`environment.config` を使用してアクセス可能）に応じてモジュールの処理方法を変更できます。

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## フックを使用して新しい環境を登録する {#registering-new-environments-using-hooks}

プラグインは、`config` フックに新しい環境を追加できます。例えば、[RSC サポート](/plugins/#vitejs-plugin-rsc) では、`react-server` 条件を含む個別のモジュールグラフを持つために追加の環境を使用します:

```ts
  config(config: UserConfig) {
    return {
      environments: {
        rsc: {
          resolve: {
            conditions: ['react-server', ...defaultServerConditions],
          },
        },
      },
    }
  }
```

環境を登録するには空のオブジェクトで十分で、デフォルト値はルートレベルの環境設定から取得されます。

## フックを使用した環境の設定 {#configuring-environment-using-hooks}

`config` フックが実行されている間、環境の完全なリストはまだ分かっておらず、環境はルートレベルの環境設定からのデフォルト値、または `config.environments` レコードを通して明示的に影響を受ける可能性があります。
プラグインは `config` フックを使ってデフォルト値を設定してください。各環境を設定するには、新しい `configEnvironment` フックを使用します。このフックは、最終的なデフォルト値の解決を含む、部分的に解決された設定を持つ各環境に対して呼び出されます。

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    // rsc 環境に "workerd" 条件を追加
    if (name === 'rsc') {
      return {
        resolve: {
          conditions: ['workerd'],
        },
      }
    }
  }
```
```

## `hotUpdate` フック {#the-hotupdate-hook}

- **型:** `(this: { environment: DevEnvironment }, options: HotUpdateOptions) => Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>`
- **参照:** [HMR API](./api-hmr)

`hotUpdate` フックを使用すると、プラグインが指定された環境に対してカスタム HMR 更新処理を実行できるようになります。ファイルが変更されると、HMR アルゴリズムは `server.environments` の順番に従って各環境で順に実行されるので、`hotUpdate` フックは複数回呼び出されることになります。このフックは以下のシグネチャを持つコンテキストオブジェクトを受け取ります:

```ts
interface HotUpdateOptions {
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

## プラグインにおける環境ごとの状態 {#per-environment-state-in-plugins}

同じプラグインインスタンスが異なる環境で使用されるため、プラグインの状態は `this.environment` をキーとして管理する必要があります。これは、エコシステムがクライアントモジュールと SSR モジュールの状態が混ざるのを避けるために、`ssr` ブール値をキーとしてモジュールの状態を保持するために既に使用しているパターンと同じです。`Map<Environment, State>` を使用して、各環境の状態を個別に保持できます。後方互換性のため、`buildStart` および `buildEnd` は、`perEnvironmentStartEndDuringDev: true` フラグがない場合、クライアント環境に対してのみ呼び出されることに注意してください。

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    },
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

## 環境ごとのプラグイン {#per-environment-plugins}

プラグインは `applyToEnvironment` 関数で、適用する環境を定義できます。

```js
const UnoCssPlugin = () => {
  // 共有グローバル状態
  return {
    buildStart() {
      // WeakMap<Environment,Data>, this.environment を使って
      // 環境ごとの状態を初期化
    },
    configureServer() {
      // グローバルフックを通常どおり使用
    },
    applyToEnvironment(environment) {
      // このプラグインがこの環境でアクティブになる必要がある場合は true を返し、
      // そうでない場合は、それを置き換える新しいプラグインを返します。
      // フックが使用されていない場合、プラグインはすべての環境でアクティブになります
    },
    resolveId(id, importer) {
      // このプラグインが適用される環境に対してのみ呼び出されます
    },
  }
}
```

プラグインが環境を認識せず、現在の環境に基づかない状態を持っている場合、`applyToEnvironment` フックを利用することで、簡単に環境別に対応するものに変えられます。

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

以下のような他のフックが不要なケースを簡略化するために、Vite は `perEnvironmentPlugin` ヘルパーをエクスポートしています:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

`applyToEnvironment` フックは設定時に呼び出されます。エコシステム内のプロジェクトがプラグインを変更しているため、現在は `configResolved` の後に呼び出されています。環境プラグインの解決は、将来的には `configResolved` の前に移動される可能性があります。

## ビルドフックの環境 {#environment-in-build-hooks}

開発時と同じように、プラグインフックもビルド時に環境インスタンスを受け取り、`ssr` ブール値を置き換えます。
これは `renderChunk` や `generateBundle` などのビルド専用のフックでも動作します。

## ビルド時の共有プラグイン {#shared-plugins-during-build}

Vite 6 以前は、プラグインパイプラインは開発時とビルド時に異なる方法で動作していました:

- **開発時:** プラグインは共有されます
- **ビルド時:** プラグインは環境ごとに分離されます（`vite build` と `vite build --ssr` という別々のプロセスで分離されます）。

このため、フレームワークはファイルシステムに書き込まれたマニフェストファイルを通して `client` ビルドと `ssr` ビルドの間で状態を共有することを余儀なくされていました。Vite 6 では、すべての環境を単一のプロセスでビルドするようになったので、プラグインのパイプラインと環境間通信の方法を開発時と合わせることができるようになりました。

将来のメジャーでは、完全な整合性が実現するかも知れません:

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
