# v7 からの移行

v6 および v7 の Vite に統合された Rolldown のテクニカルプレビューリリースである `rolldown-vite` から移行する場合は、タイトルに <Badge text="NRV" type="warning" /> が付いているセクションのみが該当します。

## デフォルトブラウザーターゲットの変更 [<Badge text="NRV" type="warning" />](#migration-from-v7)

`build.target` と `'baseline-widely-available'` のデフォルトブラウザー値がより新しいブラウザーバージョンに更新されました:

- Chrome 107 → 111
- Edge 107 → 111
- Firefox 104 → 114
- Safari 16.0 → 16.4

これらのブラウザーバージョンは、2026 年 1 月 1 日時点の [Baseline Widely Available](https://web-platform-dx.github.io/web-features/) 機能セットに準拠します。つまり、これらはすべて約 2 年半前にリリースされたものです。

## Rolldown

Vite 8 は、esbuild と Rollup の代わりに Rolldown と Oxc ベースのツールを使用します。

### 段階的移行

`rolldown-vite` パッケージは、他の Vite 8 の変更を含まない、Rolldown を使った Vite 7 を実装しています。これは Vite 8 への移行の中間ステップとして使用できます。Vite 7 から `rolldown-vite` への切り替えについては、Vite 7 ドキュメントの [Rolldown 統合ガイド](https://v7.vite.dev/guide/rolldown)を参照してください。

`rolldown-vite` から Vite 8 に移行する場合は、`package.json` の依存関係の変更を元に戻し、Vite 8 に更新してください:

```json
{
  "devDependencies": {
    "vite": "npm:rolldown-vite@7.2.2" // [!code --]
    "vite": "^8.0.0" // [!code ++]
  }
}
```

### 依存関係オプティマイザーが Rolldown を使用するように

esbuild の代わりに Rolldown が依存関係の最適化に使用されるようになりました。Vite は後方互換性のために [`optimizeDeps.esbuildOptions`](/config/dep-optimization-options#optimizedeps-esbuildoptions) を引き続きサポートし、自動的に [`optimizeDeps.rolldownOptions`](/config/dep-optimization-options#optimizedeps-rolldownoptions) に変換します。`optimizeDeps.esbuildOptions` は非推奨となり、将来削除される予定です。`optimizeDeps.rolldownOptions` への移行を推奨します。

以下のオプションが自動的に変換されます:

- [`esbuildOptions.minify`](https://esbuild.github.io/api/#minify) -> [`rolldownOptions.output.minify`](https://rolldown.rs/reference/OutputOptions.minify)
- [`esbuildOptions.treeShaking`](https://esbuild.github.io/api/#tree-shaking) -> [`rolldownOptions.treeshake`](https://rolldown.rs/reference/InputOptions.treeshake)
- [`esbuildOptions.define`](https://esbuild.github.io/api/#define) -> [`rolldownOptions.transform.define`](https://rolldown.rs/reference/InputOptions.transform#define)
- [`esbuildOptions.loader`](https://esbuild.github.io/api/#loader) -> [`rolldownOptions.moduleTypes`](https://rolldown.rs/reference/InputOptions.moduleTypes)
- [`esbuildOptions.preserveSymlinks`](https://esbuild.github.io/api/#preserve-symlinks) -> [`!rolldownOptions.resolve.symlinks`](https://rolldown.rs/reference/InputOptions.resolve#symlinks)
- [`esbuildOptions.resolveExtensions`](https://esbuild.github.io/api/#resolve-extensions) -> [`rolldownOptions.resolve.extensions`](https://rolldown.rs/reference/InputOptions.resolve#extensions)
- [`esbuildOptions.mainFields`](https://esbuild.github.io/api/#main-fields) -> [`rolldownOptions.resolve.mainFields`](https://rolldown.rs/reference/InputOptions.resolve#mainfields)
- [`esbuildOptions.conditions`](https://esbuild.github.io/api/#conditions) -> [`rolldownOptions.resolve.conditionNames`](https://rolldown.rs/reference/InputOptions.resolve#conditionnames)
- [`esbuildOptions.keepNames`](https://esbuild.github.io/api/#keep-names) -> [`rolldownOptions.output.keepNames`](https://rolldown.rs/reference/OutputOptions.keepNames)
- [`esbuildOptions.platform`](https://esbuild.github.io/api/#platform) -> [`rolldownOptions.platform`](https://rolldown.rs/reference/InputOptions.platform)
- [`esbuildOptions.plugins`](https://esbuild.github.io/plugins/) -> [`rolldownOptions.plugins`](https://rolldown.rs/reference/InputOptions.plugins)（部分的サポート）

互換性レイヤーによって設定されたオプションは `configResolved` フックから取得できます:

```js
const plugin = {
  name: 'log-config',
  configResolved(config) {
    console.log('options', config.optimizeDeps.rolldownOptions)
  },
},
```

### Oxc による JavaScript 変換

esbuild の代わりに Oxc が JavaScript 変換に使用されるようになりました。Vite は後方互換性のために [`esbuild`](/config/shared-options#esbuild) オプションを引き続きサポートし、自動的に [`oxc`](/config/shared-options#oxc) に変換します。`esbuild` は非推奨となり、将来削除される予定です。`oxc` への移行を推奨します。

以下のオプションが自動的に変換されます:

- `esbuild.jsxInject` -> `oxc.jsxInject`
- `esbuild.include` -> `oxc.include`
- `esbuild.exclude` -> `oxc.exclude`
- [`esbuild.jsx`](https://esbuild.github.io/api/#jsx) -> [`oxc.jsx`](https://oxc.rs/docs/guide/usage/transformer/jsx)
  - `esbuild.jsx: 'preserve'` -> `oxc.jsx: 'preserve'`
  - `esbuild.jsx: 'automatic'` -> `oxc.jsx: { runtime: 'automatic' }`
    - [`esbuild.jsxImportSource`](https://esbuild.github.io/api/#jsx-import-source) -> `oxc.jsx.importSource`
  - `esbuild.jsx: 'transform'` -> `oxc.jsx: { runtime: 'classic' }`
    - [`esbuild.jsxFactory`](https://esbuild.github.io/api/#jsx-factory) -> `oxc.jsx.pragma`
    - [`esbuild.jsxFragment`](https://esbuild.github.io/api/#jsx-fragment) -> `oxc.jsx.pragmaFrag`
  - [`esbuild.jsxDev`](https://esbuild.github.io/api/#jsx-dev) -> `oxc.jsx.development`
  - [`esbuild.jsxSideEffects`](https://esbuild.github.io/api/#jsx-side-effects) -> `oxc.jsx.pure`
- [`esbuild.define`](https://esbuild.github.io/api/#define) -> [`oxc.define`](https://oxc.rs/docs/guide/usage/transformer/global-variable-replacement#define)
- [`esbuild.banner`](https://esbuild.github.io/api/#banner) -> transform フックを使用したカスタムプラグイン
- [`esbuild.footer`](https://esbuild.github.io/api/#footer) -> transform フックを使用したカスタムプラグイン

[`esbuild.supported`](https://esbuild.github.io/api/#supported) オプションは Oxc でサポートされていません。このオプションが必要な場合は、[oxc-project/oxc#15373](https://github.com/oxc-project/oxc/issues/15373) を参照してください。

互換性レイヤーによって設定されたオプションは `configResolved` フックから取得できます:

```js
const plugin = {
  name: 'log-config',
  configResolved(config) {
    console.log('options', config.oxc)
  },
},
```

現在、Oxc トランスフォーマーはネイティブデコレーターの低レベル化をサポートしていません。これは仕様の進展を待っているためです（[oxc-project/oxc#9170](https://github.com/oxc-project/oxc/issues/9170) を参照）。

:::: details ネイティブデコレーターを低レベル化する回避策

当面の間、[Babel](https://babeljs.io/) または [SWC](https://swc.rs/) を使用してネイティブデコレーターを低レベル化できます。SWC は Babel より高速ですが、esbuild がサポートする**最新のデコレーター仕様をサポートしていません**。

デコレーター仕様は stage 3 に到達して以来、複数回更新されています。各ツールがサポートしているバージョンは以下の通りです:

- `"2023-11"`（esbuild、TypeScript 5.4+ および Babel がこのバージョンをサポート）
- `"2023-05"`（TypeScript 5.2+ がこのバージョンをサポート）
- `"2023-01"`（TypeScript 5.0+ がこのバージョンをサポート）
- `"2022-03"`（SWC がこのバージョンをサポート）

各バージョン間の違いについては、[Babel デコレーターバージョンガイド](https://babeljs.io/docs/babel-plugin-proposal-decorators#version)を参照してください。

**Babel を使用する場合:**

::: code-group

```bash [npm]
$ npm install -D @rollup/plugin-babel @babel/plugin-proposal-decorators
```

```bash [Yarn]
$ yarn add -D @rollup/plugin-babel @babel/plugin-proposal-decorators
```

```bash [pnpm]
$ pnpm add -D @rollup/plugin-babel @babel/plugin-proposal-decorators
```

```bash [Bun]
$ bun add -D @rollup/plugin-babel @babel/plugin-proposal-decorators
```

```bash [Deno]
$ deno add -D npm:@rollup/plugin-babel npm:@babel/plugin-proposal-decorators
```

:::

```ts [vite.config.ts]
import { defineConfig, withFilter } from 'vite'
import { babel } from '@rollup/plugin-babel'

export default defineConfig({
  plugins: [
    withFilter(
      babel({
        configFile: false,
        plugins: [
          ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
        ],
      }),
      // ファイルにデコレーターが含まれている場合のみこの変換を実行する
      { transform: { code: '@' } },
    ),
  ],
})
```

**SWC を使用する場合:**

::: code-group

```bash [npm]
$ npm install -D @rollup/plugin-swc @swc/core
```

```bash [Yarn]
$ yarn add -D @rollup/plugin-swc @swc/core
```

```bash [pnpm]
$ pnpm add -D @rollup/plugin-swc @swc/core
```

```bash [Bun]
$ bun add -D @rollup/plugin-swc @swc/core
```

```bash [Deno]
$ deno add -D npm:@rollup/plugin-swc npm:@swc/core
```

:::

```js
import { defineConfig, withFilter } from 'vite'

export default defineConfig({
  // ...
  plugins: [
    withFilter(
      swc({
        swc: {
          jsc: {
            parser: { decorators: true, decoratorsBeforeExport: true },
            // 注意: SWC はまだ '2023-11' バージョンをサポートしていません
            transform: { decoratorVersion: '2022-03' },
          },
        },
      }),
      // ファイルにデコレーターが含まれている場合のみこの変換を実行する
      { transform: { code: '@' } },
    ),
  ],
})
```

::::

#### esbuild フォールバック

`esbuild` は Vite で直接使用されなくなり、オプションの依存関係となりました。`transformWithEsbuild` 関数を使用するプラグインを使用している場合、`esbuild` を `devDependency` としてインストールする必要があります。`transformWithEsbuild` 関数は非推奨となり、将来削除される予定です。代わりに新しい `transformWithOxc` 関数への移行を推奨します。

### Oxc による JavaScript ミニファイ

esbuild の代わりに Oxc Minifier が JavaScript のミニファイに使用されるようになりました。非推奨の [`build.minify: 'esbuild'`](/config/build-options#build-minify) オプションを使用して esbuild に戻すことができます。この設定オプションは将来削除される予定で、Vite は esbuild に直接依存しなくなったため、`esbuild` を `devDependency` としてインストールする必要があります。

ミニファイの動作を制御するために `esbuild.minify*` オプションを使用していた場合、代わりに `build.rolldownOptions.output.minify` を使用できます。`esbuild.drop` オプションを使用していた場合、代わりに [`build.rolldownOptions.output.minify.compress.drop*` オプション](https://oxc.rs/docs/guide/usage/minifier/dead-code-elimination)を使用できます。

プロパティマングリングおよび関連オプション（[`mangleProps`、`reserveProps`、`mangleQuoted`、`mangleCache`](https://esbuild.github.io/api/#mangle-props)）は Oxc でサポートされていません。これらのオプションが必要な場合は、[oxc-project/oxc#15375](https://github.com/oxc-project/oxc/issues/15375) を参照してください。

esbuild と Oxc Minifier はソースコードについてわずかに異なる仮定をします。ミニファイアがコードの破損を引き起こしていると思われる場合、これらの仮定をここで比較できます:

- [esbuild ミニファイの仮定](https://esbuild.github.io/api/#minify-considerations)
- [Oxc Minifier の仮定](https://oxc.rs/docs/guide/usage/minifier.html#assumptions)

JavaScript アプリでミニファイに関連する問題を見つけた場合は、報告してください。

### Lightning CSS による CSS ミニファイ

[Lightning CSS](https://lightningcss.dev/) がデフォルトで CSS のミニファイに使用されるようになりました。[`build.cssMinify: 'esbuild'`](/config/build-options#build-cssminify) オプションを使用して esbuild に戻すことができます。ただし、`esbuild` を `devDependency` としてインストールする必要があります。

Lightning CSS はより優れた構文の低レベル化をサポートしており、CSS バンドルサイズがわずかに増加する可能性があります。

### 一貫した CommonJS 相互運用

CommonJS (CJS) モジュールからの `default` インポートが一貫した方法で処理されるようになりました。

以下の条件のいずれかに一致する場合、`default` インポートはインポート先 CJS モジュールの `module.exports` 値になります。それ以外の場合、`default` インポートはインポート先 CJS モジュールの `module.exports.default` 値になります:

- インポーターが `.mjs` または `.mts` です。
- インポーターの最も近い `package.json` の `type` フィールドが `module` に設定されています。
- インポート先 CJS モジュールの `module.exports.__esModule` 値が true に設定されていない。

::: details 以前の動作

開発時、以下の条件のいずれかに一致する場合、`default` インポートはインポート先 CJS モジュールの `module.exports` 値になります。それ以外の場合、`default` インポートはインポート先 CJS モジュールの `module.exports.default` 値になります:

- _インポーターが依存関係の最適化に含まれている_かつ `.mjs` または `.mts` です。
- _インポーターが依存関係の最適化に含まれている_かつインポーターの最も近い `package.json` の `type` フィールドが `module` に設定されています。
- インポート先 CJS モジュールの `module.exports.__esModule` 値が true に設定されていない。

ビルド時の条件は以下の通りでした:

- インポート先 CJS モジュールの `module.exports.__esModule` 値が true に設定されていない。
- _`module.exports` の `default` プロパティが存在しない_。

（[`build.commonjsOptions.defaultIsModuleExports`](https://github.com/rollup/plugins/tree/master/packages/commonjs#defaultismoduleexports) がデフォルトの `'auto'` から変更されていないと仮定）

:::

この問題の詳細については、Rolldown のドキュメントを参照してください: [Ambiguous `default` import from CJS modules - Bundling CJS | Rolldown](https://rolldown.rs/in-depth/bundling-cjs#ambiguous-default-import-from-cjs-modules)。

この変更により、CJS モジュールをインポートする既存のコードが破損する可能性があります。非推奨の `legacy.inconsistentCjsInterop: true` オプションを使用して、一時的に以前の動作を復元できます。この変更の影響を受けるパッケージを見つけた場合は、パッケージ作成者に報告するか、プルリクエストを送信してください。作成者が文脈を理解できるように、上記の Rolldown ドキュメントへのリンクを必ず含めてください。

### フォーマット推測を使用したモジュール解決の削除

`package.json` に `browser` と `module` フィールドの両方が存在する場合、Vite はファイルの内容に基づいてフィールドを解決し、ブラウザー用の ESM ファイルを選択していました。これは、一部のパッケージが Node.js 用の ESM ファイルを指すために `module` フィールドを使用し、他の一部のパッケージがブラウザー用の UMD ファイルを指すために `browser` フィールドを使用していたために導入されました。現代的な `exports` フィールドがこの問題を解決し、多くのパッケージで採用されているため、Vite はこのヒューリスティックを使用せず、常に [`resolve.mainFields`](/config/shared-options#resolve-mainfields) オプションの順序を尊重するようになりました。この動作に依存していた場合は、[`resolve.alias`](/config/shared-options#resolve-alias) オプションを使用してフィールドを目的のファイルにマッピングするか、パッケージマネージャーでパッチを適用できます（例: `patch-package`、`pnpm patch`）。

### 外部化されたモジュールの Require 呼び出し

外部化されたモジュールの `require` 呼び出しは、`import` ステートメントに変換されず、`require` 呼び出しとして保持されるようになりました。これは `require` 呼び出しのセマンティクスを保持するためです。それらを `import` ステートメントに変換したい場合は、`vite` から再エクスポートされている Rolldown の組み込み `esmExternalRequirePlugin` を使用できます。

```js
import { defineConfig, esmExternalRequirePlugin } from 'vite'

export default defineConfig({
  // ...
  plugins: [
    esmExternalRequirePlugin({
      external: ['react', 'vue', /^node:/],
    }),
  ],
})
```

詳細については、Rolldown のドキュメントを参照してください: [`require` external modules - Bundling CJS | Rolldown](https://rolldown.rs/in-depth/bundling-cjs#require-external-modules)。

### UMD / IIFE での `import.meta.url`

`import.meta.url` は UMD / IIFE 出力フォーマットでポリフィルされなくなりました。デフォルトで `undefined` に置き換えられます。以前の動作を希望する場合は、[`define`](/config/shared-options#define) オプションとともに [`build.rolldownOptions.output.intro`](https://rolldown.rs/reference/OutputOptions.intro) オプションを使用できます。詳細については、Rolldown のドキュメントを参照してください: [Well-known `import.meta` properties - Non ESM Output Formats | Rolldown](https://rolldown.rs/in-depth/non-esm-output-formats#well-known-import-meta-properties)。

### `build.rollupOptions.watch.chokidar` オプションの削除

`build.rollupOptions.watch.chokidar` オプションが削除されました。[`build.rolldownOptions.watch.notify`](https://rolldown.rs/reference/InputOptions.watch#notify) オプションに移行してください。

### `build.rollupOptions.output.manualChunks` の非推奨化

`output.manualChunks` オプションは非推奨です。Rolldown にはより柔軟な [`advancedChunks`](https://rolldown.rs/reference/OutputOptions.advancedChunks) オプションがあります。`advancedChunks` の詳細については、Rolldown のドキュメントを参照してください: [Advanced Chunks - Rolldown](https://rolldown.rs/in-depth/advanced-chunks)。

### モジュールタイプのサポートと自動検出

_この変更はプラグイン作成者にのみ影響します。_

Rolldown は、[esbuild の `loader` オプション](https://esbuild.github.io/api/#loader)と同様に、[モジュールタイプ](https://rolldown.rs/guide/notable-features#module-types)の実験的サポートを持っています。このため、Rolldown は解決された ID の拡張子に基づいてモジュールタイプを自動的に設定します。`load` または `transform` フックで他のモジュールタイプから JavaScript にコンテンツを変換する場合、返される値に `moduleType: 'js'` を追加する必要があるかもしれません:

```js
const plugin = {
  name: 'txt-loader',
  load(id) {
    if (id.endsWith('.txt')) {
      const content = fs.readFile(id, 'utf-8')
      return {
        code: `export default ${JSON.stringify(content)}`,
        moduleType: 'js', // [!code ++]
      }
    }
  },
}
```

### その他の関連する非推奨化

以下のオプションは非推奨となり、将来削除される予定です:

- `build.rollupOptions`: `build.rolldownOptions` に名前変更
- `worker.rollupOptions`: `worker.rolldownOptions` に名前変更
- `build.commonjsOptions`: 現在は no-op

## 全般的な変更 [<Badge text="NRV" type="warning" />](#migration-from-v7)

## 非推奨機能の削除 [<Badge text="NRV" type="warning" />](#migration-from-v7)

- `import.meta.hot.accept` に URL を渡すことはサポートされなくなりました。代わりに id を渡してください。([#21382](https://github.com/vitejs/vite/pull/21382))

**_TODO: この変更はまだ実装されていませんが、安定版リリース前に実装されます。_**

## 高度な内容

これらの重大な変更は、少数のユースケースにのみ影響すると予想されます:

- **[TODO: これは安定版リリース前に修正されます]** https://github.com/rolldown/rolldown/issues/5726（nuxt、qwik に影響）
- **[TODO: これは安定版リリース前に修正されます]** 事前ビルドチャンク出力機能の欠如により、レガシーチャンクがチャンクファイルではなくアセットファイルとして出力されます（[rolldown#4304](https://github.com/rolldown/rolldown/issues/4034)）。これは、チャンク関連のオプションがレガシーチャンクに適用されず、マニフェストファイルにレガシーチャンクがチャンクファイルとして含まれないことを意味します。
- **[TODO: これは安定版リリース前に修正されます]** `@vite-ignore` コメントのエッジケース（[rolldown-vite#426](https://github.com/vitejs/rolldown-vite/issues/426)）
- [Extglobs](https://github.com/micromatch/picomatch/blob/master/README.md#extglobs) はまだサポートされていません（[rolldown-vite#365](https://github.com/vitejs/rolldown-vite/issues/365)）
- `define` はオブジェクトの参照を共有しません: オブジェクトを `define` の値として渡すと、各変数はオブジェクトの個別のコピーを持ちます。詳細は [Oxc Transformer ドキュメント](https://oxc.rs/docs/guide/usage/transformer/global-variable-replacement#define)を参照してください。
- `bundle` オブジェクトの変更（`bundle` は `generateBundle` / `writeBundle` フックで渡されるオブジェクトで、`build` 関数によって返されます）:
  - `bundle[foo]` への代入はサポートされていません。これは Rollup でも推奨されていません。代わりに `this.emitFile()` を使用してください。
  - フック間で参照が共有されません（[rolldown-vite#410](https://github.com/vitejs/rolldown-vite/issues/410)）
  - `structuredClone(bundle)` が `DataCloneError: #<Object> could not be cloned` でエラーになります。これはサポートされなくなりました。代わりに `structuredClone({ ...bundle })` でクローンしてください。（[rolldown-vite#128](https://github.com/vitejs/rolldown-vite/issues/128)）
- Rollup のすべての並列フックは順次フックとして動作します。詳細は [Rolldown のドキュメント](https://rolldown.rs/apis/plugin-api#sequential-hook-execution)を参照してください。
- `"use strict";` が時々注入されません。詳細は [Rolldown のドキュメント](https://rolldown.rs/in-depth/directives)を参照してください。
- plugin-legacy で ES5 より低いレベルへの変換はサポートされていません（[rolldown-vite#452](https://github.com/vitejs/rolldown-vite/issues/452)）
- `build.target` オプションに同じブラウザーの複数のバージョンを渡すとエラーになります: esbuild は最新バージョンを選択しますが、これはおそらく意図したものではありません。
- Rolldown によるサポートの欠如: 以下の機能は Rolldown でサポートされておらず、Vite でもサポートされなくなりました。
  - `build.rollupOptions.output.format: 'system'`（[rolldown#2387](https://github.com/rolldown/rolldown/issues/2387)）
  - `build.rollupOptions.output.format: 'amd'`（[rolldown#2387](https://github.com/rolldown/rolldown/issues/2528)）
  - TypeScript レガシー名前空間の完全サポート（[oxc-project/oxc#14227](https://github.com/oxc-project/oxc/issues/14227)）
  - `shouldTransformCachedModule` フック（[rolldown#4389](https://github.com/rolldown/rolldown/issues/4389)）
  - `resolveImportMeta` フック（[rolldown#1010](https://github.com/rolldown/rolldown/issues/1010)）
  - `renderDynamicImport` フック（[rolldown#4532](https://github.com/rolldown/rolldown/issues/4532)）
  - `resolveFileUrl` フック
- `parseAst` / `parseAstAsync` 関数は、より多くの機能を持つ `parseSync` / `parse` 関数に置き換えられ、非推奨となりました。

## v6 からの移行

まず、Vite v7 ドキュメントの [v6 からの移行ガイド](https://v7.vite.dev/guide/migration)をチェックし、アプリを Vite 7 に移植するために必要な変更を確認してから、このページの変更を進めてください。
