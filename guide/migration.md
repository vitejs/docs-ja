# v2 からの移行

## Node.js サポート

EOL となった Node.js 12 / 13 / 15 はサポートされなくなりました。今後は Node.js 14.18+ / 16+ が必要です。

## モダンブラウザ基準の変更

本番バンドルではモダンな JavaScript のサポートを前提としています。Vite はデフォルトでは [native ES Modules](https://caniuse.com/es6-module) および [native ESM dynamic import](https://caniuse.com/es6-module-dynamic-import) および [`import.meta`](https://caniuse.com/mdn-javascript_statements_import_meta) をサポートするブラウザを対象としています:

- Chrome >=87
- Firefox >=78
- Safari >=13
- Edge >=88

ごく少数のユーザーは、自動的にレガシーチャンクとそれに対応する ES 言語機能 Polyfill を生成する [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を使う必要が出てくるでしょう。

## 設定オプションの変更

v2 にて非推奨となっていた以下のオプションは削除されました:

- `alias` ([`resolve.alias`](../config/shared-options.md#resolve-alias) に置き換え)
- `dedupe` ([`resolve.dedupe`](../config/shared-options.md#resolve-dedupe) に置き換え)
- `build.base` ([`base`](../config/shared-options.md#base) に置き換え)
- `build.brotliSize` ([`build.reportCompressedSize`](../config/build-options.md#build-reportcompressedsize) に置き換え)
- `build.cleanCssOptions` (Vite は、現在では esbuild を CSS のミニファイに利用します)
- `build.polyfillDynamicImport` (dynamic import をサポートしていないブラウザのためには [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を利用してください)
- `optimizeDeps.keepNames` ([`optimizeDeps.esbuildOptions.keepNames`](../config/dep-optimization-options.md#optimizedeps-esbuildoptions) に置き換え)

## アーキテクチャの変更とレガシーオプション

このセクションでは、Vite v3 の最も大きなアーキテクチャの変更について説明します。互換性の問題が発生した場合に、プロジェクトが v2 から移行できるように、Vite v2 のストラテジーに戻すためのレガシーオプションが追加されました。

### 開発サーバでの変更

Vite の開発サーバのデフォルトポートが 5173 に変更されました。[`server.port`](../config/server-options.md#server-port) を利用することで 3000 に変更できます。

Vite のデフォルトの開発サーバのホストは `localhost` になりました。Vite v2 では、Vite はデフォルトで `127.0.0.1` をリッスンしていました。Node.js の v17 未満は通常 `localhost` を `127.0.0.1` に解決するため、それらのバージョンでは、ホストは変化しません。Node.js 17 以上の場合は、[`server.host`](../config/server-options.md#server-host) を使用して `127.0.0.1` に設定して Vite v2 と同じホストを維持できます。

なお、Vite v3 では正しいホストを表示するようになりました。つまり、`localhost` が利用されているときに、Vite はリッスンしているホストとして `127.0.0.1` を表示することがあります。これを防ぐためには [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) を設定できます。詳しくは [`server.host`](../config/server-options.md#server-host) を参照してください。

### SSRでの変更

Vite の v3 では、SSR のビルドにデフォルトで ESM を利用するようになりました。ESM を利用する際には、[SSRでのヒューリスティックな方法による外部化](../guide/ssr.md#外部-ssr)が不要になりました。デフォルトでは、すべての依存関係が外部化されます。[`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal) を利用してどの依存関係を SSR バンドルに含めるかコントロールできます。

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

-init().then((exports) => {
+init().then(({ exports }) => {
  exports.test()
})
```

### 自動的な https 証明書の生成

`https` を利用する際には有効な証明書が必要です。Vite v2 では、証明書の設定がされていなかった場合、自動的に自己証明書が作成されキャッシュされていました。
Vite v3 では、手動で証明書を作成することを推奨します。v2 での自動生成を利用し続けたい場合は、[@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) をプロジェクトのプラグインに追加することでこの機能を再度有効化できます。

```js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()]
}
```

## 実験的な機能

### ビルド時での esbuild による依存関係の最適化の利用

v3 では、ビルド時に esbuild を利用して依存関係を最適化することができます。有効化することにより、v2 に存在していた開発環境と本番環境との最も大きな違いを取り除けます。この場合は、esbuild が CJS のみ提供されている依存関係を ESM に変換するため、[`@rollup/plugin-commonjs`](https://github.com/rollup/plugins/tree/master/packages/commonjs) は必要ありません。

このビルド戦略を利用してみたい場合は、`optimizeDeps.disabled: false` (v3 でのデフォルトは `disabled: 'build'`) が利用できます。
`build.commonjsOptions: { include: [] }` を渡すことで `@rollup/plugin-commonjs` を取り除けます。

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
- [[#8626] refactor: type client maps](https://github.com/vitejs/vite/pull/8626)
  - `import.meta.hot.accept` のコールバックの型がより厳密になりました。`(mod: (Record<string, any> & { [Symbol.toStringTag]: 'Module' }) | undefined) => void` に変更されました (`(mod: any) => void` でした)。

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
