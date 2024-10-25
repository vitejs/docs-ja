# 特徴

基本的に、Vite を使用した開発は静的ファイルサーバーを使用した時とそれほど変わりません。しかし、Vite はバンドラーベースのセットアップで一般的な機能をサポートするためにネイティブ ESM をインポートすることで様々な拡張機能を提供します。

## npm の依存関係の解決と事前バンドル

ネイティブ ES のインポートは次のような生のモジュールをサポートしていません:

```js
import { someMethod } from 'my-dep'
```

上のようなコードはブラウザーでエラーになります。Vite は提供される全てのソースファイルでこのような生のモジュールのインポートを検出し以下を実行します:

1. [事前バンドル](./dep-pre-bundling) はページの読み込み速度を改善し、CommonJS / UMD モジュールを ESM に変換します。事前バンドルは [esbuild](http://esbuild.github.io/) で実行され、Vite のコールドスタート時間をどんな JavaScript ベースのバンドラーよりも大幅に高速にします。

2. インポートを `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` のように書き換えることでブラウザーが正しくモジュールをインポートできるようにします。

**依存関係は積極的にキャッシュされます**

Vite は HTTP ヘッダーを介して依存関係のリクエストをキャッシュするため、依存関係をローカルで編集/デバッグする場合は、[ここの手順](./dep-pre-bundling#browser-cache)に従ってください。

## Hot Module Replacement

Vite はネイティブ ESM を介して [HMR API](./api-hmr) を提供します。HMR 機能を備えたフレームワークは、API を活用して、ページを再読み込みしたり、アプリケーションの状態を損失することなく即座に正確な更新を提供できます。Vite は [Vue の単一ファイルコンポーネント](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) および [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) に対しての HMR 統合を提供します。[@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) を介した Preact の統合された公式のライブラリーもあります。

これらを手動で設定する必要がないことには注意してください - [`create-vite` を介してアプリケーションを作成する](./)場合、これらはすでに構成されています。

## TypeScript

Vite は `.ts` ファイルをインポートすることをサポートしています。

### トランスパイルのみ

Vite は `.ts` ファイルのトランスパイルを行うだけで、型チェックは**行わない**ことに注意してください。型チェックは IDE やビルドプロセスで行われることを想定しています。

Vite が変換処理の一部として型チェックを行わないのは、この 2 つのジョブが根本的に異なる動作をするからです。トランスパイルはファイル単位で行うことができ、Vite のオンデマンドコンパイルモデルと完全に調和しています。これに対して、型チェックはモジュールグラフ全体についての知識が必要です。Vite の変換パイプラインに型チェックを組み込むと、必然的に Vite の利点であるスピードが損なわれてしまいます。

Vite の仕事は、ソースモジュールをできるだけ速くブラウザーで実行できる形にすることです。そのため、Vite の変換パイプラインから静的解析チェックを切り離すことをお勧めします。この原則は、ESLint のような他の静的解析チェックにも当てはまります。

- プロダクションビルドの場合は、Vite のビルドコマンドに加えて、`tsc --noEmit` を実行できます。

- 開発中、IDE のヒント以上が必要な場合は、別プロセスで `tsc --noEmit --watch` を実行するか、型エラーをブラウザーに直接報告させたい場合は [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) を使用することをおすすめします。

Vite は [esbuild](https://github.com/evanw/esbuild) を用いて TypeScript を JavaScript に変換します。これは、vanilla の `tsc` よりも約 20〜30 倍速く、HMR の更新は 50 ミリ秒未満でブラウザーに反映されます

[型のみのインポートやエクスポート](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)構文を使用すると、型のみのインポートが正しくバンドルされないなどの潜在的な問題を回避できます。例えば:

```ts
import type { T } from 'only/types'
export type { T }
```

### TypeScript コンパイラーオプション

`tsconfig.json` の `compilerOptions` にあるいくつかの設定フィールドには、特別な注意が必要です。

#### `isolatedModules`

- [TypeScript ドキュメント](https://www.typescriptlang.org/tsconfig#isolatedModules)

`true` に設定する必要があります。

`esbuild` は型情報なしにトランスパイルを行うだけなので、const enum や暗黙の型のみのインポートなどの特定の機能をサポートしていないからです。

隔離されたトランスパイルで動作しない機能を TS が警告するように、`tsconfig.json` の `compilerOptions` で `"isolatedModules": true` を設定する必要があります。

もし依存関係が `"isolatedModules": true` でうまく動作しない場合は、`"skipLibCheck": true` を使用すると、アップストリームで修正されるまで一時的にエラーを抑制できます。

#### `useDefineForClassFields`

- [TypeScript ドキュメント](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

Vite 2.5.0 からは、TypeScript ターゲットが `ESNext` か `ES2022` 以上の場合、デフォルト値は `true` になります。これは [`tsc` 4.3.2 以降の動作](https://github.com/microsoft/TypeScript/pull/42663)と一致しています。また、これは ECMAScript の標準的なランタイムの動作でもあります。

他の TypeScript ターゲットはデフォルトで `false` になります。

しかし、他のプログラミング言語や古いバージョンの TypeScript を使用している人にとっては直感的に理解できないかもしれません。
移行の詳細については、[TypeScript 3.7 リリースノート](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier)を参照してください。

クラスフィールドに大きく依存しているライブラリーを使用している場合は、そのライブラリーが意図している使い方に注意してください。

[MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties) などのほとんどのライブラリーは `"useDefineForClassFields": true` を想定しています。

しかし、[`lit-element`](https://github.com/lit/lit-element/issues/1030) など、まだこの新しいデフォルトに移行していないライブラリーもあります。これらの場合は、明示的に `useDefineForClassFields` を `false` に設定してください。

#### `target`

- [TypeScript ドキュメント](https://www.typescriptlang.org/tsconfig#target)

Vite は `esbuild` と同じ動作に従い、`tsconfig.json` 内の `target` の値を無視します。

開発中に target を指定するには [`esbuild.target`](/config/shared-options.html#esbuild) オプションを使用することができ、トランスパイルを最小限に抑えるためにデフォルトで `esnext` に設定されます。ビルドでは、[`build.target`](/config/build-options.html#build-target) オプションが優先され、必要に応じて設定することができます。

::: warning `useDefineForClassFields`
`tsconfig.json` 内の `target` が `ESNext` または `ES2022` 以降でない場合、または `tsconfig.json` ファイルがない場合、`useDefineForClassFields` のデフォルトは `false` になり、`esbuild.target` のデフォルト値が `esnext` の場合に問題が発生する可能性があります。これは[静的初期化ブロック](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility)にトランスパイルされる可能性があり、ブラウザーでサポートされていない可能性があります。

そのため、`tsconfig.json` を設定する際には、`target` を `ESNext` または `ES2022` 以降に設定するか、`useDefineForClassFields` を明示的に `true` に設定することをおすすめします。
:::

### ビルド結果に影響するその他のコンパイラーオプション

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
Vite のスターターテンプレートでは依存関係の型チェックを避けるため、デフォルトで `"skipLibCheck": "true"` となっています。これは TypeScript の特定のバージョンや設定のみをサポートするように選択できるようにするためです。詳しくは [vuejs/vue-cli#5688](https://github.com/vuejs/vue-cli/pull/5688) を参照してください。
:::

### クライアントでの型 {#client-types}

Vite はデフォルトでは Node.js の API を提供します。Vite でクライアント用のコードを使用するには `d.ts` の定義ファイルを追加します:

```typescript
/// <reference types="vite/client" />
```

または、`tsconfig.json` 内の `compilerOptions.types` に `vite/client` を追加することもできます:

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

これにより次のことが提供されます:

- アセットのインポート（例: `.svg` ファイルのインポート）
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

React や Vue 以外で JSX を使用している場合は、[`esbuild` オプション](/config/shared-options.md#esbuild) を使用してカスタムの `jsxFactory` および `jsxFragment` を設定できます。例えば、Preact の場合:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

さらに詳しく知りたい場合は [esbuild docs](https://esbuild.github.io/content-types/#jsx) を見てください。

また、`jsxInject`（Vite のみのオプション）を使用して JSX ヘルパーを挿入し、手動インポートを回避できます。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

`.css` ファイルをインポートすると、HMR をサポートする `<style>` タグを介してそのコンテンツがページに挿入されます。

### `@import` のインライン化と書き換え

Vite は、`postcss-import` を介した CSS `@import` のインライン化をサポートするように事前構成されています。CSS `@import` では、Vite エイリアスも尊重されます。さらに、インポートされたファイルが異なるディレクトリーにある場合でも、すべての CSS `url()` 参照は、正確性を確保するために常に自動的に書き換えられます。

`@import` エイリアスと URL の書き換えは Sass ファイルと Less ファイルでもサポートされています（[CSS Pre-processors](#css-pre-processors)を参照）。

### PostCSS

もしプロジェクトに有効な PostCSS が含まれている場合（[postcss-load-config](https://github.com/postcss/postcss-load-config) でサポートされている任意の形式、例: `postcss.config.js`）、インポートされたすべての CSS に自動的に適用されます。

CSS の圧縮は PostCSS の後に実行され、[`build.cssTarget`](/config/build-options.md#build-csstarget) オプションを使用することに注意してください。

### CSS Modules

`.module.css` で終わる全ての CSS ファイルは全て [CSS modules file](https://github.com/css-modules/css-modules) とみなされます。このようなファイルをインポートすると、対応するモジュールオブジェクトが返されます:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---cut---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

CSS モジュールの動作は [`css.modules` オプション](/config/shared-options.md#css-modules) により設定できます。

`css.modules.localsConvention` がキャメルケースローカルを有効にするように設定されている場合（例：`localsConvention: 'camelCaseOnly'`）、名前付きインポートを使用することもできます:

```js twoslash
import 'vite/client'
// ---cut---
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS プリプロセッサー {#css-pre-processors}

Vite は最新のブラウザーのみを対象としているため、CSSWG ドラフト（[postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) など）を実装する PostCSS プラグインでネイティブ CSS 変数を使用し、将来の標準に準拠したプレーンな CSS を作成することをお勧めします。

とは言うものの、Vite は `.scss`、`.sass`、`.less`、`.styl`、`.stylus` ファイルの組み込みサポートを提供します。それらに Vite 固有のプラグインをインストールする必要はありませんが、対応するプリプロセッサー自体をインストールする必要があります。

```bash
# .scss and .sass
npm add -D sass-embedded # または sass

# .less
npm add -D less

# .styl and .stylus
npm add -D stylus
```

もし Vue で単一ファイルコンポーネントを使用している場合、これにより、`<style lang="sass">` なども自動的に有効になります。

Vite は、Sass および Less の `@import` 解決を改善し、Vite エイリアスも尊重されるようにします。さらに、ルートファイルとは異なるディレクトリーにあるインポートされた Sass / Less ファイル内の相対的な `url()` の参照も、正確性を確保するために自動的に書き換えられます。

`@import` エイリアスと URL の書き換えは、API の制約のため、Stylus ではサポートされていません。

ファイル拡張子の前に `.module` を付けることで、プリプロセッサーと組み合わせて CSS モジュールを使用することもできます（例：`style.module.scss`）。

### ページへの CSS 注入の無効化

CSS コンテンツの自動注入は `?inline` クエリーパラメータでオフにできます。この場合、処理された CSS 文字列は通常通りモジュールのデフォルトエクスポートとして返されますが、スタイルはページに注入されません。

```js twoslash
import 'vite/client'
// ---cut---
import './foo.css' // ページに注入される
import otherStyles from './bar.css?inline' // 注入されない
```

::: tip 注意
Vite 5 以降、CSS ファイルからのデフォルトインポートおよび名前付きインポート（例：`import style from './foo.css'`）は削除されました。代わりに `?inline` クエリーを使用してください。
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
Lightning CSS 使用時は、[CSS プリプロセッサー](#css-pre-processors)はサポートされていません。
:::

## 静的なアセット

静的アセットをインポートすると、提供時に解決されたパブリック URL が返されます:

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

特別なクエリーにより、アセットの読み込み方法を変更できます:

```js twoslash
import 'vite/client'
// ---cut---
// アセットを URL として明示的にロードする
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---cut---
// アセットを文字列として明示的にロードする
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---cut---
// Web ワーカーをロードする
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---cut---
// ビルド時に base64 文字列としてインライン化された Web ワーカー
import InlineWorker from './worker.js?worker&inline'
```

詳しくは [静的アセットの取り扱い](./assets) を見てください。

## JSON

JSON ファイルは直接インポートできます - また、名前付きインポートもサポートされています：

```js twoslash
import 'vite/client'
// ---cut---
// オブジェクト全体をインポートする場合
import json from './example.json'
// 名前付きエクスポートとしてルートフィールドをインポートします - ツリーシェイクに役立ちます！
import { field } from './example.json'
```

## Glob のインポート

Vite は、特別な `import.meta.glob` 関数を介してファイルシステムから複数のモジュールをインポートすることをサポートしています:

```js twoslash
import 'vite/client'
// ---cut---
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

```js twoslash
import 'vite/client'
// ---cut---
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

### マルチパターン

第 1 引数は下記の例のように glob の配列を指定できます

```js twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### ネガティブパターン

ネガティブ glob パターンもサポートされています（接頭辞は `!`）。一部のファイルを結果から無視させるには、最初の引数に除外 glob パターンを追加します:

```js twoslash
import 'vite/client'
// ---cut---
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

```ts twoslash
import 'vite/client'
// ---cut---
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

```ts twoslash
import 'vite/client'
// ---cut---
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

```ts twoslash
import 'vite/client'
// ---cut---
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

#### カスタムクエリー

また、`query` オプションを使用すると、クエリーをインポートに指定することもできます。たとえば、アセットを[文字列として](https://vite.dev/guide/assets.html#importing-asset-as-string)または [url として](https://vite.dev/guide/assets.html#importing-asset-as-url)インポートするには、次のように書きます:

```ts twoslash
import 'vite/client'
// ---cut---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// vite によって生成されるコード:
const moduleStrings = {
  './dir/foo.svg': () => import('./dir/foo.js?raw').then((m) => m['default']),
  './dir/bar.svg': () => import('./dir/bar.js?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/foo.svg': () => import('./dir/foo.js?url').then((m) => m['default']),
  './dir/bar.svg': () => import('./dir/bar.js?url').then((m) => m['default']),
}
```

他のプラグインが使用するカスタムクエリーを指定することもできます:

```ts twoslash
import 'vite/client'
// ---cut---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### Glob インポートの注意事項

注意点:

- これは Vite のみの機能で、Web または ES の標準ではありません。
- Glob パターンはインポート指定子のように扱われます。相対パス（`./` で始まる）か絶対パス（`/` で始まり、プロジェクトルートに対して相対的に解決される）、またはエイリアスのパス（[`resolve.alias` オプション](/config/shared-options.md#resolve-alias) 参照）のいずれかでなければなりません。
- Glob のマッチングは [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) を介して行われます。
- また、`import.meta.glob` の引数はすべて**リテラル構文として渡さなければならない**ことに注意が必要です。変数や式は使えません。

## Dynamic Import

[glob import](#glob-import) と同様に、 Vite は変数を使った動的インポートをサポートしています。

```ts
const module = await import(`./dir/${file}.js`)
```

変数は 1 階層分のファイル名しか表さない点に注意してください。`file` が `'foo/bar'` の場合、インポートは失敗します。より高度な使い方をしたい場合は、[glob import](#glob-import) の機能を使うことができます。

## WebAssembly

`?init` を使うことでプリコンパイルされた `.wasm` ファイルをインポートできます。
デフォルトのエクスポートは、[`WebAssembly.Instance`](https://developer.mozilla.org/ja/docs/WebAssembly/JavaScript_interface/Instance) の Promise を返す初期化関数になります:

```js twoslash
import 'vite/client'
// ---cut---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

init 関数は、第 2 引数として [`WebAssembly.instantiate`](https://developer.mozilla.org/ja/docs/WebAssembly/JavaScript_interface/instantiate) に渡される importObject を受け取ることもできます:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---cut---
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
[`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) か、もしくは他のコミュニティーのプラグインを使用して対処してください。
:::

### WebAssembly モジュールへのアクセス

もし `Module` オブジェクトにアクセスする必要がある場合、例えば複数回インスタンス化する場合は、[明示的な URL のインポート](./assets#explicit-url-imports)を使用してアセットを解決してから、インスタンス化を実行してください:

```js twoslash
import 'vite/client'
// ---cut---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### Node.js でモジュールをフェッチする

SSR では、`?init` インポートの一部として発生する `fetch()` は `TypeError: Invalid URL` で失敗する可能性があります。
[SSR での wasm のサポート](https://github.com/vitejs/vite/issues/8882)の issue を参照してください。

プロジェクトのベースが現在のディレクトリーであると仮定した場合の代替案を以下に示します:

```js twoslash
import 'vite/client'
// ---cut---
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

### コンストラクターによるインポート

ワーカースクリプトは [`new Worker()`](https://developer.mozilla.org/ja/docs/Web/API/Worker/Worker) や [`new SharedWorker()`](https://developer.mozilla.org/ja/docs/Web/API/SharedWorker/SharedWorker) を使用することでインポートできます。サフィックスによるインポートと比べ、より標準的で**推奨される**ワーカー作成方法となります。

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

ワーカーコンストラクターはオプションを受け取り、「モジュール」ワーカーとして作成することも可能です:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

ワーカーの検出は `new Worker()` 宣言内で直接 `new URL()` コンストラクターが使用される場合にのみ機能します。さらに、すべてのオプションパラメーターは静的な値（つまり、文字列リテラル）でなければなりません。

### クエリーサフィックスによるインポート

インポートリクエストに `?worker` もしくは `?sharedworker` を追加することで、Web ワーカースクリプトを直接インポートできます。デフォルトのエクスポートはカスタムワーカーコンストラクターになります:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

ワーカースクリプトは、`importScripts()` の代わりに ESM の `import` ステートメントを使用することもできます。**注意**: 開発中は[ブラウザーのネイティブサポート](https://caniuse.com/?search=module%20worker)に依存しますが、プロダクションビルドではコンパイルされます。

デフォルトでは、ワーカースクリプトは本番ビルドで個別のチャンクとして出力されます。ワーカーを base64 文字列としてインライン化する場合は、`inline` クエリーを追加します:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker&inline'
```

ワーカーを URL として取得したい場合は、`url` クエリーを追加してください:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker&url'
```

すべてのワーカーをバンドルする設定についての詳細は [Worker Options](/config/worker-options.md) を見てください。

## コンテンツセキュリティポリシー（CSP）

CSP をデプロイするには、Vite 内部の理由により、特定のディレクティブまたは設定を行う必要があります。

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

[`html.cspNonce`](/config/shared-options#html-cspnonce) が設定された場合、Vite は任意の `<script>` および `<style>` タグに加えて、スタイルシートおよびモジュールプリロードのための `<link>` タグに、指定された値を持つ nonce 属性を追加します。`<style>` などの他のタグには nonce 属性を追加しないことに注意してください。それに加えて、このオプションを設定すると、Vite が meta タグ（`<meta property="csp-nonce" nonce="PLACEHOLDER" />`）を挿入するようになります。

`property="csp-nonce"` を持つ meta タグの nonce の値は、Vite により開発中とビルド後のいずれでも必要なときに利用されます。

:::warning
各リクエストごとにユニークな値を持つように、プレースホルダーを必ず置換してください。これはリソースポリシーの回避を防ぐために重要です。もし置換しなければ、簡単に回避されてしまいます。
:::

### [`data:`](<https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#:~:text=%E3%81%BE%E3%81%99%20(%E9%9D%9E%E6%8E%A8%E5%A5%A8)%E3%80%82-,data%3A,-%E3%82%B3%E3%83%B3%E3%83%86%E3%83%B3%E3%83%84%E3%81%AE%E3%82%BD%E3%83%BC%E3%82%B9>)

デフォルトでは、Vite はビルド時に小さなアセットをデータ URI としてインライン化します。関連ディレクティブに対して `data:` を許可するか（例: [`img-src`](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Content-Security-Policy/img-src)、[`font-src`](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Content-Security-Policy/font-src)）、設定 [`build.assetsInlineLimit: 0`](/config/build-options#build-assetsinlinelimit) により無効化する必要があります。

:::warning
[`script-src`](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) に対して `data:` を許可してはいけません。任意のスクリプトのインジェクションを許してしまうことになります。
:::

## ビルドの最適化 {#build-optimizations}

> 以下にリストされている機能は、ビルドプロセスの一部として自動的に適用され、無効にする場合を除いて、明示的に設定する必要はありません。

### CSS のコード分割

Vite は、非同期チャンク内のモジュールによって使用される CSS を自動的に抽出し、そのチャンクに対応するファイルを個別に生成します。CSS ファイルは、関連付けられた非同期チャンクが読み込まれるときに `<link>` タグを介して自動的に読み込まれ、[FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) を回避するために、CSS が読み込まれた後にのみ非同期チャンクが評価されることが保証されます。

もしすべての CSS を 1 つのファイルに抽出したい場合は、[`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) を `false` に設定することで、CSS コードの分割を無効にできます。

### プリロードディレクティブの生成

Vite は、エントリーチャンクとそこから直接インポートされたチャンクの `<link rel="modulepreload">` ディレクティブをビルドされた HTML に自動的に生成します。

### 非同期チャンク読み込みの最適化

実際のアプリケーションでは、Rollup は「共通の」チャンク（2 つ以上の他のチャンク間で共有されるコード）を生成することがよくあります。動的インポートと組み合わせると、次のシナリオが発生するのが非常に一般的です。

<script setup>
import graphSvg from '../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

最適化されていないシナリオでは、非同期チャンク `A` がインポートされると、ブラウザーは、共通チャンク `C` も必要と判断する前に、`A` を要求して解析する必要があります。これにより、余分なネットワークラウンドトリップが発生します。

```
Entry ---> A ---> C
```

Vite は、プリロードステップを使用してコード分割動的インポート呼び出しを自動的に書き換え、`A` が要求されたときに、`C` が**並列**にフェッチされるようにします:

```
Entry ---> (A + C)
```

これは `C` がさらにインポートする可能性があり、最適化されていないシナリオではさらに多くのラウンドトリップが発生します。Vite の最適化は、すべての直接インポートをトレースして、インポートの深さに関係なく、ラウンドトリップを完全に排除します。
