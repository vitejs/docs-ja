# 特徴

基本的に、Vite を使用した開発は静的ファイルサーバを使用した時とそれほど変わりません。しかし、Vite はバンドラベースのセットアップで一般的な機能をサポートするためにネイティブ ESM をインポートすることで様々な拡張機能を提供します。

## NPM の依存関係の解決と事前バンドル

ネイティブ ES のインポートは次のような生のモジュールをサポートしていません:

```js
import { someMethod } from 'my-dep'
```

上のようなコードはブラウザでエラーになります。Vite は提供される全てのソースファイルでこのような生のモジュールのインポートを検出し以下を実行します:

1. [事前バンドル](./dep-pre-bundling) はページの読み込み速度を改善し、CommonJS / UMD モジュールを ESM に変換します。事前バンドルは [esbuild](http://esbuild.github.io/) で実行され、Vite のコールドスタート時間をどんな JavaScript ベースのバンドラよりも大幅に高速にします。

2. インポートを `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` のように書き換えることでブラウザが正しくモジュールをインポートできるようにします。

**依存関係は積極的にキャッシュされます**

Vite は HTTP ヘッダを介して依存関係のリクエストをキャッシュするため、依存関係をローカルで編集/デバッグする場合は、[ここの手順](./dep-pre-bundling#ブラウザ-キャッシュ)に従ってください。

## Hot Module Replacement

Vite はネイティブ ESM を介して [HMR API](./api-hmr) を提供します。HMR 機能を備えたフレームワークは、API を活用して、ページを再読み込みしたり、アプリケーションの状態を損失することなく即座に正確な更新を提供できます。Vite は [Vue の単一ファイルコンポーネント](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) および [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) に対しての HMR 統合を提供します。[@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) を介した Preact の統合された公式のライブラリもあります。

これらを手動で設定する必要がないことには注意してください - [`create-vite` を介してアプリケーションを作成する](./)場合、これらはすでに構成されています。

## TypeScript

Vite は `.ts` ファイルをインポートすることをサポートしています。

### トランスパイルのみ

Vite は `.ts` ファイルのトランスパイルを行うだけで、型チェックは**行わない**ことに注意してください。型チェックは IDE やビルドプロセスで行われることを想定しています。

Vite が変換処理の一部として型チェックを行わないのは、この 2 つのジョブが根本的に異なる動作をするからです。トランスパイルはファイル単位で行うことができ、Vite のオンデマンドコンパイルモデルと完全に調和しています。これに対して、型チェックはモジュールグラフ全体についての知識が必要です。Vite の変換パイプラインに型チェックを組み込むと、必然的に Vite の利点であるスピードが損なわれてしまいます。

Vite の仕事は、ソースモジュールをできるだけ速くブラウザで実行できる形にすることです。そのため、Vite の変換パイプラインから静的解析チェックを切り離すことをお勧めします。この原則は、ESLint のような他の静的解析チェックにも当てはまります。

- プロダクションビルドの場合は、Vite のビルドコマンドに加えて、`tsc --noEmit` を実行できます。

- 開発中、IDE のヒント以上が必要な場合は、別プロセスで `tsc --noEmit --watch` を実行するか、型エラーをブラウザに直接報告させたい場合は [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) を使用することをおすすめします。

Vite は [esbuild](https://github.com/evanw/esbuild) を用いて TypeScript を JavaScript に変換します。これは、vanilla の `tsc` よりも約 20〜30 倍速く、HMR の更新は 50 ミリ秒未満でブラウザに反映されます

[型のみのインポートやエクスポート](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)構文を使用すると、型のみのインポートが正しくバンドルされないなどの潜在的な問題を回避できます。例えば:

```ts
import type { T } from 'only/types'
export type { T }
```

### TypeScript コンパイラオプション

`tsconfig.json` の `compilerOptions` にあるいくつかの設定フィールドには、特別な注意が必要です。

#### `isolatedModules`

`true` に設定する必要があります。

`esbuild` は型情報なしにトランスパイルを行うだけなので、const enum や暗黙の型のみのインポートなどの特定の機能をサポートしていないからです。

隔離されたトランスパイルで動作しない機能を TS が警告するように、`tsconfig.json` の `compilerOptions` で `"isolatedModules": true` を設定する必要があります。

しかし、一部のライブラリ (例えば [`vue`](https://github.com/vuejs/core/issues/1228)) は `"isolatedModules": true` でうまく動作しないことがあります。`skipLibCheck": true` を使用すると、アップストリームで修正されるまで一時的にエラーを抑制することができます。

#### `useDefineForClassFields`

Vite 2.5.0 からは、TypeScript ターゲットが `ESNext` か `ES2022` 以上の場合、デフォルト値は `true` になります。これは [`tsc` 4.3.2 以降の動作](https://github.com/microsoft/TypeScript/pull/42663)と一致しています。また、これは ECMAScript の標準的なランタイムの動作でもあります。

しかし、他のプログラミング言語や古いバージョンの TypeScript を使用している人にとっては直感的に理解できないかもしれません。
移行の詳細については、[TypeScript 3.7 リリースノート](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier)を参照してください。

クラスフィールドに大きく依存しているライブラリを使用している場合は、そのライブラリが意図している使い方に注意してください。

[MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties) などのほとんどのライブラリは `"useDefineForClassFields": true` を想定しています。

しかし、[`lit-element`](https://github.com/lit/lit-element/issues/1030) など、まだこの新しいデフォルトに移行していないライブラリもあります。これらの場合は、明示的に `useDefineForClassFields` を `false` に設定してください。

### ビルド結果に影響するその他のコンパイラオプション

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)

もしコードベースを `"isolatedModules": true` に移行することが無理な場合は、[rollup-plugin-friendly-type-imports](https://www.npmjs.com/package/rollup-plugin-friendly-type-imports) のようなサードパーティのプラグインを使って回避できるかも知れません。しかし、この方法は Vite では公式にサポートされていません。

### クライアントでの型

Vite はデフォルトでは Node.js の API を提供します。Vite でクライアント用のコードを使用するには `d.ts` の定義ファイルを追加します:

```typescript
/// <reference types="vite/client" />
```

または、`tsconfig.json` 内の `compilerOptions.types` に `vite/client` を追加することもできます:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

これにより次のことが提供されます:

- アセットのインポート (例: `.svg` ファイルのインポート)
- `import.meta.env` に Vite が挿入した[環境変数](./env-and-mode#env-variables)の型
- `import.meta.hot` の [HMR API](./api-hmr) の型

::: tip
デフォルトの型を上書きするためには、自身の型を含む型定義ファイルを追加します。その後、`vite/client` の前に型参照を追加してください。

例えば、`*.svg` のデフォルトインポートを React コンポーネントにする場合:

- `vite-env-override.d.ts`（自身の型を含むファイル）:
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- `vite/client` への参照を含むファイル:
  ```ts
  /// <reference types="./vite-env-override.d.ts" />
  /// <reference types="vite/client" />
  ```

:::

## Vue

Vite は Vue に対して最高のサポートをします:

- Vue 3 SFC はこちら [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Vue 3 JSX はこちら [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- Vue 2.7 SFC はこちら [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)
- Vue 2.7 JSX はこちら [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

## JSX

`.jsx` と `.tsx` も標準サポートされます。JSX のトランスパイルも [esbuild](https://esbuild.github.io) を介して行われます。

Vue を使用している人は公式の [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) プラグインを使用するべきです。これは、HMR、グローバルコンポーネント解決、ディレクティブ、スロットなど、Vue 3 の固有の機能を提供します。

もし React、または Vue で JSX を使用していない場合は、[`esbuild` オプション](/config/shared-options.md#esbuild) を使用して `jsxFactory` および `jsxFragment` を構成することができます。例えば、Preact の場合:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

さらに詳しく知りたい場合は [esbuild docs](https://esbuild.github.io/content-types/#jsx) を見てください。

また、`jsxInject`（Vite のみのオプション）を使用して JSX ヘルパを挿入し、手動インポートを回避できます。

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

`.css` ファイルをインポートすると、HMR をサポートする `<style>` タグを介してそのコンテンツがページに挿入されます。モジュールのデフォルトのエクスポートとして、処理された CSS を文字列として取得することもできます。

### `@import` のインライン化と書き換え

Vite は、`postcss-import` を介した CSS `@import` のインライン化をサポートするように事前構成されています。CSS `@import` では、Vite エイリアスも尊重されます。さらに、インポートされたファイルが異なるディレクトリにある場合でも、すべての CSS `url()` 参照は、正確性を確保するために常に自動的に書き換えられます。

`@import` エイリアスと URL の書き換えは Sass ファイルと Less ファイルでもサポートされています ([CSS Pre-processors](#css-プリプロセッサ)を参照)。

### PostCSS

もしプロジェクトに有効な PostCSS が含まれている場合 ([postcss-load-config](https://github.com/postcss/postcss-load-config) でサポートされている任意の形式、例: `postcss.config.js`)、インポートされたすべての CSS に自動的に適用されます。

CSS の圧縮は PostCSS の後に実行され、[`build.cssTarget`](/config/build-options.md#build-csstarget) オプションを使用することに注意してください。

### CSS Modules

`.module.css` で終わる全ての CSS ファイルは全て [CSS modules file](https://github.com/css-modules/css-modules) とみなされます。このようなファイルをインポートすると、対応するモジュールオブジェクトが返されます:

```css
/* example.module.css */
.red {
  color: red;
}
```

```js
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

CSS モジュールの動作は [`css.modules` オプション](/config/shared-options.md#css-modules) により設定できます。

`css.modules.localsConvention` がキャメルケースローカルを有効にするように設定されている場合（例：`localsConvention: 'camelCaseOnly'`）、名前付きインポートを使用することもできます:

```js
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS プリプロセッサ

Vite は最新のブラウザのみを対象としているため、CSSWG ドラフト（[postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) など）を実装する PostCSS プラグインでネイティブ CSS 変数を使用し、将来の標準に準拠したプレーンな CSS を作成することをお勧めします。

とは言うものの、Vite は `.scss`、`.sass`、`.less`、`.styl`、`.stylus` ファイルの組み込みサポートを提供します。それらに Vite 固有のプラグインをインストールする必要はありませんが、対応するプリプロセッサ自体をインストールする必要があります。

```bash
# .scss and .sass
npm add -D sass

# .less
npm add -D less

# .styl and .stylus
npm add -D stylus
```

もし Vue で単一ファイルコンポーネントを使用している場合、これにより、`<style lang="sass">` なども自動的に有効になります。

Vite は、Sass および Less の `@import` 解決を改善し、Vite エイリアスも尊重されるようにします。さらに、ルートファイルとは異なるディレクトリにあるインポートされた Sass / Less ファイル内の相対的な `url()` の参照も、正確性を確保するために自動的に書き換えられます。

`@import` エイリアスと URL の書き換えは、API の制約のため、Stylus ではサポートされていません。

ファイル拡張子の前に `.module` を付けることで、プリプロセッサと組み合わせて CSS モジュールを使用することもできます（例：`style.module.scss`）。

### ページへの CSS 注入の無効化

CSS コンテンツの自動注入は `?inline` クエリパラメータでオフにできます。この場合、処理された CSS 文字列は通常通りモジュールのデフォルトエクスポートとして返されますが、スタイルはページに注入されません。

```js
import './foo.css' // ページに注入される
import otherStyles from './bar.css?inline' // 注入されない
```

::: tip 注意
Vite 4 以降、CSS ファイルからのデフォルトインポートおよび名前付きインポート（例：`import style from './foo.css'`）は非推奨となりました。代わりに `?inline` クエリを使用してください。
:::

### Lightning CSS

Vite 4.4 から、[Lightning CSS](https://lightningcss.dev/) の実験的なサポートがあります。設定ファイルに [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) を追加し、オプションの [`lightningcss`](https://www.npmjs.com/package/lightningcss) 依存関係をインストールすることで有効にできます:

```bash
npm add -D lightningcss
```

有効にすると、CSS ファイルは PostCSS の代わりに Lightning CSS によって処理されます。設定するには、Lightning CSS のオプションを [`css.lightningcss`](../config/shared-options.md#css-lightningcss) に渡します。

CSS Modules を設定するには、[`css.modules`](../config/shared-options.md#css-modules)（PostCSS が CSS モジュールを処理する方法の設定）の代わりに [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) を使用します。

デフォルトでは、Vite は CSS の圧縮に esbuild を使用します。[`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify) を使用することで、Lightning CSS を CSS の圧縮に使用できます。

::: tip NOTE
Lightning CSS 使用時は、[CSS プリプロセッサ](#css-pre-processors)はサポートされていません。
:::

## 静的なアセット

静的アセットをインポートすると、提供時に解決されたパブリック URL が返されます:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

特別なクエリにより、アセットの読み込み方法を変更できます:

```js
// アセットを URL として明示的にロードする
import assetAsURL from './asset.js?url'
```

```js
// アセットを文字列として明示的にロードする
import assetAsString from './shader.glsl?raw'
```

```js
// Web ワーカをロードする
import Worker from './worker.js?worker'
```

```js
// ビルド時に base64 文字列としてインライン化された Web ワーカ
import InlineWorker from './worker.js?worker&inline'
```

詳しくは [静的アセットの取り扱い](./assets) を見てください。

## JSON

JSON ファイルは直接インポートできます - また、名前付きインポートもサポートされています：

```js
// オブジェクト全体をインポートする場合
import json from './example.json'
// 名前付きエクスポートとしてルートフィールドをインポートします - ツリーシェイクに役立ちます！
import { field } from './example.json'
```

## Glob のインポート

Vite は、特別な `import.meta.glob` 関数を介してファイルシステムから複数のモジュールをインポートすることをサポートしています:

```js
const modules = import.meta.glob('./dir/*.js')
```

上のコードは以下のように変換されます:

```js
// vite によって生成されたコード
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js'),
}
```

次に、`modules` オブジェクトのキーを繰り返し処理して、対応するモジュールにアクセスできます:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

一致したファイルはデフォルトで動的インポートを介して遅延ロードされ、ビルド中に個別のチャンクに分割されます。もしあなたがすべてのモジュールを直接インポートする場合（たとえば、最初に適用されるこれらのモジュールの副作用に依存する場合）、代わりに第 2 引数に `{ eager: true }` を渡すことができます:

```js
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

上のコードは以下のように変換されます:

```js
// vite によって生成されたコード
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
}
```

### glob インポートでの形式の変換

`import.meta.glob` は [Import Reflection](https://github.com/tc39/proposal-import-reflection) 構文でファイルの文字列としてのインポートもサポートしています（[アセットを文字列としてインポートする](./assets#アセットを文字列としてインポートする)と同様）:

```js
const modules = import.meta.glob('./dir/*.js', { as: 'raw', eager: true })
```

上のコードは以下のように変換されます:

```js
// vite によって生成されたコード
const modules = {
  './dir/foo.js': 'export default "foo"\n',
  './dir/bar.js': 'export default "bar"\n',
}
```

`{ as: 'url' }` によりアセットの URL としての読み込みもサポートしています。

### マルチパターン

第 1 引数は下記の例のように glob の配列を指定できます

```js
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### ネガティブパターン

ネガティブ glob パターンもサポートされています（接頭辞は `!`）。一部のファイルを結果から無視させるには、最初の引数に除外 glob パターンを追加します:

```js
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// vite によって生成されたコード
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### 名前付きインポート

`import` オプションでモジュールの一部だけをインポートすることも可能です。

```ts
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// vite によって生成されたコード
const modules = {
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
}
```

`eager` と組み合わせると、それらのモジュールのツリーシェイキングを有効にすることも可能です。

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// vite によって生成されたコード:
import { setup as __glob__0_0 } from './dir/foo.js'
import { setup as __glob__0_1 } from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
}
```

default エクスポートをインポートするには `import` に `default` を設定します。

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// vite によって生成されたコード:
import __glob__0_0 from './dir/foo.js'
import __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
}
```

#### カスタムクエリ

また、`query` オプションを使用すると、他のプラグインが使用するカスタムクエリをインポートに指定することができます。

```ts
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

```ts
// vite によって生成されたコード:
const modules = {
  './dir/foo.js': () => import('./dir/foo.js?foo=bar&bar=true'),
  './dir/bar.js': () => import('./dir/bar.js?foo=bar&bar=true'),
}
```

### Glob インポートの注意事項

注意点:

- これは Vite のみの機能で、Web または ES の標準ではありません。
- Glob パターンはインポート指定子のように扱われます。相対パス（`./` で始まる）か絶対パス（`/` で始まり、プロジェクトルートに対して相対的に解決される）、またはエイリアスのパス（[`resolve.alias` オプション](/config/shared-options.md#resolve-alias) 参照）のいずれかでなければなりません。
- Glob のマッチングは [`fast-glob`](https://github.com/mrmlnc/fast-glob) を介して行われます。[サポートされている Glob パターン](https://github.com/mrmlnc/fast-glob#pattern-syntax)については、ドキュメントを確認してください。
- また、`import.meta.glob` の引数はすべて**リテラル構文として渡さなければならない**ことに注意が必要です。変数や式は使えません。

## Dynamic Import

[glob import](#glob-import) と同様に、 Vite は変数を使った動的インポートをサポートしています。

```ts
const module = await import(`./dir/${file}.js`)
```

変数は 1 階層分のファイル名しか表さない点に注意してください。`file` が `'foo/bar'` の場合、インポートは失敗します。より高度な使い方をしたい場合は、[glob import](#glob-import) の機能を使うことができます。

## WebAssembly

`?init` を使うことでプリコンパイルされた `.wasm` ファイルをインポートできます。
デフォルトのエクスポートは、[`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance) の Promise を返す初期化関数になります:

```js
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

init 関数は、第 2 引数として [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) に渡される importObject を受け取ることもできます:

```js
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

本番ビルドでは、`assetInlineLimit` よりも小さい `.wasm` ファイルが base64 文字列としてインライン化されます。それ以外の場合は、[静的アセット](./assets.md)として扱われ、オンデマンドでフェッチされます。

::: tip 注意
[WebAssembly の ES モジュール統合の提案](https://github.com/WebAssembly/esm-integration)は現時点ではサポートしていません。
[`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) か、もしくは他のコミュニティのプラグインを使用して対処してください。
:::

### WebAssembly モジュールへのアクセス

もし `Module` オブジェクトにアクセスする必要がある場合、例えば複数回インスタンス化する場合は、[明示的な URL のインポート](./assets#明示的な-url-のインポート)を使用してアセットを解決してから、インスタンス化を実行してください:

```js
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } = await WebAssembly.instantiateStreaming(
    responsePromise,
  )
  /* ... */
}

main()
```

### Node.js でモジュールをフェッチする

SSR では、`?init` インポートの一部として発生する `fetch()` は `TypeError: Invalid URL` で失敗する可能性があります。
[SSR での wasm のサポート](https://github.com/vitejs/vite/issues/8882)の issue を参照してください。

プロジェクトのベースが現在のディレクトリであると仮定した場合の代替案を以下に示します:

```js
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Web Workers

### コンストラクタによるインポート

ワーカスクリプトは [`new Worker()`](https://developer.mozilla.org/ja/docs/Web/API/Worker/Worker) や [`new SharedWorker()`](https://developer.mozilla.org/ja/docs/Web/API/SharedWorker/SharedWorker) を使用することでインポートできます。サフィックスによるインポートと比べ、より標準的で**推奨される**ワーカ作成方法となります。

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

ワーカコンストラクタはオプションを受け取り、「モジュール」ワーカとして作成することも可能です:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

### クエリサフィックスによるインポート

インポートリクエストに `?worker` もしくは `?sharedworker` を追加することで、Web ワーカスクリプトを直接インポートできます。デフォルトのエクスポートはカスタムワーカコンストラクタになります:

```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

ワーカスクリプトは、`importScripts()` の代わりに ESM の `import` ステートメントを使用することもできます。**注意**: 開発中は[ブラウザのネイティブサポート](https://caniuse.com/?search=module%20worker)に依存しますが、プロダクションビルドではコンパイルされます。

デフォルトでは、ワーカスクリプトは本番ビルドで個別のチャンクとして出力されます。ワーカを base64 文字列としてインライン化する場合は、`inline` クエリを追加します:

```js
import MyWorker from './worker?worker&inline'
```

ワーカを URL として取得したい場合は、`url` クエリを追加してください:

```js
import MyWorker from './worker?worker&url'
```

すべてのワーカをバンドルする設定についての詳細は [Worker Options](/config/worker-options.md) を見てください。

## ビルドの最適化

> 以下にリストされている機能は、ビルドプロセスの一部として自動的に適用され、無効にする場合を除いて、明示的に設定する必要はありません。

### CSS のコード分割

Vite は、非同期チャンク内のモジュールによって使用される CSS を自動的に抽出し、そのチャンクに対応するファイルを個別に生成します。CSS ファイルは、関連付けられた非同期チャンクが読み込まれるときに `<link>` タグを介して自動的に読み込まれ、[FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) を回避するために、CSS が読み込まれた後にのみ非同期チャンクが評価されることが保証されます。

もしすべての CSS を 1 つのファイルに抽出したい場合は、[`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) を `false` に設定することで、CSS コードの分割を無効にできます。

### プリロードディレクティブの生成

Vite は、エントリチャンクとそこから直接インポートされたチャンクの `<link rel="modulepreload">` ディレクティブをビルドされた HTML に自動的に生成します。

### 非同期チャンク読み込みの最適化

実際のアプリケーションでは、Rollup は「共通の」チャンク（2 つ以上の他のチャンク間で共有されるコード）を生成することがよくあります。動的インポートと組み合わせると、次のシナリオが発生するのが非常に一般的です。

<script setup>
import graphSvg from '../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

最適化されていないシナリオでは、非同期チャンク `A` がインポートされると、ブラウザは、共通チャンク `C` も必要と判断する前に、`A` を要求して解析する必要があります。これにより、余分なネットワークラウンドトリップが発生します。

```
Entry ---> A ---> C
```

Vite は、プリロードステップを使用してコード分割動的インポート呼び出しを自動的に書き換え、`A` が要求されたときに、`C` が**並列**にフェッチされるようにします:

```
Entry ---> (A + C)
```

これは `C` がさらにインポートする可能性があり、最適化されていないシナリオではさらに多くのラウンドトリップが発生します。Vite の最適化は、すべての直接インポートをトレースして、インポートの深さに関係なく、ラウンドトリップを完全に排除します。
