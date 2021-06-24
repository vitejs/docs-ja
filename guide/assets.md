# 静的アセットの取り扱い

- 関連: [Public Base Path](./build#public-base-path)
- 関連: [`assetsInclude` config option](/config/#assetsinclude)

## Importing Asset as URL

静的アセットをインポートすると、配信された際に解決されたパブリックな URL が返されます:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

例えば、 `imgUrl` は、開発中は `/img.png` となり、本番用ビルドでは `/assets/img.2d8efhg.png` となります。

振る舞いは webpack の `file-loader` に似ています。異なるのは、絶対的なパブリックパス（開発中のプロジェクトのルートに基づく）または、相対パスを使用することができるという点です。

- CSS 内の `url()` の参照も同様に扱われます。

- Vue プラグインを使用している場合、 Vue の SFC テンプレート内の asset references も自動的にインポートに変換されます。

- 一般的な画像、メディア、フォントなどの拡張子は自動的にアセットとして検出されます。また、[`assetsInclude` オプション](/config/#assetsinclude) で内部リストを拡張することができます。

- 参照されたアセットは build assets graph の一部として含まれ、ハッシュ化されたファイル名を取得し、プラグインを用いて最適化されます。

- [`assetsInlineLimit` オプション](/config/#build-assetsinlinelimit) で指定したバイト数よりも小さいアセットは base64 データの URL としてインライン化されます

### 明示的な URL のインポート

内部リストや `assetsInclude` に含まれていないアセットは URL の末尾に `?url` を付与することで明示的にインポートすることができます。これは、例えば [Houdini Paint Worklets](https://houdini.how/usage) をインポートするときに便利です。

```js
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### アセットを文字列としてインポートする

アセットは末尾に `?raw` を付与することで文字列としてインポートすることができます。

```js
import shaderString from './shader.glsl?raw'
```

### スクリプトを Worker としてインポートする

スクリプトは末尾に `?worker` もしくは `?sharedworker` を付与することで web workers としてインポートすることができます。

```js
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js
// Inlined as base64 strings
import InlineWorker from './shader.js?worker&inline'
```

詳細は [Web Worker section](./features.md#web-workers) を参照してください。

## `public` ディレクトリ

アセットが以下のような場合のとき:

- ソースコードで参照されない (例： `robots.txt`)
- 全く同じファイル名を保持する必要がある（ハッシュ化しない）
- …または、アセットの URL を取得するために、単純にアセットをインポートする必要がないとき

そのとき、プロジェクトのルート配下の特別な `public` ディレクトリにアセットを置くことができます。このディレクトリに配置されたアセットは開発環境ではルートパス `/` で提供され、そのまま dist ディレクトリのルートにコピーされます。 

ディレクトリのデフォルトは `<root>/public` ですが、 [`publicDir` option](/config/#publicdir) で設定することができます。

注意点:

- `public` 内のアセットを絶対パスで参照する際は常に次のように行う必要があります。 - 例えば、 `public/icon.png` はソースコード内では `/icon.png` のように参照されなければなりません。
- `public` 内のアセットは、 JavaScript からはインポートすることができません。

## new URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) は現在のモジュールの URL を公開するネイティブ ESM の機能です。ネイティブの [URL コンストラクタ](https://developer.mozilla.org/en-US/docs/Web/API/URL)と組み合わせることで、JavaScript モジュールからの相対パスを使用して静的アセットの完全に解決された URL を取得できます:

```js
const imgUrl = new URL('./img.png', import.meta.url)

document.getElementById('hero-img').src = imgUrl
```

これはモダンブラウザでネイティブに動作します。実際、開発中に Vite はこのコードを処理する必要が全くありません！

このパターンはテンプレートリテラルによる動的な URL もサポートします:

```js
function getImageUrl(name) {
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

本番環境では、バンドル後やアセットハッシュ化の後でも URL が正しい場所を指すように、Vite が必要な変換を行ないます。

::: warning 注意: SSR では動作しません
ブラウザと Node.js で `import.meta.url` のセマンティクスが異なるため、 このパターンは Vite をサーバーサイドレンダリングで使用している場合には動作しません。サーバーバンドルは事前にクライアントホストの URL を決定することもできません。
:::
