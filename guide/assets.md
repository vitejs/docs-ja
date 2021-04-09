# Static Asset の取り扱い

- 関連: [Public Base Path](./build#public-base-path)
- 関連: [`assetsInclude` config option](/config/#assetsinclude)

## Importing Asset as URL

static asset をインポートすると、配信された際に解決されたパブリックな URL が返されます:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

例えば、 `imgUrl` は、開発中は `/img.png` となり、本番用ビルドでは `/assets/img.2d8efhg.png` となります。

振る舞いは webpack の `file-loader` に似ています。異なるのは、絶対的なパブリックパス（開発中のプロジェクトのルートに基づく）または、相対パスを使用することができるという点です。

- CSS 内の `url()` の参照も同様に扱われます。

- Vue プラグインを使用している場合、 Vue の SFC テンプレート内の asset references も自動的にインポートに変換されます。

- 一般的な画像、メディア、フォントなどの拡張子は自動的に assets として検出されます。また、[`assetsInclude` オプション](/config/#assetsinclude) で内部リストを拡張することができます。

- 参照された assets は build assets graph の一部として含まれ、ハッシュ化されたファイル名を取得し、プラグインを用いて最適化されます。

- [`assetsInlineLimit` オプション](/config/#assetsinlinelimit) で指定したバイト数よりも小さい assets は base64 データの URL としてインライン化されます

### 明示的な URL のインポート

内部リストや `assetsInclude` に含まれていない assets は URL の末尾に `?url` を付与することで明示的にインポートすることができます。これは、例えば [Houdini Paint Worklets](https://houdini.how/usage) をインポートするときに便利です。

```js
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Assets を文字列としてインポートする

Assets は末尾に `?raw` を付与することで文字列としてインポートすることができます。

```js
import shaderString from './shader.glsl?raw'
```

### スクリプトを Worker としてインポートする

スクリプトは末尾に `?worker` を付与することで web workers としてインポートすることができます。

```js
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js
// Inlined as base64 strings
import InlineWorker from './shader.js?worker&inline'
```

詳細は [Web Worker section](./features.md#web-workers) を参照してください。

## The `public` Directory

If you have assets that are:

- Never referenced in source code (e.g. `robots.txt`)
- Must retain the exact same file name (without hashing)
- ...or you simply don't want to have to import an asset first just to get its URL

Then you can place the asset in a special `public` directory under your project root. Assets in this directory will be served at root path `/` during dev, and copied to the root of the dist directory as-is.

The directory defaults to `<root>/public`, but can be configured via the [`publicDir` option](/config/#publicdir).

Note that:

- You should always reference `public` assets using root absolute path - for example, `public/icon.png` should be referenced in source code as `/icon.png`.
- Assets in `public` cannot be imported from JavaScript.
