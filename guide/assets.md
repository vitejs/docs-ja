# Static Asset の取り扱い

- 関連: [Public Base Path](./build#public-base-path)
- 関連: [`assetsInclude` config option](/config/#assetsinclude)

## Importing Asset as URL

static asset をインポートすると、serve された際に解決されたパブリックな URL が返されます:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

例えば、 `imgUrl` は、開発中は `/img.png` となり、本番用ビルドでは `/assets/img.2d8efhg.png` となります。

振る舞いは webpack の `file-loader` に似ています。異なるのは、絶対的なパブリックパス（開発中のプロジェクトのルートに基づく）または、相対パスを使用することができるという点です。

- CSS 内の `url()` の参照も同様に扱われます。

- Vue プラグインを使用している場合、 Vue の SFC テンプレートも自動的にインポートに変換されます。

- Common image, media, and font filetypes are detected as assets automatically. You can extend the internal list using the [`assetsInclude` option](/config/#assetsinclude).

- Referenced assets are included as part of the build assets graph, will get hashed file names, and can be processed by plugins for optimization.

- Assets smaller in bytes than the [`assetsInlineLimit` option](/config/#assetsinlinelimit) will be inlined as base64 data URLs.

### Explicit URL Imports

Assets that are not included in the internal list or in `assetsInclude`, can be explicitly imported as an URL using the `?url` suffix. This is useful, for example, to import [Houdini Paint Worklets](https://houdini.how/usage).

```js
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Importing Asset as String

Assets can be imported as strings using the `?raw` suffix.

```js
import shaderString from './shader.glsl?raw'
```

### Importing Script as a Worker

Scripts can be imported as web workers with the `?worker` suffix. 

```js
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js
// Inlined as base64 strings
import InlineWorker from './shader.js?worker&inline'
```

Check out the [Web Worker section](./features.md#web-workers) for more details.

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
