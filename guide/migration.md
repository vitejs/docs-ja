# v6 からの移行

## Node.js サポート

Vite は End of Life を迎えた Node.js 18 をサポートしなくなりました。Node.js 20.19+ / 22.12+ が必要です。

## デフォルトブラウザーターゲットの変更

`build.target` のデフォルトブラウザー値がより新しいブラウザーに更新されました。

- Chrome 87 → 107
- Edge 88 → 107
- Firefox 78 → 104
- Safari 14.0 → 16.0

これらのブラウザーバージョンは、2025 年 5 月 1 日時点の [Baseline](https://web-platform-dx.github.io/web-features/) Widely Available 機能セットに準拠します。つまり、これらはすべて 2022 年 11 月 1 日より前にリリースされたものです。

Vite 5 では、デフォルトターゲットは `'modules'` という名前でしたが、これは利用できなくなりました。代わりに、新しいデフォルトターゲット `'baseline-widely-available'` が導入されました。

## 全般的な変更

### Sass レガシー API サポートの削除

予定どおり、Sass レガシー API のサポートが削除されました。Vite はモダン API のみをサポートします。`css.preprocessorOptions.sass.api` / `css.preprocessorOptions.scss.api` オプションを削除できます。

## 非推奨機能の削除

- `splitVendorChunkPlugin`（v5.2.7 で非推奨化）
  - このプラグインは、Vite v2.9 への移行を容易にするために元々提供されていました。
  - 必要に応じて、`build.rollupOptions.output.manualChunks` オプションを使用してチャンクの動作を制御できます。
- `transformIndexHtml` のフック レベル `enforce` / `transform`（v4.0.0 で非推奨化）
  - これは、インターフェイスを [Rollup のオブジェクトフック](https://rollupjs.org/plugin-development/#build-hooks:~:text=Instead%20of%20a%20function%2C%20hooks%20can%20also%20be%20objects.)に合わせるために変更されました。
  - `enforce` の代わりに `order` を使用し、`transform` の代わりに `handler` を使用してください。

## 高度な内容

少数のユーザーにのみ影響するその他の重大な変更があります。

- [[#19979] chore: declare version range for peer dependencies](https://github.com/vitejs/vite/pull/19979)
  - CSS プリプロセッサーのピア依存関係のバージョン範囲を指定しました。
- [[#20013] refactor: remove no-op `legacy.proxySsrExternalModules`](https://github.com/vitejs/vite/pull/20013)
  - `legacy.proxySsrExternalModules` プロパティは Vite 6 以降効果がありませんでした。削除されました。
- [[#19985] refactor!: remove deprecated no-op type only properties](https://github.com/vitejs/vite/pull/19985)
  - 次の未使用プロパティが削除されました：`ModuleRunnerOptions.root`、`ViteDevServer._importGlobMap`、`ResolvePluginOptions.isFromTsImporter`、`ResolvePluginOptions.getDepsOptimizer`、`ResolvePluginOptions.shouldExternalize`、`ResolvePluginOptions.ssrConfig`
- [[#19986] refactor: remove deprecated env api properties](https://github.com/vitejs/vite/pull/19986)
  - これらのプロパティは最初から非推奨でした。削除されました。
- [[#19987] refactor!: remove deprecated `HotBroadcaster` related types](https://github.com/vitejs/vite/pull/19987)
  - これらの型は、現在非推奨となっている Runtime API の一部として導入されました。削除されました：`HMRBroadcaster`、`HMRBroadcasterClient`、`ServerHMRChannel`、`HMRChannel`
- [[#19996] fix(ssr)!: don't access `Object` variable in ssr transformed code](https://github.com/vitejs/vite/pull/19996)
  - `__vite_ssr_exportName__` がモジュールランナーランタイムコンテキストに必要になりました。
- [[#20045] fix: treat all `optimizeDeps.entries` values as globs](https://github.com/vitejs/vite/pull/20045)
  - `optimizeDeps.entries` は、リテラル文字列パスを受け取らなくなりました。代わりに、常に glob を受け取ります。
- [[#20222] feat: apply some middlewares before `configureServer` hook](https://github.com/vitejs/vite/pull/20222)、[[#20224] feat: apply some middlewares before `configurePreviewServer` hook](https://github.com/vitejs/vite/pull/20224)
  - 一部のミドルウェアが `configureServer` / `configurePreviewServer` フックの前に適用されるようになりました。特定のルートに [`server.cors`](/config/server-options.md#server-cors) / [`preview.cors`](/config/preview-options.md#preview-cors) オプションが適用されることを期待しない場合、レスポンスから関連するヘッダーを削除してください。

## v5 からの移行

まず、Vite v6 ドキュメントの[v5 からの移行ガイド](https://v6.vite.dev/guide/migration.html)をチェックし、アプリを Vite 6 に移植するために必要な変更を確認してから、このページの変更を進めてください。
