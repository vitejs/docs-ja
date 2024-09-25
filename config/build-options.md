# ビルドオプション

## build.target

- **型:** `string | string[]`
- **デフォルト:** `'modules'`
- **関連:** [ブラウザーの互換性](/guide/build#browser-compatibility)

最終的なバンドルのブラウザー互換性のターゲット。デフォルトは Vite の特別な値 `'modules'` で、これは[ネイティブ ES モジュール](https://caniuse.com/es6-module)、[ネイティブ ESM の動的インポート](https://caniuse.com/es6-module-dynamic-import)、[`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta)をサポートするブラウザーを対象にします。Vite は `'modules'` を `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']` へ置き換えます。

もうひとつの特別な値は `'esnext'` で、これはネイディブの動的インポートをサポートしていることを前提としており、トランスパイルが可能な限り少なくなります:

- [`build.minify`](#build-minify) オプションが `'terser'` で、インストールされている Terser のバージョンが 5.16.0 未満の場合、`'esnext'` は強制的に `'es2021'` に下げられます。
- それ以外の場合、トランスパイルはまったく行なわれません。

変換は esbuild で実行され、この値は有効な [esbuild の target オプション](https://esbuild.github.io/api/#target)でなければいけません。カスタムターゲットは ES のバージョン（例: `es2015`）、バージョン付きのブラウザー（例: `chrome58`）、または複数のターゲットの文字列の配列を指定できます。

esbuild で安全にトランスパイルできない機能がコードに含まれていると、ビルドが失敗するので注意してください。詳細は [esbuild のドキュメント](https://esbuild.github.io/content-types/#javascript)を参照してください。

## build.modulePreload

- **型:** `boolean | { polyfill?: boolean, resolveDependencies?: ResolveModulePreloadDependenciesFn }`
- **デフォルト:** `{ polyfill: true }`

デフォルトでは、[module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) が自動的に注入されます。Polyfill は各 `index.html` エントリーのプロキシモジュールに自動注入されます。ビルドが `build.rollupOptions.input` を通して非 HTML のカスタムエントリーを使用するように設定されている場合は、カスタムエントリーで Polyfill を手動でインポートする必要があります:

```js
import 'vite/modulepreload-polyfill'
```

注意: この Polyfill は[ライブラリーモード](/guide/build#library-mode)には **適用されません** 。ネイティブの動的インポートを持たないブラウザーをサポートする必要がある場合は、ライブラリーでの使用は避けた方が良いでしょう。

ポリフィルは `{ polyfill: false }` を使って無効にできます。

動的インポートごとにプリロードするチャンクのリストは Vite によって計算されます。デフォルトでは、これらの依存関係を読み込む際に `base` を含む絶対パスが使用されます。`base` が相対パス（`''` または `'./'`）の場合、最終的にデプロイされるベースに依存する絶対パスを避けるために、実行時に `import.meta.url` が使用されます。

実験的に、`resolveDependencies` 関数を使用して、依存関係のリストとそのパスを細かく制御できるようになりました。[フィードバックをしてください](https://github.com/vitejs/vite/discussions/13841)。この関数は `ResolveModulePreloadDependenciesFn` 型の関数が必要です。

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

`resolveDependencies` 関数は動的インポートごとに依存するチャンクのリストとともに呼び出され、またエントリー HTML ファイルでインポートされたチャンクに対しても呼び出されます。新しい依存関係の配列は、これらのフィルタリングされた依存関係、あるいはそれ以上の依存関係を注入し、そのパスを修正した新しい依存関係配列を返すことができます。`deps` のパスは `build.outDir` からの相対パスです。返り値は `build.outDir` からの相対パスでなければなりません。

```js twoslash
/** @type {import('vite').UserConfig} */
const config = {
  // prettier-ignore
  build: {
// ---cut-before---
modulePreload: {
  resolveDependencies: (filename, deps, { hostId, hostType }) => {
    return deps.filter(condition)
  },
},
// ---cut-after---
  },
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

出力ディレクトリーを指定します（[プロジェクトルート](/guide/#index-html-and-project-root)からの相対パス）。

## build.assetsDir

- **型:** `string`
- **デフォルト:** `assets`

生成されたアセットをネストするディレクトリーを指定します（`build.outDir` からの相対パス。[ライブラリーモード](/guide/build#library-mode)では使用しません）。

## build.assetsInlineLimit

- **型:** `number` | `((filePath: string, content: Buffer) => boolean | undefined)`
- **デフォルト:** `4096` (4 KiB)

インポートもしくは参照されたアセットでこの閾値より小さいものは、余計な HTTP リクエストを避けるために base64 URL としてインライン化されます。`0` に設定するとインライン化は完全に無効になります。

コールバックが渡された場合、オプトインまたはオプトアウトのためにブール値を返せます。何も返されない場合、デフォルトのロジックが適用されます。

Git LFS のプレースホルダーは、それが表すファイルの内容を含んでいないため、自動的にインライン化の対象から除外されます。

::: tip 注意
`build.lib` を指定すると `build.assetsInlineLimit` は無視され、ファイルサイズや Git LFS のプレースホルダーであるかどうかに関係なく、アセットは常にインライン化されます。
:::

## build.cssCodeSplit

- **型:** `boolean`
- **デフォルト:** `true`

CSS コード分割を有効/無効にします。有効にすると、非同期 JS チャンクでインポートされた CSS はチャンクとして保存され、チャンクがフェッチされるときに一緒にフェッチされます。

無効にした場合、プロジェクト全体のすべての CSS はひとつの CSS ファイルに抽出されます。

::: tip 注意
`build.lib` を指定すると、`build.cssCodeSplit` はデフォルトで `false` になります。
:::

## build.cssTarget

- **型:** `string | string[]`
- **デフォルト:** [`build.target`](#build-target) と同じ

このオプションを使用すると、CSS ミニファイのブラウザーターゲットを、JavaScript の変換に使用されるものと違う設定にできます。

これは主流でないブラウザーをターゲットにしている場合にのみ使用してください。
例えば Android の WeChat WebView は、ほとんどのモダンな JavaScript の機能をサポートしていますが、[CSS の `#RGBA` 16 進表記](https://developer.mozilla.org/ja/docs/Web/CSS/color_value#rgb_色)はサポートしていません。
この場合、Vite が `rgba()` の色を `#RGBA` の 16 進表記に変換するのを防ぐために、`build.cssTarget` を `chrome61` に設定する必要があります。

## build.cssMinify

- **型:** `boolean | 'esbuild' | 'lightningcss'`
- **デフォルト:** [`build.minify`](#build-minify) と同じ

このオプションによって、デフォルトの `build.minify` を使うのではなく、CSS ミニファイを具体的に上書きすることで、JS と CSS のミニファイを別々に設定できるようになります。Vite はデフォルトでは `esbuild` を使用して CSS をミニファイしています。`'lightningcss'` を指定すると代わりに [Lightning CSS](https://lightningcss.dev/minification.html) を使用します。指定した場合は、 [`css.lightningcss`](./shared-options.md#css-lightningcss) を使用して設定ができます。

## build.sourcemap

- **型:** `boolean | 'inline' | 'hidden'`
- **デフォルト:** `false`

本番用のソースマップを作成します。`true` の場合、ソースマップファイルは別に作られます。`inline` の場合、ソースマップは出力結果ファイルにデータ URI として追加されます。`hidden` は `true` と同様に動作しますが、バンドルファイル内のソースマップを指し示すコメントは記述されません。

## build.rollupOptions

- **型:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

基礎となる Rollup バンドルを直接カスタマイズします。これは、Rollup 設定ファイルからエクスポートされるオプションと同じで、Vite 内部の Rollup オプションにマージされます。詳細は [Rollup options docs](https://rollupjs.org/configuration-options/) を参照してください。

## build.commonjsOptions

- **型:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

[@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) に渡すオプションです。

## build.dynamicImportVarsOptions

- **型:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **関連:** [Dynamic Import](/guide/features#dynamic-import)

[@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) に渡すオプションです。

## build.lib

- **型:** `{ entry: string | string[] | { [entryAlias: string]: string }, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat, entryName: string) => string) }`
- **関連:** [ライブラリーモード](/guide/build#library-mode)

ライブラリーとしてビルドします。ライブラリーではエントリーとして HTML を使用できないため、`entry` が必要です。`name` は公開されているグローバル変数で、`formats` に `'umd'` や `'iife'` が含まれている場合に必要です。デフォルトの `formats` は `['es', 'umd']` で、複数のエントリーを使用する場合は `['es', 'cjs']` です。`fileName` は出力されるパッケージファイルの名前です。デフォルトの `fileName` は package.json の name オプションですが、`format` と `entryName` を引数にとる関数として定義することもできます。

## build.manifest

- **型:** `boolean | string`
- **デフォルト:** `false`
- **関連:** [バックエンドとの統合](/guide/backend-integration)

`true` に設定すると、ビルドはハッシュ化されていないアセットファイル名とハッシュ化されたバージョンのマッピングを含む `.vite/manifest.json` ファイルを生成するようになり、サーバーフレームワークがこれを使用して正しいアセットリンクをレンダリングできるようになります。値が文字列の場合は、それがマニフェストファイル名として使われます。

## build.ssrManifest

- **型:** `boolean | string`
- **デフォルト:** `false`
- **関連:** [サーバーサイドレンダリング](/guide/ssr)

`true` に設定すると、本番環境でのスタイルリンクやアセットプリロードディレクティブを決定するための SSR マニフェストもビルドで生成されます。値が文字列の場合は、それがマニフェストファイル名として使われます。

## build.ssr

- **型:** `boolean | string`
- **デフォルト:** `false`
- **関連:** [サーバーサイドレンダリング](/guide/ssr)

SSR 向けのビルドを生成します。この値は、SSR エントリーを直接指定する文字列か、`true` にして `rollupOptions.input` で SSR エントリーを指定する必要があります。

## build.emitAssets

- **型:** `boolean`
- **デフォルト:** `false`

クライアント以外のビルド時、静的アセットはクライアントビルドの一部として生成されると仮定されているため、出力されません。このオプションは、フレームワークが他の環境のビルドで静的アセットを強制的に出力することを可能にします。ビルド後のステップでアセットをマージするのはフレームワークの責任です。

## build.ssrEmitAssets

- **型:** `boolean`
- **デフォルト:** `false`

SSR ビルドの間、静的アセットはクライアントビルドの一部として出力されると想定されているため、出力されません。このオプションを使用すると、フレームワークはクライアントと SSR ビルドの両方でアセットを出力することを強制できます。フレームワークは、ビルド後のステップでアセットをマージする責任があります。このオプションは Environment API が安定したら `build.emitAssets` に置き換えられます。

## build.minify

- **型:** `boolean | 'terser' | 'esbuild'`
- **デフォルト:** クライアントビルドは `'esbuild'`、SSR ビルドでは `false`

ミニファイを無効にするには `false` を設定するか、使用するミニファイツールを指定します。デフォルトは [esbuild](https://github.com/evanw/esbuild) で、これは terser に比べて 20～40 倍速く、圧縮率は 1～2％だけ低下します。[ベンチマーク](https://github.com/privatenumber/minification-benchmarks)

pure アノテーションを取り除きツリーシェイクをできなくするため、ライブラリーモードで `'es'` フォーマットを使用する場合、`build.minify` オプションは空白文字をミニファイしないので注意してください。

`'terser'` を設定したときには、terser のインストールが必要です。

```sh
npm add -D terser
```

## build.terserOptions

- **型:** `TerserOptions`

Terser に渡す追加の[ミニファイオプション](https://terser.org/docs/api-reference#minify-options)です。

さらに、`maxWorkers: number` オプションを渡して、生成するワーカーの最大数を指定することもできます。デフォルトは CPU の数から 1 を引いた数です。

## build.write

- **型:** `boolean`
- **デフォルト:** `true`

バンドルのディスクへの書き込みを無効にするには、`false` を設定します。これは、主に[プログラムによる `build()` 呼び出し](/guide/api-javascript#build)で使用され、ディスクに書き込む前にバンドルの後処理が必要な場合に使用されます。

## build.emptyOutDir

- **型:** `boolean`
- **デフォルト:** `outDir` が `root` 内にあると `true`

デフォルトでは、Vite はビルド時に `outDir` がプロジェクトルート内にある場合、それを空にします。重要なファイルを誤って削除してしまわないように、`outDir` がルートの外にある場合は警告を発します。このオプションを明示的に設定することで、警告を出さないようにできます。このオプションは、コマンドラインで `--emptyOutDir` としても利用できます。

## build.copyPublicDir

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

チャンクサイズ警告の制限値（kB 単位）。[JavaScript のサイズ自体が実行時間に関係する](https://v8.dev/blog/cost-of-javascript-2019)ため、非圧縮のチャンクサイズと比較されます。

## build.watch

- **型:** [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch)`| null`
- **デフォルト:** `null`

Rollup ウォッチャーを有効にするには、`{}` に設定します。これは主に、ビルドのみのプラグインや統合プロセスを伴うケースで使用されます。

::: warning Windows Subsystem for Linux (WSL) 2 上での Vite の実行

WSL2 ではファイルシステム監視が動作しない場合があります。
詳細は [`server.watch`](./server-options.md#server-watch) を参照してください。

:::
