# v2 からの移行

## Node サポート

EOL となった Node v12 はサポートされなくなりました。今後は Node 14.18+ が必要です。

## モダンブラウザ基準の変更

本番バンドルではモダンな JavaScript のサポートを前提としています。Vite はデフォルトでは [native ES Modules](https://caniuse.com/es6-module) および [native ESM dynamic import](https://caniuse.com/es6-module-dynamic-import) および [`import.meta`](https://caniuse.com/mdn-javascript_statements_import_meta) をサポートするブラウザを対象としています:

- Chrome >=87
- Firefox >=78
- Safari >=13
- Edge >=88

ごく少数のユーザーは、自動的にレガシーチャンクとそれに対応する ES 言語機能 Polyfill を生成する [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を使う必要が出てくるでしょう。

## 設定オプションの変更

- v2 にて非推奨となっていた以下のオプションは削除されました:

  - `alias` ([`resolve.alias`](../config/shared-options.md#resolvealias) に置き換え)
  - `dedupe` ([`resolve.dedupe`](../config/shared-options.md#resolvededupe) に置き換え)
  - `build.base` ([`base`](../config/shared-options.md#base) に置き換え)
  - `build.brotliSize` ([`build.reportCompressedSize`](../config/build-options.md#build-reportcompressedsize) に置き換え)
  - `build.cleanCssOptions` (Vite は、現在では esbuild を CSS のミニファイに利用します)
  - `build.polyfillDynamicImport` (dynamic import をサポートしていないブラウザのためには [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を利用してください)
  - `optimizeDeps.keepNames` ([`optimizeDeps.esbuildOptions.keepNames`](../config/dep-optimization-options.md#optimizedepsesbuildoptions) に置き換え)

## アーキテクチャの変更とレガシーオプション

このセクションでは、Vite v3 の最も大きなアーキテクチャの変更について説明します。互換性の問題が発生した場合に、プロジェクトが v2 から移行できるように、Vite v2 のストラテジーに戻すためのレガシーオプションが追加されました。

:::warning
これらのオプションは実験的機能かつ非推奨としてマークされています。将来の v3 マイナーで semver を尊重することなく削除される可能性があります。使用する場合は、Vite のバージョンを固定するようにしてください。

- `legacy.devDepsScanner`
- `legacy.buildRollupPluginCommonjs`
- `legacy.buildSsrCjsExternalHeuristics`

:::

### 開発サーバでの変更

Vite の開発サーバのデフォルトポートが 5173 に変更されました。[`server.port`](../config/server-options.md#server-port) を利用することで 3000 に変更できます。

Vite のデフォルトの開発サーバのホストは `localhost` になりました。[`server.host`](../config/server-options.md#server-host) を使用して `127.0.0.1` に設定できます。

Vite は、CJS のみ提供されている依存関係を ESM に変換するため、また、ブラウザがリクエストする必要のあるモジュールの数を減らすため、依存関係を esbuild で最適化します。v3 では、依存関係を発見しバッチ処理する戦略が変更されました。Vite はコールドスタート時に依存関係のリストを取得するために、ユーザのコードを esbuild で事前スキャンしていました。その代わりに、すべてのインポートされたユーザのモジュールが読み込まれるまで、最初の依存関係の最適化の実行を遅延するようになりました。

v2 の戦略に戻すには、`legacy.devDepsScanner` が利用できます。

### ビルドでの変更

v3 では、Vite はデフォルトで esbuild を利用して依存関係を最適化します。これにより、v2 に存在していた開発環境と本番環境との最も大きな違いを取り除けます。esbuild が CJS のみ提供されている依存関係を ESM に変換するため、[`@rollupjs/plugin-commonjs`](https://github.com/rollup/plugins/tree/master/packages/commonjs) は使われなくなりました。

v2 の戦略に戻す必要がある場合は、`legacy.buildRollupPluginCommonjs` が利用できます。

### SSRでの変更

Vite の v3 では、SSR のビルドにデフォルトで ESM を利用するようになりました。ESM を利用する際には、[SSRでのヒューリスティックな方法による外部化](../guide/ssr.md#外部-ssr)が不要になりました。デフォルトでは、すべての依存関係が外部化されます。[`ssr.noExternal`](../config/ssr-options.md#ssrnoexternal) を利用してどの依存関係を SSR バンドルに含めるかコントロールできます。

SSR において ESM を利用することが不可能な場合、`legacy.buildSsrCjsExternalHeuristics` を設定することで Vite の v2 と同じ外部化戦略を利用して CJS バンドルを生成できます。

また、[`build.rollupOptions.output.inlineDynamicImports`](https://rollupjs.org/guide/en/#outputinlinedynamicimports) は、`ssr.target` が `'node'` の際のデフォルトが `false` になりました。`inlineDynamicImports` は実行順序を変更することと node に対するビルドでは 1 つのファイルにバンドルする必要がないためです。

## 全般的な変更

- SSR とライブラリモードで、ファイル形式やパッケージの形式によって、出力した JS のエントリとチャンクの拡張子として有効なもの (`js`, `mjs`, or `cjs`) が選択されるようになりました。
- Terser はオプションの依存関係になりました。`build.minify: 'terser'` を使用している場合にインストールする必要があります:
  ```shell
  npm add -D terser
  ```

### `import.meta.glob`

- [`raw` での `import.meta.glob`](features.md#glob-インポートでの形式の変換) は、記法が `{ assert: { type: 'raw' }}` から `{ as: 'raw' }` に変更されました
- `import.meta.glob` のキーは現在のモジュールから相対的になりました

  ```diff
  // ファイル: /foo/index.js
  const modules = import.meta.glob('../foo/*.js')

  // 変換後:
  const modules = {
  -  '../foo/bar.js': () => {}
  +  './bar.js': () => {}
  }
  ```

- `import.meta.glob` でエイリアスを利用した際には、キーは常に絶対的です
- `import.meta.globEager` は非推奨になりました。`import.meta.glob('*', { eager: true })` を代わりに利用してください。

### WebAssembly サポート

`import init from 'example.wasm'` の記法は、[WebAssembly の ES モジュール統合の提案](https://github.com/WebAssembly/esm-integration) との将来的な衝突を避けるため、廃止されました。
以前の挙動に似た `?init` を利用できます。

```diff
-import init from 'example.wasm'
+import init from 'example.wasm?init'

-init().then((instance) => {
+init().then(({ exports }) => {
  exports.test()
})
```

## 高度な機能

プラグイン・ツール製作者のみに影響のある変更がいくつかあります。

- [[#5868] refactor: remove deprecated api for 3.0](https://github.com/vitejs/vite/pull/5868)
  - `printHttpServerUrls` は削除されました
  - `server.app`、`server.transformWithEsbuild` は削除されました
  - `import.meta.hot.acceptDeps` は削除されました
- [[#6901] fix: sequential injection of tags in transformIndexHtml](https://github.com/vitejs/vite/pull/6901)
  - `transformIndexHtml` は先行するプラグインによって修正された正しい内容を取得するようになり、注入されたタグの順序が期待通り動作するようになりました。
- [[#7995] chore: do not fixStacktrace](https://github.com/vitejs/vite/pull/7995)
  - `ssrLoadModule` の `fixStacktrace` オプションのデフォルトは、`false` に変更されました
- [[#8178] feat!: migrate to ESM](https://github.com/vitejs/vite/pull/8178)
  - `formatPostcssSourceMap` は非同期になりました
  - `resolvePackageEntry`、`resolvePackageData` は CJS ビルドから利用できなくなりました (CJS で利用するためには dynamic import が必要です)

また、少数のユーザーにしか影響のない破壊的変更があります。

- [[#5018] feat: enable `generatedCode: 'es2015'` for rollup build](https://github.com/vitejs/vite/pull/5018)
  - ユーザのコードが ES5 のみしか含んでいない場合でも ES5 へのトランスパイルが必要になりました。
- [[#7877] fix: vite client types](https://github.com/vitejs/vite/pull/7877)
  - `/// <reference lib="dom" />` が `vite/client.d.ts` から削除されました。`tsconfig` で `{ "lib": ["dom"] }` または `{ "lib": ["webworker"] }` が必須になりました。
- [[#8090] feat: preserve process env vars in lib build](https://github.com/vitejs/vite/pull/8090)
  - ライブラリモードでも `process.env.*` が保持されるようになりました。
- [[#8280] feat: non-blocking esbuild optimization at build time](https://github.com/vitejs/vite/pull/8280)
  - `optimizeDeps.force` オプションが追加されたため、`server.force` が削除されました。
- [[#8550] fix: dont handle sigterm in middleware mode](https://github.com/vitejs/vite/pull/8550)
  - ミドルウェアモードで動作しているとき、Vite は `SIGTERM` でプロセスを終了しなくなりました。

## v1 からの移行

先に Vite の v2 のドキュメントの [v1 からの移行](https://v2.vitejs.dev/guide/migration.html) を確認して、Vite v2 への移行に必要な変更を見てから、このページの変更の適用に移ってください。
