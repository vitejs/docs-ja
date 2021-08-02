# v1 からの移行

## Config Options Change
## 設定オプションの変更

- The following options have been removed and should be implemented via [plugins](./api-plugin):
- 以下のオプションは削除されましたので、[プラグイン](./api-plugin)で実装してください。

  - `resolvers`
  - `transforms`
  - `indexHtmlTransforms`

- `jsx` and `enableEsbuild` have been removed; Use the new [`esbuild`](/config/#esbuild) option instead.
- `jsx` と `enableEsbuild` は削除されました。代わりに新しい [`esbuild`](/config/#esbuild) オプションを使ってください。

- [CSS related options](/config/#css-modules) are now nested under `css`.
- [CSS関連のオプション](/config/#css-modules)は `css` の下に移動しました。

- All [build-specific options](/config/#build-options) are now nested under `build`.
- すべての[ビルドオプション](/config/#ビルドオプション)は `build` の下に移動しました。

  - `rollupInputOptions` and `rollupOutputOptions` are replaced by [`build.rollupOptions`](/config/#build-rollupoptions).
  - `rollupInputOptions` と `rollupOutputOptions` は [`build.rollupOptions`](/config/#build-rollupoptions) に置き換えられました。
  - `esbuildTarget` is now [`build.target`](/config/#build-target).
  - `esbuildTarget` は [`build.target`](/config/#build-target) になりました。
  - `emitManifest` is now [`build.manifest`](/config/#build-manifest).
  - `emitManifest` は [`build.manifest`](/config/#build-manifest) になりました。
  - The following build options have been removed since they can be achieved via plugin hooks or other options:
  - 以下のビルドオプションは、プラグインフックや他のオプションで実現できるため、削除されました:
    - `entry`
    - `rollupDedupe`
    - `emitAssets`
    - `emitIndex`
    - `shouldPreload`
    - `configureBuild`

- All [server-specific options](/config/#server-options) are now nested under
  `server`.
- すべての[サーバーオプション](/config/#サーバオプション)は、`server` の下に移動しました。

  - `hostname` is now [`server.host`](/config/#server-host).
  - `hostname` は [`server.host`](/config/#server-host) になりました。
  - `httpsOptions` has been removed. [`server.https`](/config/#server-https) can directly accept the options object.
  - `httpsOptions` は削除されました。[`server.https`](/config/#server-https) はオプションオブジェクトを直接受け取ることができます。
  - `chokidarWatchOptions` is now [`server.watch`](/config/#server-watch).
  - `chokidarWatchOptions` は [`server.watch`](/config/#server-watch) になりました。

- [`assetsInclude`](/config/#assetsInclude) now expects `string | RegExp | (string | RegExp)[]` instead of a function.
- [`assetsInclude`](/config/#assetsInclude) が、関数ではなく、`string | RegExp | (string | RegExp)[]` を想定するようになりました。

- All Vue specific options are removed; Pass options to the Vue plugin instead.
- すべての Vue 固有のオプションは削除され、代わりに Vue プラグインにオプションを渡します。

## Alias Behavior Change
## Alias の動作変更

[`alias`](/config/#alias) is now being passed to `@rollup/plugin-alias` and no longer require start/ending slashes. The behavior is now a direct replacement, so 1.0-style directory alias key should remove the ending slash:  
[`alias`](/config/#alias) が `@rollup/plugin-alias` に渡されるようになり、開始/終了のスラッシュが不要になりました。この動作は直接置き換わったため、1.0スタイルのディレクトリエイリアスキーから終了のスラッシュを削除する必要があります。

```diff
- alias: { '/@foo/': path.resolve(__dirname, 'some-special-dir') }
+ alias: { '/@foo': path.resolve(__dirname, 'some-special-dir') }
```

Alternatively, you can use the `[{ find: RegExp, replacement: string }]` option format for more precise control.  
また、`[{ find: RegExp, replacement: string }]` というオプション形式を使えば、より精密な制御が可能です。

## Vue Support
## Vue サポート

Vite 2.0 core is now framework agnostic. Vue support is now provided via [`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue). Simply install it and add it in the Vite config:  
Vite 2.0 のコアはフレームワークに依存しないようになりました。Vue のサポートは、[`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) を通じて提供されるようになりました。これをインストールして、Vite の設定に追加してください:


```js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

### Custom Blocks Transforms
### カスタムブロックの変換

A custom plugin can be used to transform Vue custom blocks like the one below:  
カスタムプラグインを使用すると、以下のように Vue のカスタムブロックを変換することができます:

```ts
// vite.config.js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const vueI18nPlugin = {
  name: 'vue-i18n',
  transform(code, id) {
    if (!/vue&type=i18n/.test(id)) {
      return
    }
    if (/\.ya?ml$/.test(id)) {
      code = JSON.stringify(require('js-yaml').safeLoad(code.trim()))
    }
    return `export default Comp => {
      Comp.i18n = ${code}
    }`
  }
}

export default defineConfig({
  plugins: [vue(), vueI18nPlugin]
})
```

## React Support
## React サポート

React Fast Refresh support is now provided via [`@vitejs/plugin-react-refresh`](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh).  
React Fast Refreshのサポートは、[`@vitejs/plugin-react-refresh`](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh) で提供されるようになりました。

## HMR API Change
## HMR API の変更

`import.meta.hot.acceptDeps()` have been deprecated. [`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) can now accept single or multiple deps.  
`import.meta.hot.acceptDeps()` は非推奨となりました。[`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) は、単一または複数の deps を受け入れることができるようになりました。

## Manifest Format Change
## マニフェストフォーマットの変更

The build manifest now uses the following format:
ビルドマニフェストが以下のフォーマットになりました:

```json
{
  "index.js": {
    "file": "assets/index.acaf2b48.js",
    "imports": [...]
  },
  "index.css": {
    "file": "assets/index.7b7dbd85.css"
  }
  "asset.png": {
    "file": "assets/asset.0ab0f9cd.png"
  }
}
```

For entry JS chunks, it also lists its imported chunks which can be used to render preload directives.  
エントリJSチャンクについては、インポートされたチャンクもリストアップされ、プリロードディレクティブのレンダリングに使用できます。

## For Plugin Authors
## プラグイン作成者向け

Vite 2 uses a completely redesigned plugin interface which extends Rollup plugins. Please read the new [Plugin Development Guide](./api-plugin).  
Vite 2 は、Rollup プラグインを拡張し完全に再設計されたプラグインインターフェイスとなっています。新しい[プラグイン開発ガイド](./api-plugin)をお読みください。

Some general pointers on migrating a v1 plugin to v2:  
v1 プラグインを v2 に移行する際の一般的なポイントです:

- `resolvers` -> use the [`resolveId`](https://rollupjs.org/guide/en/#resolveid) hook
- `resolvers` -> [`resolveId`](https://rollupjs.org/guide/en/#resolveid) フックを使ってください。
- `transforms` -> use the [`transform`](https://rollupjs.org/guide/en/#transform) hook
- `transforms` -> [`transform`](https://rollupjs.org/guide/en/#transform) フックを使ってください。
- `indexHtmlTransforms` -> use the [`transformIndexHtml`](./api-plugin#transformindexhtml) hook
- `indexHtmlTransforms` -> [`transformIndexHtml`](./api-plugin#transformindexhtml) フックを使ってください。
- Serving virtual files -> use [`resolveId`](https://rollupjs.org/guide/en/#resolveid) + [`load`](https://rollupjs.org/guide/en/#load) hooks
- 仮想ファイルの提供 -> [`resolveId`](https://rollupjs.org/guide/en/#resolveid) + [`load`](https://rollupjs.org/guide/en/#load) フックを使ってください。
- Adding `alias`, `define` or other config options -> use the [`config`](./api-plugin#config) hook
- `alias`、`define`、その他の設定オプションの追加 -> [`config`](./api-plugin#config) フックを使用してください。

Since most of the logic should be done via plugin hooks instead of middlewares, the need for middlewares is greatly reduced. The internal server app is now a good old [connect](https://github.com/senchalabs/connect) instance instead of Koa.  
ロジックのほとんどはミドルウェアではなくプラグインのフックを介して行われるべきなので、ミドルウェアの必要性は大幅に減少しています。内部のサーバーアプリは、Koa から古き良き [connect](https://github.com/senchalabs/connect) のインスタンスに変わりました。
