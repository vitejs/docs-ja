# v1 からの移行

## 設定オプションの変更

- 以下のオプションは削除されましたので、[プラグイン](./api-plugin)で実装してください:

  - `resolvers`
  - `transforms`
  - `indexHtmlTransforms`

- `jsx` と `enableEsbuild` は削除されました。代わりに新しい [`esbuild`](/config/#esbuild) オプションを使ってください。

- [CSS 関連のオプション](/config/#css-modules)は `css` の下に移動しました。

- すべての[ビルドオプション](/config/#ビルドオプション)は `build` の下に移動しました。

  - `rollupInputOptions` と `rollupOutputOptions` は [`build.rollupOptions`](/config/#build-rollupoptions) に置き換えられました。
  - `esbuildTarget` は [`build.target`](/config/#build-target) になりました。
  - `emitManifest` は [`build.manifest`](/config/#build-manifest) になりました。
  - 以下のビルドオプションは、プラグインフックや他のオプションで実現できるため、削除されました:
    - `entry`
    - `rollupDedupe`
    - `emitAssets`
    - `emitIndex`
    - `shouldPreload`
    - `configureBuild`

- すべての[サーバオプション](/config/#サーバオプション)は、`server` の下に移動しました。


  - `hostname` は [`server.host`](/config/#server-host) になりました。
  - `httpsOptions` は削除されました。[`server.https`](/config/#server-https) はオプションオブジェクトを直接受け取ることができます。
  - `chokidarWatchOptions` は [`server.watch`](/config/#server-watch) になりました。

- [`assetsInclude`](/config/#assetsInclude) が、関数ではなく、`string | RegExp | (string | RegExp)[]` を想定するようになりました。

- すべての Vue 固有のオプションは削除され、代わりに Vue プラグインにオプションを渡します。

## Alias の動作変更

[`alias`](/config/#alias) が `@rollup/plugin-alias` に渡されるようになり、開始/終了のスラッシュが不要になりました。この動作は直接置換するようになったので、1.0スタイルのディレクトリエイリアスキーから終了のスラッシュを削除する必要があります:

```diff
- alias: { '/@foo/': path.resolve(__dirname, 'some-special-dir') }
+ alias: { '/@foo': path.resolve(__dirname, 'some-special-dir') }
```

また、`[{ find: RegExp, replacement: string }]` というオプション形式を使えば、より精密な制御が可能です。

## Vue サポート

Vite 2.0 のコアはフレームワークに依存しないようになりました。Vue のサポートは、[`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) を通じて提供されるようになりました。これをインストールして、Vite の設定に追加してください:

```js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

### カスタムブロックの変換

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

## React サポート

React Fast Refresh のサポートは、[`@vitejs/plugin-react-refresh`](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh) で提供されるようになりました。

## HMR API の変更

`import.meta.hot.acceptDeps()` は非推奨となりました。[`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) は、単一または複数の依存関係を受け入れることができるようになりました。

## マニフェストフォーマットの変更

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

エントリ JS チャンクについては、インポートされたチャンクもリストアップされ、プリロードディレクティブのレンダリングに使用できます。

## プラグイン作成者向け

Vite 2 は、Rollup プラグインを拡張し完全に再設計されたプラグインインタフェイスとなっています。新しい[プラグイン開発ガイド](./api-plugin)をお読みください。

v1 プラグインを v2 に移行する際の一般的なポイントです:

- `resolvers` -> [`resolveId`](https://rollupjs.org/guide/en/#resolveid) フックを使ってください。
- `transforms` -> [`transform`](https://rollupjs.org/guide/en/#transform) フックを使ってください。
- `indexHtmlTransforms` -> [`transformIndexHtml`](./api-plugin#transformindexhtml) フックを使ってください。
- 仮想ファイルの提供 -> [`resolveId`](https://rollupjs.org/guide/en/#resolveid) + [`load`](https://rollupjs.org/guide/en/#load) フックを使ってください。
- `alias`、`define`、その他の設定オプションの追加 -> [`config`](./api-plugin#config) フックを使用してください。

ロジックのほとんどはミドルウェアではなくプラグインのフックを介して行われるべきなので、ミドルウェアの必要性は大幅に減少しています。内部のサーバアプリは、Koa から古き良き [connect](https://github.com/senchalabs/connect) のインスタンスに変わりました。
