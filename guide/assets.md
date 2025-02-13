# 静的アセットの取り扱い

- 関連: [Public Base Path](./build#public-base-path)
- 関連: [`assetsInclude` 設定オプション](/config/shared-options.md#assetsinclude)

## Importing Asset as URL

静的アセットをインポートすると、配信された際に解決されたパブリックな URL が返されます:

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

例えば、 `imgUrl` は、開発中は `/src/img.png` となり、本番用ビルドでは `/assets/img.2d8efhg.png` となります。

振る舞いは webpack の `file-loader` に似ています。異なるのは、絶対的なパブリックパス（開発中のプロジェクトのルートに基づく）または、相対パスを使用することができるという点です。

- CSS 内の `url()` の参照も同様に扱われます。

- Vue プラグインを使用している場合、 Vue の SFC テンプレート内の asset references も自動的にインポートに変換されます。

- 一般的な画像、メディア、フォントなどの拡張子は自動的にアセットとして検出されます。また、[`assetsInclude` オプション](/config/shared-options.md#assetsinclude) で内部リストを拡張することができます。

- 参照されたアセットは build assets graph の一部として含まれ、ハッシュ化されたファイル名を取得し、プラグインを用いて最適化されます。

- [`assetsInlineLimit` オプション](/config/build-options.md#build-assetsinlinelimit) で指定したバイト数よりも小さいアセットは base64 データの URL としてインライン化されます

- Git LFS のプレースホルダーは、それが表すファイルの内容を含んでいないため、自動的にインライン化の対象から除外されます。インライン化するには、ビルドする前に必ずファイルの内容を Git LFS 経由でダウンロードするようにしてください。

- TypeScript はデフォルトでは静的アセットのインポートを有効なモジュールとして認識しません。これを修正するには、[`vite/client`](./features#client-types)を追加します。

::: tip `url()` を用いた SVG のインライン化
SVG の URL を JS により手動で構築した `url()` に渡すときには、変数をダブルクオートで囲む必要があります。 

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### 明示的な URL のインポート {#explicit-url-imports}

内部リストや `assetsInclude` に含まれていないアセットは URL の末尾に `?url` を付与することで明示的にインポートできます。これは、例えば [Houdini Paint Worklets](https://developer.mozilla.org/ja/docs/Web/API/CSS/paintWorklet_static) をインポートするときに便利です。

```js twoslash
import 'vite/client'
// ---cut---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### 明示的なインライン処理

アセットは、`?inline` または `?no-inline` 接尾辞を使用することで、それぞれインラインまたは非インラインで明示的にインポートできます。

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### アセットを文字列としてインポートする {#importing-asset-as-string}

アセットは末尾に `?raw` を付与することで文字列としてインポートすることができます。

```js twoslash
import 'vite/client'
// ---cut---
import shaderString from './shader.glsl?raw'
```

### スクリプトを Worker としてインポートする

スクリプトは末尾に `?worker` もしくは `?sharedworker` を付与することで web workers としてインポートすることができます。

```js twoslash
import 'vite/client'
// ---cut---
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---cut---
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---cut---
// Inlined as base64 strings
import InlineWorker from './shader.js?worker&inline'
```

詳細は [Web Worker section](./features.md#web-workers) を参照してください。

## `public` ディレクトリー {#the-public-directory}

アセットが以下のような場合のとき:

- ソースコードで参照されない（例： `robots.txt`）
- 全く同じファイル名を保持する必要がある（ハッシュ化しない）
- …または、アセットの URL を取得するためだけに、アセットのインポートを単純に書きたくない

そのとき、プロジェクトのルート配下の特別な `public` ディレクトリーにアセットを置くことができます。このディレクトリーに配置されたアセットは開発環境ではルートパス `/` で提供され、そのまま dist ディレクトリーのルートにコピーされます。

ディレクトリーのデフォルトは `<root>/public` ですが、 [`publicDir` オプション](/config/shared-options.md#publicdir) で設定することができます。

`public` アセットは常にルート絶対パスを使用して参照する必要があることに注意してください。たとえば、`public/icon.png` はソースコード内で `/icon.png` として参照する必要があります。

## new URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/import.meta) は現在のモジュールの URL を公開するネイティブ ESM の機能です。ネイティブの [URL コンストラクター](https://developer.mozilla.org/ja/docs/Web/API/URL)と組み合わせることで、JavaScript モジュールからの相対パスを使用して静的アセットの完全に解決された URL を取得できます:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

これはモダンブラウザーでネイティブに動作します。実際、開発中に Vite はこのコードを処理する必要が全くありません！

このパターンはテンプレートリテラルによる動的な URL もサポートします:

```js
function getImageUrl(name) {
  // サブディレクトリー内のファイルは含まれないことに注意してください
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

本番環境では、バンドル後やアセットハッシュ化の後でも URL が正しい場所を指すように、Vite が必要な変換を行ないます。ただし、URL の文字列は解析できるように静的である必要があります。そうでない場合はコードがそのまま残ってしまい、`build.target` が `import.meta.url` をサポートしていない場合はランタイムエラーが発生する可能性があります。

```js
// Vite はこれを変換しません
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details 動作の仕組み

Vite は `getImageUrl` 関数を次のように変換します:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning SSR では動作しません
ブラウザーと Node.js で `import.meta.url` のセマンティクスが異なるため、 このパターンは Vite をサーバーサイドレンダリングで使用している場合には動作しません。サーバーバンドルは事前にクライアントホストの URL を決定することもできません。
:::
