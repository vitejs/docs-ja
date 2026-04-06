# `Environment` インスタンスの使用

:::info Release Candidate
Environment API は一般的にリリース候補段階にあります。エコシステムがそれらを実験し、構築できるように、メジャーリリース間での API の安定性を維持します。ただし、[一部の特定の API](/changes/#considering) はまだ実験的であることに注意してください。

ダウンストリームプロジェクトが新しい機能を実験し、それらを検証する時間を持った後、将来のメジャーリリースでこれらの新しい API を安定化する予定です（破壊的変更を含む可能性あり）。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

ぜひフィードバックをお寄せください。
:::

## 環境へのアクセス {#accessing-the-environments}

開発中は、`server.environments` を使用して開発サーバー内の利用可能な環境にアクセスできます:

```js
// サーバーを作成するか、configureServer フックから取得する
const server = await createServer(/* オプション */)

const clientEnvironment = server.environments.client
clientEnvironment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

プラグインから現在の環境にアクセスすることもできます。詳細については、[プラグイン向けの Environment API](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) を参照してください。

## `DevEnvironment` クラス {#devenvironment-class}

開発中、各環境は `DevEnvironment` クラスのインスタンスです:

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
  hot: NormalizedHotChannel
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

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * URL を id に解決してロードし、プラグインパイプラインを使ってコードを処理する。
   * モジュールグラフも更新されます。
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * 低い優先度で処理されるリクエストを登録します。ウォーターフォールを回避するのに
   * 役立ちます。Vite サーバーは他のリクエストによってインポートされたモジュールに関する
   * 情報を持っているため、モジュールがリクエストされたときにすでに処理されているよう、
   * モジュールグラフをウォームアップできます。
   */
  async warmupRequest(url: string): Promise<void>

  /**
   * モジュールランナーが指定されたモジュールの情報を取得するために呼び出されます。
   * 内部的には `transformRequest` を呼び出し、その結果をモジュールランナーが
   * 理解できる形式でラップします。
   * このメソッドは手動で呼び出すことを意図していません。
   */
  async fetchModule(
    id: string,
    importer?: string,
    options?: FetchFunctionOptions,
  ): Promise<FetchResult>
}
```

`DevEnvironmentContext` は次のようになります:

```ts
interface DevEnvironmentContext {
  hot: boolean
  transport?: HotChannel | WebSocketServer
  options?: EnvironmentOptions
  remoteRunner?: {
    inlineSourceMap?: boolean
  }
  depsOptimizer?: DepsOptimizer
}
```

そして `TransformResult` は:

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

:::info transformRequest の命名
この提案の現在のバージョンでは `transformRequest(url)` と `warmupRequest(url)` を使っているので、Vite の現在の API に慣れているユーザーにとっては議論しやすく、理解しやすいと思います。リリースする前に、これらの名前を見直す機会を設ける可能性があります。例えば、プラグインフックで Rollup の `context.load(id)` からページを取得する `environment.processModule(url)` や `environment.loadModule(url)` という名前にすることもできます。今のところは現在の名前のままで、この議論を遅らせる方が良いと考えています。
:::

## 独立したモジュールグラフ {#separate-module-graphs}

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

  getModuleById(id: string): EnvironmentModuleNode | undefined

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  onFileDelete(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = monotonicDateNow(),
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

## `FetchResult`

`environment.fetchModule` メソッドはモジュールランナーが利用するための `FetchResult` を返します。`FetchResult` は `CachedFetchResult`、`ExternalFetchResult`、`ViteFetchResult` のユニオン型です。

`CachedFetchResult` は HTTP ステータスコードの `304`（Not Modified）に類似しています。

```ts
export interface CachedFetchResult {
  /**
   * モジュールがランナーにキャッシュされている場合、
   * サーバー側で無効化されていないことを確認します。
   */
  cache: true
}
```

`ExternalFetchResult` はモジュールランナーに対して、[`ModuleEvaluator`](/guide/api-environment-runtimes#moduleevaluator) の `runExternalModule` メソッドを使用してモジュールをインポートするよう指示します。この場合、デフォルトのモジュール評価器は Vite でファイルを処理する代わりに、ランタイムのネイティブ `import` を使用します。

```ts
export interface ExternalFetchResult {
  /**
   * file:// で始まる外部化されたモジュールへのパス。
   * デフォルトでは、Vite によって変換されて Vite ランナーで
   * 読み込まれる代わりに、動的な "import" でインポートされます。
   */
  externalize: string
  /**
   * モジュールの種別。import 文が正しいかどうかを判断するために使用されます。
   * たとえば、変数が実際にエクスポートされていない場合に Vite がエラーをスローするかどうかを判断します。
   */
  type: 'module' | 'commonjs' | 'builtin' | 'network'
}
```

`ViteFetchResult` は実行する `code` やモジュールの `id`、`file`、`url` など、現在のモジュールに関する情報を返します。

`invalidate` フィールドは、キャッシュから提供するのではなく、再実行前にモジュールを無効化するようモジュールランナーに指示します。これは通常、HMR 更新がトリガーされたときに `true` になります。

```ts
export interface ViteFetchResult {
  /**
   * Vite ランナーによって評価されるコード。
   * デフォルトでは非同期関数でラップされます。
   */
  code: string
  /**
   * ディスク上のモジュールのファイルパス。
   * import.meta.url/filename として解決されます。
   * 仮想モジュールの場合は `null` になります。
   */
  file: string | null
  /**
   * サーバーモジュールグラフ内のモジュール ID。
   */
  id: string
  /**
   * import で使用されるモジュール URL。
   */
  url: string
  /**
   * クライアント側でモジュールを無効化します。
   */
  invalidate: boolean
}
```
