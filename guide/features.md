# 特徴

基本的に、Viteを使用した開発は静的ファイルサーバを使用した時とそれほど変わりません。 しかし、Viteはバンドラベースのセットアップで一般的な機能をサポートするためにネイティブESMをインポートすることで様々な拡張機能を提供します。

## NPM の依存関係の解決と先読みされるバンドル

ネイティブ ES のインポートは次のような生のモジュールをサポートしていません:

```js
import { someMethod } from 'my-dep'
```

上のようなコードはブラウザでエラーになります。Vite は提供される全てのソースファイルでこのような生のモジュールのインポートを検出し以下を実行します:

1. [先読みバンドル](./dep-pre-bundling) はページの読み込み速度を改善し、CommonJS / UMDモジュールを ESM に変換します。 先読みバンドルは [esbuild](http://esbuild.github.io/) で実行され、Vite のコールドスタート時間を  JavaScript ベースのバンドラーよりも大幅に高速化します。

2. インポートを `/node_modules/.vite/my-dep.js?v=f3sf2ebd` のように書き換えることでブラウザが正しくモジュールをインポートできるようにします。

**依存関係は積極的にキャッシュされます**

ViteはHTTPヘッダーを介して依存関係のリクエストをキャッシュするため、依存関係をローカルで編集/デバッグする場合は、[ここの手順](./dep-pre-bundling#browser-cache)に従います。

## Hot Module Replacement

Vite はネイティブ ESM を介して [HMR API](./api-hmr) を提供します。 HMR 機能を備えたフレームワークは、API を活用して、ページを再読み込みしたり、アプリケーションの状態を損失することなく即座に正確な更新を提供できます。 Vite は[Vue Single File Components](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) および [React Fast Refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh) ファーストパーティの HMR を提供します。[@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) を介した Preact の統合された公式のライブラリもあります。

これらを手動で設定する必要がないことには注意してください -  [create an app via `@vitejs/create-app`](./) を介してアプリケーションを作成する場合、これらはすでに構成されています。

## TypeScript

Vite は `.ts` ファイルをインポートすることをサポートしています。

Vite は `.ts` ファイルに対してのみ変換を実行し、型チェックは **実行しません**。 型チェックは IDE とビルドの過程にて実行されることを前提としています (ビルドスクリプト内で `tsc --noEmit` を実行するか、`vue-tsc` をインストールして `vue-tsc --noEmit` を実行することで `*.vue` ファイルの型チェックもできます)。

Vite は [esbuild](https://github.com/evanw/esbuild) を用いて TypeScriptをJavaScriptに変換します。 これは、vanilla の `tsc` よりも約20〜30倍高速であり、HMR の更新は50ミリ秒未満でブラウザーに反映されます

`esbuild` は型情報なしでビルドを実行するため、 const や enum の暗黙の型のみのインポートなどの特定の機能はサポートしていません。 TypeScript が分離されたトランスパイルで機能しない機能に対して警告するように、`compilerOptions`の下の `tsconfig.json` で `"isolatedModules"：true` を設定する必要があります。

### クライアントのタイプ

Vite はデフォルトでは Node.js の API を提供します. Vite でクライアント用のコードを使用するには `tsconfig` で `compilerOptions.types` に `vite/client`  を追加します:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

これにより次のことが提供されます:

- アセットのインポート (例: `.svg` ファイルのインポート)
- `import.meta.env` に Vite が挿入した [env variables](./env-and-mode#env-variables) のタイプ
- `import.meta.hot` の [HMR API](./api-hmr) のタイプ

## Vue

Vite は Vue に対して最高のサポートをします:

- Vue 3 SFC はこちら [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)
- Vue 3 JSX はこちら [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)
- Vue 2 はこちら [underfin/vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2)

## JSX

`.jsx` と `.tsx` も標準サポートされます。 JSX のトランスパイルも [ESBuild](https://esbuild.github.io) を介して行われます, デフォルトはReact16フレーバーですが、ESBuildでのReact17スタイルのJSXサポートが追跡されます。[詳しくはこちら](https://github.com/evanw/esbuild/issues/334)。

Vue を使用している人は公式のプラグインである [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx) を使用するべきです、 これは、HMR、グローバルコンポーネント解決、ディレクティブ、スロットなど、Vue 3 の固有の機能を提供します。

もしReact、または Vue で JSX を使用していない場合は, [`esbuild` option](/config/#esbuild) を使用して `jsxFactory` および `jsxFragment` を構成することができます。 例えば、 Preact の場合:

```js
// vite.config.js
export default {
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
}
```

さらに詳しく知りたい場合は [ESBuild docs](https://esbuild.github.io/content-types/#jsx) を見てください。

また、`jsxInject`（Viteのみのオプション）を使用して JSX ヘルパーを挿入し、手動インポートを回避できます。

```js
// vite.config.js
export default {
  esbuild: {
    jsxInject: `import React from 'react'`
  }
}
```

## CSS

`.css` ファイルをインポートすると、HMRをサポートする `<style>` タグを介してそのコンテンツがページに挿入されます。モジュールのデフォルトのエクスポートとして、処理されたCSSを文字列として取得することもできます。

### `@import` のインライン化と結合

Viteは、`postcss-import` を介した CSS `@ import` のインライン化をサポートするように事前構成されています。 CSS `@import` では、Viteエイリアスも尊重されます。さらに、インポートされたファイルが異なるディレクトリにある場合でも、すべてのCSS `url()` 参照は、正確性を確保するために常に自動的に結合されます。

`@import` エイリアスと URL の結合もSassファイルとLessファイルでサポートされています (詳しくはこちら [CSS Pre-processors](#css-pre-processors))。

### PostCSS

もしプロジェクトに有効な PostCSS が含まれている場合 ([postcss-load-config](https://github.com/postcss/postcss-load-config) でサポートされている任意の形式、例: `postcss.config.js`)、インポートされたすべてのCSSに自動的に適用されます。

### CSS Modules

`.module.css` で終わる全ての CSS ファイルは全て [CSS modules file](https://github.com/css-modules/css-modules) とみなされます。 このようなファイルをインポートすると、対応するモジュールオブジェクトが返されます:

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

CSS モジュールの動作は [`css.modules` option](/config/#css-modules) を参考にしてください。

`css.modules.localsConvention` がキャメルケースローカルを有効にするように設定されている場合（例：`localsConvention: 'camelCaseOnly'`）、名前付きインポートを使用することもできます:

```js
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS プリプロセッサ

Vite は最新のブラウザのみを対象としているため、CSSWG ドラフト（[postcss-nesting](https://github.com/jonathantneal/postcss-nesting) など）を実装する PostCSS プラグインでネイティブ CSS 変数を使用し、将来の標準に準拠したプレーンなCSSを作成することをお勧めします。

とは言うものの、Vite は `.scss`、`.sass`、 `.less`、`.styl`、 `.stylus` ファイルの組み込みサポートを提供します。それら にVite 固有のプラグインをインストールする必要はありませんが、対応するプリプロセッサ自体をインストールする必要があります。

```bash
# .scss and .sass
npm install -D sass

# .less
npm install -D less

# .styl and .stylus
npm install -D stylus
```

もし Vue で単一ファイルコンポーネントを使用している場合、これにより、 `<style lang =" sass ">` なども自動的に有効になります。

Viteは、SassおよびLessの `@import` 解決を改善し、Vite エイリアスも尊重されるようにします。さらに、ルートファイルとは異なるディレクトリにあるインポートされた Sass / Less ファイル内の相対的な `url()` の参照も、正確性を確保するために自動的に結合されます。

`@import` エイリアスと URL の結合は、API の制約のため、Stylus ではサポートされていません。

ファイル拡張子の前に `.module` を付けることで、プリプロセッサと組み合わせて CSS モジュールを使用することもできます（例：`style.module.scss`）。

## 静的なアセット

静的アセットをインポートすると、提供時に解決されたパブリックURLが返されます:

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
// ウェブワーカーをロードする
import Worker from './worker.js?worker'
```

```js
// ビルド時に base64 文字列としてインライン化されたウェブワーカー
import InlineWorker from './worker.js?worker&inline'
```

詳しくは [Static Asset Handling](./assets) を見てください。

## JSON

JSON ファイルは直接インポートできます - また、名前付きインポートもサポートされています：:

```js
// オブジェクト全体をインポートする場合
import json from './example.json'
// 名前付きエクスポートとしてルートフィールドをインポートします - ツリーシェイクに役立ちます！
import { field } from './example.json'
```

## Glob のインポート

Viteは、特別な `import.meta.glob` 関数を介してファイルシステムから複数のモジュールをインポートすることをサポートしています:

```js
const modules = import.meta.glob('./dir/*.js')
```

上のコードは以下のように変換されます:

```js
// vite によって生成されたコード
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}
```

次に、 `modules` オブジェクトのキーを繰り返し処理して、対応するモジュールにアクセスできます:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

一致したファイルはデフォルトで動的インポートを介して遅延ロードされ、ビルド中に個別のチャンクに分割されます。 もしあなたがすべてのモジュールを直接インポートする場合（たとえば、最初に適用されるこれらのモジュールの副作用に依存する場合）、代わりに `import.meta.globEager` を使用できます:

```js
const modules = import.meta.globEager('./dir/*.js')
```

上のコードは以下のように変換されます:

```js
// vite によって生成されたコード
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

注意点:

- これは Vite のみの機能であり、Web または ES の標準ではありません。
- Glob パターンはインポート指定子のように扱われます。相対パス（`./`で始まる）または絶対パス（`/`で始まり、プロジェクトルートに対して解決される）のいずれかである必要があります。
- Glob のマッチングは `fast-glob` を介して行われます。サポートされている Glob パターンについては、その[ドキュメント](https://github.com/mrmlnc/fast-glob#pattern-syntax)を確認してください。

## Web Assembly

プリコンパイルされた `.wasm` ファイルは直接インポートできます - デフォルトのエクスポートは、wasm インスタンスの exports オブジェクトの Promise を返す初期化関数になります:

```js
import init from './example.wasm'

init().then((exports) => {
  exports.test()
})
```

init関数は、第2引数として `WebAssembly.instantiate` に渡される` imports` オブジェクトを受け取ることもできます:

```js
init({
  imports: {
    someFunc: () => {
      /* ... */
    }
  }
}).then(() => {
  /* ... */
})
```

本番ビルドでは、 `assetInlineLimit` よりも小さい` .wasm` ファイルが base64 文字列としてインライン化されます。それ以外の場合は、アセットとして dist ディレクトリにコピーされ、オンデマンドでフェッチされます。

## Web Workers

インポートリクエストに `？worker` を追加することで、Web ワーカースクリプトを直接インポートできます。デフォルトのエクスポートはカスタムワーカーコンストラクタになります:

```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

ワーカースクリプトは、`importScripts()` の代わりに `import` ステートメントを使用することもできます - この機能は現在開発中であり、ブラウザーのネイティブサポートに依存し、現在Chromeでのみ機能しますが、本番ビルドではコンパイルされます。

デフォルトでは、ワーカースクリプトは本番ビルドで個別のチャンクとして出力されます。ワーカーを base64 文字列としてインライン化する場合は、`inline` クエリを追加します:

```js
import MyWorker from './worker?worker&inline'
```

## ビルドの最適化

> 以下にリストされている機能は、ビルドプロセスの一部として自動的に適用され、無効にする場合を除いて、明示的に構成する必要はありません。

### dynamic importされる Polyfill

Vite は、コード分割ポイントとして ES dynamic importを使用します。 生成されたコードは、dynamic importを使用して非同期チャンクもロードします。 しかし、ネイティブ ESM dynamic importサポートは、スクリプトタグを介して ESM よりも遅く着陸し、2つの機能の間にブラウザーサポートの不一致があります。 Vite は、軽量の[dynamic importされる Polyfill](https://github.com/GoogleChromeLabs/dynamic-import-polyfill) を自動的に挿入して、その違いを緩和します。

ネイティブの動的インポートをサポートするブラウザのみを対象としていることがわかっている場合は、この機能を明示的に無効にすることができます。 詳しくは [`build.polyfillDynamicImport`](/config/#build-polyfilldynamicimport) をご覧ください

### CSS のコード分割

Vite は、非同期チャンク内のモジュールによって使用される CSS を自動的に抽出し、そのための個別のファイルを生成します。 CSS ファイルは、関連付けられた非同期チャンクが読み込まれるときに `<link>` タグを介して自動的に読み込まれ、[FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) を回避するために、CSSが読み込まれた後にのみ非同期チャンクが評価されることが保証されます。

もしすべての CSS を1つのファイルに抽出したい場合は、[`build.cssCodeSplit`](/config/#build-csscodesplit) を `false` に設定することで、CSS コードの分割を無効にできます。

### プリロードディレクティブの生成

Vite は、エントリチャンクとビルドされた HTML への直接インポート用の `<link rel="modulepreload">` ディレクティブを自動的に生成します。

### 非同期チャンク読み込みの最適化

実際のアプリケーションでは、Rollup は「共通の」チャンク（2つ以上の他のチャンク間で共有されるコード）を生成することがよくあります。動的インポートと組み合わせると、次のシナリオが発生するのが非常に一般的です。

![graph](/images/graph.png)

最適化されていないシナリオでは、非同期チャンク `A` がインポートされると、ブラウザは、共通チャンク `C` も必要であると判断する前に、`A` を要求して解析する必要があります。これにより、余分なネットワークラウンドトリップが発生します。

```
Entry ---> A ---> C
```

Vite は、プリロードステップを使用してコード分割動的インポート呼び出しを自動的に書き換え、 `A` が要求されたときに、`C` が**並列**にフェッチされるようにします:

```
Entry ---> (A + C)
```

これは `C` がさらにインポートする可能性があり、最適化されていないシナリオではさらに多くのラウンドトリップが発生します。 Vite の最適化は、すべての直接インポートをトレースして、インポートの深さに関係なく、ラウンドトリップを完全に排除します。
