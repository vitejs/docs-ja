# ビルドオプション

## build.target

- **型:** `string | string[]`
- **デフォルト:** `'modules'`
- **関連:** [ブラウザの互換性](/guide/build#ブラウザの互換性)

最終的なバンドルのブラウザ互換性のターゲット。デフォルトは Vite の特別な値 `'modules'` で、これは[ネイティブ ES モジュール](https://caniuse.com/es6-module)、[ネイティブ ESM の動的インポート](https://caniuse.com/es6-module-dynamic-import)、[`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta)をサポートするブラウザを対象にします。

もうひとつの特別な値は `'esnext'` で、これはネイディブの動的インポートをサポートしていることを前提としており、トランスパイルが可能な限り少なくなります:

- [`build.minify`](#build-minify) が `'terser'` の場合、`'esnext'` は強制的に `'es2021'` に下げられます。
- それ以外の場合、トランスパイルはまったく行なわれません。

変換は esbuild で実行され、この値は有効な [esbuild の target オプション](https://esbuild.github.io/api/#target)でなければいけません。カスタムターゲットは ES のバージョン（例: `es2015`）、バージョン付きのブラウザ（例: `chrome58`）、または複数のターゲットの文字列の配列を指定できます。

esbuild で安全にトランスパイルできない機能がコードに含まれていると、ビルドが失敗するので注意してください。詳細は [esbuild のドキュメント](https://esbuild.github.io/content-types/#javascript)を参照してください。

## build.modulePreload

- **型:** `boolean | { polyfill?: boolean, resolveDependencies?: ResolveModulePreloadDependenciesFn }`
- **デフォルト:** `true`

デフォルトでは、[module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) が自動的に注入されます。Polyfill は各 `index.html` エントリのプロキシモジュールに自動注入されます。ビルドが `build.rollupOptions.input` を通して非 HTML のカスタムエントリを使用するように設定されている場合は、カスタムエントリで Polyfill を手動でインポートする必要があります:

```js
import 'vite/modulepreload-polyfill'
```

注意: この Polyfill は[ライブラリモード](/guide/build#ライブラリモード)には **適用されません** 。ネイティブの動的インポートを持たないブラウザをサポートする必要がある場合は、ライブラリでの使用は避けた方が良いでしょう。

ポリフィルは `{ polyfill: false }` を使って無効にできます。

動的インポートごとにプリロードするチャンクのリストは Vite によって計算されます。デフォルトでは、これらの依存関係を読み込む際に `base` を含む絶対パスが使用されます。`base` が相対パス (`''` または `'./'`) の場合、最終的にデプロイされるベースに依存する絶対パスを避けるために、実行時に `import.meta.url` が使用されます。

実験的に、`resolveDependencies` 関数を使用して、依存関係のリストとそのパスを細かく制御できるようになりました。この関数は `ResolveModulePreloadDependenciesFn` 型の関数が必要です。

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    importer: string
  }
) => (string | { runtime?: string })[]
```

`resolveDependencies` 関数は動的インポートごとに依存するチャンクのリストとともに呼び出され、またエントリー HTML ファイルでインポートされたチャンクに対しても呼び出されます。新しい依存関係の配列は、これらのフィルタリングされた依存関係、あるいはそれ以上の依存関係を注入し、そのパスを修正した新しい依存関係配列を返すことができます。`deps` のパスは `build.outDir` からの相対パスです。`hostType === 'js'` の場合は `hostId` への相対パスを返すことができます。この場合、このモジュールを HTML ヘッドにプリロードする際に、絶対パスを取得するために `new URL(dep, import.meta.url)` が使用されます。

```js
modulePreload: {
  resolveDependencies: (filename, deps, { hostId, hostType }) => {
    return deps.filter(condition)
  }
}
```

解決された依存関係のパスは、さらに [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options) を使って変更できます。

## build.polyfillModulePreload

- **型:** `boolean`
- **デフォルト:** `true`
- **非推奨** `build.modulePreload.polyfill` を使用してください

自動的に [module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) を注入するかどうか。

## build.outDir

- **型:** `string`
- **デフォルト:** `dist`

出力ディレクトリを指定します（[プロジェクトルート](/guide/#index-html-とプロジェクトルート)からの相対パス）。

## build.assetsDir

- **型:** `string`
- **デフォルト:** `assets`

生成されたアセットをネストするディレクトリを指定します（`build.outDir` からの相対パス）。

## build.assetsInlineLimit

- **型:** `number`
- **デフォルト:** `4096` (4kb)

インポートもしくは参照されたアセットでこの閾値より小さいものは、余計な HTTP リクエストを避けるために base64 URL としてインライン化されます。`0` に設定するとインライン化は完全に無効になります。

Git LFS のプレースホルダは、それが表すファイルの内容を含んでいないため、自動的にインライン化の対象から除外されます。

::: tip 注意
`build.lib` を指定すると `build.assetsInlineLimit` は無視され、ファイルサイズや Git LFS のプレースホルダであるかどうかに関係なく、アセットは常にインライン化されます。
:::

## build.cssCodeSplit

- **型:** `boolean`
- **デフォルト:** `true`

CSS コード分割を有効/無効にします。有効にすると、非同期のチャンクでインポートされた CSS は非同期チャンク自体の中にインライン化され、チャンクがロードされるときに挿入されます。

無効にした場合、プロジェクト全体のすべての CSS はひとつの CSS ファイルに抽出されます。

::: tip 注意
`build.lib` を指定すると、`build.cssCodeSplit` はデフォルトで `false` になります。
:::

## build.cssTarget

- **型:** `string | string[]`
- **デフォルト:** [`build.target`](#build-target) と同じ

このオプションを使用すると、CSS ミニファイのブラウザターゲットを、JavaScript の変換に使用されるものと違う設定にできます。

これは主流でないブラウザをターゲットにしている場合にのみ使用してください。
例えば Android の WeChat WebView は、ほとんどのモダンな JavaScript の機能をサポートしていますが、[CSS の `#RGBA` 16 進表記](https://developer.mozilla.org/ja/docs/Web/CSS/color_value#rgb_色)はサポートしていません。
この場合、Vite が `rgba()` の色を `#RGBA` の 16 進表記に変換するのを防ぐために、`build.cssTarget` を `chrome61` に設定する必要があります。

## build.sourcemap

- **型:** `boolean | 'inline' | 'hidden'`
- **デフォルト:** `false`

本番用のソースマップを作成します。`true` の場合、ソースマップファイルは別に作られます。`inline` の場合、ソースマップは出力結果ファイルにデータ URI として追加されます。`hidden` は `true` と同様に動作しますが、バンドルファイル内のソースマップを指し示すコメントは削除されます。

## build.rollupOptions

- **型:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

基礎となる Rollup バンドルを直接カスタマイズします。これは、Rollup 設定ファイルからエクスポートされるオプションと同じで、Vite 内部の Rollup オプションにマージされます。詳細は [Rollup options docs](https://rollupjs.org/guide/en/#big-list-of-options) を参照してください。

## build.commonjsOptions

- **型:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

[@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) に渡すオプションです。

## build.dynamicImportVarsOptions

- **型:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **関連:** [Dynamic Import](/guide/features#dynamic-import)

[@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) に渡すオプションです。

## build.lib

- **型:** `{ entry: string | string[] | { [entryAlias: string]: string }, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat, entryName: string) => string) }`
- **関連:** [ライブラリモード](/guide/build#ライブラリモード)

ライブラリとしてビルドします。ライブラリではエントリとして HTML を使用できないため、`entry` が必要です。`name` は公開されているグローバル変数で、`formats` に `'umd'` や `'iife'` が含まれている場合に必要です。デフォルトの `formats` は `['es', 'umd']` で、複数のエントリを使用する場合は `['es', 'cjs']` です。`fileName` は出力されるパッケージファイルの名前です。デフォルトの `fileName` は package.json の name オプションですが、`format` と `entryAlias` を引数にとる関数として定義することもできます。

## build.manifest

- **型:** `boolean | string`
- **デフォルト:** `false`
- **関連:** [バックエンドとの統合](/guide/backend-integration)

`true` に設定すると、ビルドはハッシュ化されていないアセットファイル名とハッシュ化されたバージョンのマッピングを含む `manifest.json` ファイルを生成するようになり、サーバフレームワークがこれを使用して正しいアセットリンクをレンダリングできるようになります。値が文字列の場合は、それがマニフェストファイル名として使われます。

## build.ssrManifest

- **型:** `boolean | string`
- **デフォルト:** `false`
- **関連:** [サーバサイドレンダリング](/guide/ssr)

`true` に設定すると、本番環境でのスタイルリンクやアセットプリロードディレクティブを決定するための SSR マニフェストもビルドで生成されます。値が文字列の場合は、それがマニフェストファイル名として使われます。

## build.ssr

- **型:** `boolean | string`
- **デフォルト:** `undefined`
- **関連:** [サーバサイドレンダリング](/guide/ssr)

SSR 向けのビルドを生成します。この値は、SSR エントリを直接指定する文字列か、`true` にして `rollupOptions.input` で SSR エントリを指定する必要があります。

## build.minify

- **型:** `boolean | 'terser' | 'esbuild'`
- **デフォルト:** `'esbuild'`

ミニファイを無効にするには `false` を設定するか、使用するミニファイツールを指定します。デフォルトは [esbuild](https://github.com/evanw/esbuild) で、これは terser に比べて 20～40 倍速く、圧縮率は 1～2％だけ低下します。[ベンチマーク](https://github.com/privatenumber/minification-benchmarks)

pure アノテーションを取り除きツリーシェイクをできなくするため、ライブラリモードで `'es'` フォーマットを使用する場合、`build.minify` オプションは空白文字をミニファイしないので注意してください。

`'terser'` を設定したときには、terser のインストールが必要です。

```sh
npm add -D terser
```

## build.terserOptions

- **型:** `TerserOptions`

Terser に渡す追加の[ミニファイオプション](https://terser.org/docs/api-reference#minify-options)です。

## build.write

- **型:** `boolean`
- **デフォルト:** `true`

バンドルのディスクへの書き込みを無効にするには、`false` を設定します。これは、主に[プログラムによる `build()` 呼び出し](/guide/api-javascript#build)で使用され、ディスクに書き込む前にバンドルの後処理が必要な場合に使用されます。

## build.emptyOutDir

- **型:** `boolean`
- **デフォルト:** `outDir` が `root` 内にあると `true`

デフォルトでは、Vite はビルド時に `outDir` がプロジェクトルート内にある場合、それを空にします。重要なファイルを誤って削除してしまわないように、`outDir` がルートの外にある場合は警告を発します。このオプションを明示的に設定することで、警告を出さないようにできます。このオプションは、コマンドラインで `--emptyOutDir` としても利用できます。

## build.copyPublicDir

- **実験的機能**
- **型:** `boolean`
- **デフォルト:** `true`

デフォルトでは、Vite はビルド時にファイルを `publicDir` から `outDir` にコピーします。無効にするには `false` に設定します。

## build.reportCompressedSize

- **型:** `boolean`
- **デフォルト:** `true`

gzip 圧縮されたサイズレポートを有効/無効にします。大きな出力ファイルの圧縮には時間がかかるため、これを無効にすると、大規模なプロジェクトでのビルドのパフォーマンスが向上する可能性があります。

## build.chunkSizeWarningLimit

- **型:** `number`
- **デフォルト:** `500`

チャンクサイズ警告の制限値（kb 単位）。

## build.watch

- **型:** [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options)`| null`
- **デフォルト:** `null`

Rollup ウォッチャを有効にするには、`{}` に設定します。これは主に、ビルドのみのプラグインや統合プロセスを伴うケースで使用されます。

::: warning Windows Subsystem for Linux (WSL) 2 上での Vite の実行

WSL2 ではファイルシステム監視が動作しない場合があります。
詳細は [`server.watch`](./server-options.md#server-watch) を参照してください。

:::
