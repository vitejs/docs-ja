# HMR API

:::tip 注意
これはクライアント HMR の API です。プラグインでの HMR 更新処理については、[handleHotUpdate](./api-plugin#handlehotupdate) を参照してください。

マニュアル HMR は主にフレームワークやツール作成者を対象としています。エンドユーザーには、HMR はフレームワークによっては、スタータテンプレート内ですでに処理されていることがありえるでしょう。
:::

Vite は特別な `import.meta.hot` オブジェクトを介して、マニュアル HMR の API を公開しています:

```ts
interface ImportMeta {
  readonly hot?: ViteHotContext
}

type ModuleNamespace = Record<string, any> & {
  [Symbol.toStringTag]: 'Module'
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  // `InferCustomEventPayload` が組み込みの Vite イベント用の型を提供します
  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## 条件によるガードが必要

まず、すべての HMR API の使用を条件ブロックでガードして、プロダクション環境でコードが Tree Shaking されるようにしてください:

```js
if (import.meta.hot) {
  // HMR のコード
}
```

## TypeScript の IntelliSense

Vite は `import.meta.hot` の型定義を [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) で提供しています。`src` ディレクトリーに `env.d.ts` を作成することで、TypeScript が型定義を読み込むようになります:

```ts
/// <reference types="vite/client" />
```

## `hot.accept(cb)`

自身を受け入れるモジュールには、`import.meta.hot.accept` と更新されたモジュールを受け取るコールバックを使用します:

```js
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // SyntaxError が発生したときに newModule は undefined です
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

ホットアップデートを「受け入れる」モジュールは、**HMR 境界**と見なされます。

Vite の HMR は元々インポートされていたモジュールを実際に入れ替えるわけではありません: HMR 境界モジュールが依存ファイルからのインポートを再エクスポートする場合、それらの再エクスポートを更新する責任があります（また、これらのエクスポートは `let` を使用しなければなりません）。さらに、境界モジュールよりも依存の上流でインポートしているモジュールには変更が通知されません。この単純化された HMR の実装は、ほとんどの開発のユースケースに充分で、プロキシモジュールを生成するという重い処理を省くことができます。

Vite では、モジュールがアップデートを受け入れるために、この関数の呼び出しがソースコード中で `import.meta.hot.accept(`（空白を区別します）として表示される必要があります。これは、Vite がモジュールの HMR サポートを有効にするために行う静的解析の必要条件です。

## `hot.accept(deps, cb)`

モジュールは自身をリロードすることなく、直接の依存関係からの更新を受け入れることもできます:

```js
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // コールバックは更新された './foo.js' モジュールを受け取ります
    newFoo?.foo()
  })

  // 依存モジュールの配列を受け入れることもできます:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // コールバックは、更新されたモジュールだけが null でない配列を
      // 受け取ります。アップデートが成功しなかった場合（構文エラーなど）、
      // 配列は空となります
    },
  )
}
```

## `hot.dispose(cb)`

自己受け入れモジュールや、他に受け入れられることを期待するモジュールは `hot.dispose` を使うことで、更新されたコピーによって生成された永続的な副作用をクリーンアップできます:

```js
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // 副作用をクリーンアップ
  })
}
```

## `hot.prune(cb)`

モジュールがページにインポートされなくなったときに呼び出されるコールバックを登録します。`hot.dispose` と比較すると、ソースコードが更新されたときに副作用をクリーンアップしてくれて、ページから削除されたときだけクリーンアップすればよい場合に使用できます。Vite では現在、 `.css` のインポートにこれを使用しています。

```js
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // 副作用のクリーンアップ
  })
}
```

## `hot.data`

`import.meta.hot.data` オブジェクトは、更新された同じモジュールの異なるインスタンス間で永続化されます。これは、モジュールの前のバージョンから次のバージョンに情報を渡すために使用できます。

`data` 自体の再代入はサポートされていないことに注意してください。代わりに、`data` オブジェクトのプロパティを変更して、他のハンドラーから追加された情報が保持されるようにする必要があります。

```js
// これは OK
import.meta.hot.data.someValue = 'hello'

// サポートされていません
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

これは現在何もせず、後方互換性のために存在しています。将来、新しい使い道があれば変更される可能性があります。モジュールがホットアップデート可能でないことを示すには、`hot.invalidate()` を使ってください。

## `hot.invalidate(message?: string)`

自己受け入れモジュールは実行中に HMR の更新を処理できないことに気づくかもしれません。そのため、更新は強制的にインポーターに伝搬される必要があります。`import.meta.hot.invalidate()` を呼ぶことで、HMR サーバーは呼び出し元のインポーターを、呼び出し元が自己受け入れしていないかのように無効化します。これはブラウザーのコンソールとターミナルの両方にメッセージを記録します。メッセージを渡すことで、なぜ無効化が起こったのかについてのコンテキストを与えることができます。

その直後に `invalidate` を呼び出す場合でも、常に `import.meta.hot.accept` を呼び出す必要があることに注意してください。そうしないと、HMR クライアントは自己受け入れモジュールの今後の変更をリッスンしません。意図を明確に伝えるために、以下のように `accept` コールバック内で `invalidate` をコールすることを推奨します:

```js
import.meta.hot.accept((module) => {
  // 新しいモジュールインスタンスを使用して、無効化するかどうかを決定できます。
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

HMR イベントを購読します。

以下の HMR イベントは Vite によって自動的にディスパッチされます:

- `'vite:beforeUpdate'` アップデートが適用される直前（例: モジュールが置き換えられるなど）
- `'vite:afterUpdate'` アップデートが適用された直後（例: モジュールが置き換えられるなど）
- `'vite:beforeFullReload'` 完全なリロードが発生する直前
- `'vite:beforePrune'` もう必要なくなったモジュールが取り除かれる直前
- `'vite:invalidate'` モジュールが `import.meta.hot.invalidate()` で無効にされたとき
- `'vite:error'` エラーが発生したとき（例: 構文エラーなど）
- `'vite:ws:disconnect'` WebSocket 接続が切断されたとき
- `'vite:ws:connect'` WebSocket 接続が（再）確立されたとき

カスタム HMR イベントは、プラグインから送信することもできます。詳細は [handleHotUpdate](./api-plugin#handlehotupdate) を参照してください。

## `hot.off(event, cb)`

イベントリスナーからコールバックを削除します。

## `hot.send(event, data)`

カスタムイベントを Vite の開発サーバーへ送信します。

接続前に呼び出した場合、データはバッファーされ、コネクションが確立した後に送信されます。

詳細は [クライアントサーバーとの通信](/guide/api-plugin.html#client-server-communication) を参照してください。
