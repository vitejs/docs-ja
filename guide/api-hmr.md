# HMR API

:::tip 注意
これはクライアント HMR の API です。プラグインでの HMR 更新処理については、[handleHotUpdate](./api-plugin#handlehotupdate) を参照してください。

マニュアル HMR は主にフレームワークやツール作成者を対象としています。エンドユーザには、HMR はフレームワークによっては、スタータテンプレート内ですでに処理されていることがありえるでしょう。
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
    cb: (mods: Array<ModuleNamespace | undefined>) => void
  ): void

  dispose(cb: (data: any) => void): void
  decline(): void
  invalidate(): void

  // `InferCustomEventPayload` が組み込みの Vite イベント用の型を提供します
  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void
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

## `hot.accept(cb)`

自身を受け入れるモジュールには、`import.meta.hot.accept` と更新されたモジュールを受け取るコールバックを使用します:

```js
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // newModule is undefined when SyntaxError happened
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

ホットアップデートを「受け入れる」モジュールは、**HMR 境界**と見なされます。

Vite の HMR は元々インポートされていたモジュールを実際に入れ替えるわけではないことに注意してください: HMR 境界モジュールが依存ファイルからのインポートを再エクスポートする場合、それらの再エクスポートを更新する責任があります（また、これらのエクスポートは `let` を使用しなければなりません）。さらに、境界モジュールよりも依存の上流でインポートしているモジュールには変更が通知されません。

この単純化された HMR の実装は、ほとんどの開発のユースケースに充分で、プロキシモジュールを生成するという重い処理を省くことができます。

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
      // コールバックは更新されたモジュールを配列で受け取ります
    }
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

## `hot.data`

`import.meta.hot.data` オブジェクトは、更新された同じモジュールの異なるインスタンス間で永続化されます。これは、モジュールの前のバージョンから次のバージョンに情報を渡すために使用できます。

## `hot.decline()`

`import.meta.hot.decline()` を呼び出すと、このモジュールはホットアップデート可能でないことが示されます。HMR 更新の伝播中にこのモジュールが検出された場合、ブラウザは完全なリロードを行うべきです。

## `hot.invalidate()`

今のところ、`import.meta.hot.invalidate()` を呼び出すとページがリロードされるだけです。

## `hot.on(event, cb)`

HMR イベントを購読します。

以下の HMR イベントは Vite によって自動的にディスパッチされます:

- `'vite:beforeUpdate'` アップデートが適用される直前（例: モジュールが置き換えられるなど）
- `'vite:beforeFullReload'` 完全なリロードが発生する直前
- `'vite:beforePrune'` もう必要なくなったモジュールが取り除かれる直前
- `'vite:error'` エラーが発生したとき（例: 構文エラーなど）

カスタム HMR イベントは、プラグインから送信することもできます。詳細は [handleHotUpdate](./api-plugin#handlehotupdate) を参照してください。

## `hot.send(event, data)`

カスタムイベントを Vite の開発サーバーへ送信します。

接続前に呼び出した場合、データはバッファされ、コネクションが確立した後に送信されます。

詳細は [クライアントサーバーとの通信](/guide/api-plugin.html#client-server-communication) を参照してください。
