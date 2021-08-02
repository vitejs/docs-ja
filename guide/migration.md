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

[`alias`](/config/#alias) is now being passed to `@rollup/plugin-alias` and no longer require start/ending slashes. The behavior is now a direct replacement, so 1.0-style directory alias key should remove the ending slash:

```diff
- alias: { '/@foo/': path.resolve(__dirname, 'some-special-dir') }
+ alias: { '/@foo': path.resolve(__dirname, 'some-special-dir') }
```

Alternatively, you can use the `[{ find: RegExp, replacement: string }]` option format for more precise control.

## Vue Support

Vite 2.0 core is now framework agnostic. Vue support is now provided via [`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue). Simply install it and add it in the Vite config:

```js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

### Custom Blocks Transforms

A custom plugin can be used to transform Vue custom blocks like the one below:

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

React Fast Refresh support is now provided via [`@vitejs/plugin-react-refresh`](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh).

## HMR API Change

`import.meta.hot.acceptDeps()` have been deprecated. [`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) can now accept single or multiple deps.

## Manifest Format Change

The build manifest now uses the following format:

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

## For Plugin Authors

Vite 2 uses a completely redesigned plugin interface which extends Rollup plugins. Please read the new [Plugin Development Guide](./api-plugin).

Some general pointers on migrating a v1 plugin to v2:

- `resolvers` -> use the [`resolveId`](https://rollupjs.org/guide/en/#resolveid) hook
- `transforms` -> use the [`transform`](https://rollupjs.org/guide/en/#transform) hook
- `indexHtmlTransforms` -> use the [`transformIndexHtml`](./api-plugin#transformindexhtml) hook
- Serving virtual files -> use [`resolveId`](https://rollupjs.org/guide/en/#resolveid) + [`load`](https://rollupjs.org/guide/en/#load) hooks
- Adding `alias`, `define` or other config options -> use the [`config`](./api-plugin#config) hook

Since most of the logic should be done via plugin hooks instead of middlewares, the need for middlewares is greatly reduced. The internal server app is now a good old [connect](https://github.com/senchalabs/connect) instance instead of Koa.
