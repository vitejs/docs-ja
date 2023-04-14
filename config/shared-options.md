# 共通オプション

## root

- **型:** `string`
- **デフォルト:** `process.cwd()`

プロジェクトのルートディレクトリ（`index.html` が置かれている場所）。絶対パス、または現在のワーキングディレクトリからの相対パスを指定できます。

詳細は [プロジェクトルート](/guide/#index-html-とプロジェクトルート) を参照してください。

## base

- **型:** `string`
- **デフォルト:** `/`

開発環境または本番環境で配信される際のベースとなるパブリックパス。有効な値は次のとおりです:

- 絶対 URL パス名。例 `/foo/`
- 完全な URL。例 `https://foo.com/`
- 空文字列または `./`（埋め込みデプロイ用）

詳細は [Public Base Path](/guide/build#public-base-path) を参照してください。

## mode

- **型:** `string`
- **デフォルト:** serve は `'development'`、build では `'production'`

config でこれを指定すると、**serve と build 両方**のデフォルトモードが上書きされます。この値はコマンドラインの `--mode` オプションでも上書きできます。

詳細は [環境変数とモード](/guide/env-and-mode) を参照してください。

## define

- **型:** `Record<string, any>`

グローバル定数の置換を定義します。エントリは開発時にグローバルで定義され、ビルド時に静的に置き換えられます。

- 文字列の値は未加工の式として評価されるので、文字列の定数を定義する場合は、**明示的に引用符で囲う必要があります**（例えば `JSON.stringify` を使う）。

- [esbuild の動作](https://esbuild.github.io/api/#define)と矛盾しないように、式は JSON オブジェクト（null, boolean, number, string, array, object）か単一の識別子でなければなりません。

- マッチした部分が他の文字、数字、`_` または `$` で囲まれていない場合のみ置換されます。

::: warning
構文解析なしの単純なテキスト置換として実装されているため、`define` は「定数」にのみ使用することをおすすめします。

例えば、`process.env.FOO` や `__APP_VERSION__` などが適しています。しかし、`process` や `global` はこのオプションに入れるべきではありません。変数は代わりに Shim や Polyfill で使用できます。
:::

::: tip 注意
TypeScript を使用する場合、型チェックと自動補完を利用するには `env.d.ts` または `vite-env.d.ts` ファイルに型定義を追加してください。

例:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

::: tip 注意
開発環境とビルド環境で `define` の実装が異なるので、矛盾を回避するために、いくつかの使い方を避ける必要があります。

例:

```js
const obj = {
  __NAME__, // オブジェクトのショートハンドプロパティ名を定義しないこと
  __KEY__: value, // オブジェクトのキーを定義しないこと
}
```

:::

## plugins

- **型:** `(Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[]`

使用するプラグインの配列。falsy なプラグインは無視され、プラグインの配列はフラット化されます。 promise が返された場合は、実行前に解決されます。 Vite プラグインの詳細は [プラグイン API](/guide/api-plugin) を参照してください。

## publicDir

- **型:** `string | false`
- **デフォルト:** `"public"`

加工せずに静的アセットとして配信するディレクトリ。このディレクトリのファイルは、開発時には `/` として配信され、ビルド時には `outDir` のルートにコピーされます。常に変換されることなくそのまま配信またはコピーされます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。

`publicDir` を `false` に設定すると、この機能は無効になります。

詳細は [`public` ディレクトリ](/guide/assets#public-ディレクトリ) を参照してください。

## cacheDir

- **型:** `string`
- **デフォルト:** `"node_modules/.vite"`

キャッシュファイルを保存するディレクトリ。このディレクトリのファイルは、事前バンドルされた依存関係や Vite によって生成されたキャッシュファイルで、パフォーマンスを向上させることができます。`--force` フラグを使用したり、手動でディレクトリを削除するとキャッシュファイルを再生成できます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。package.json が検出されなかった場合のデフォルトは `.vite` です。

## resolve.alias

- **型:**
`Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

[エントリオプション](https://github.com/rollup/plugins/tree/master/packages/alias#entries)として `@rollup/plugin-alias` に渡されます。`{ find, replacement, customResolver }` の配列か、オブジェクトを指定します。

ファイルシステムのパスにエイリアスを設定する場合は、必ず絶対パスを使用してください。相対的なエイリアス値はそのまま使用され、ファイルシステムのパスには解決されません。

より高度なカスタム解決は[プラグイン](/guide/api-plugin)によって実現できます。

:::warning エイリアスの操作
[SSR の外部化された依存関係](/guide/ssr#外部-ssr)のエイリアスを設定した場合は、実際の `node_modules` パッケージのエイリアスを設定することをお勧めします。[Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) と [pnpm](https://pnpm.js.org/en/aliases) の両方で `npm:` のエイリアスをサポートします。
:::

## resolve.dedupe

- **型:** `string[]`

アプリ内で同じ依存関係のコピーが重複している場合（おそらくモノレポのリンクされたパッケージや巻き上げが原因）、このオプションを使用して、リストされた依存関係を（プロジェクトルートから）常に同じコピーに解決するように Vite に強制します。

:::warning SSR + ESM
SSR ビルドの場合、`build.rollupOptions.output` で設定された ESM ビルド出力に対して重複排除が機能しません。これを回避するには、ESM のモジュール読み込みのためのプラグインのサポートが改善されるまで、CJS ビルド出力を使用する必要があります。
:::

## resolve.conditions

- **型:** `string[]`

パッケージからの[条件付きエクスポート](https://nodejs.org/api/packages.html#packages_conditional_exports)解決する際に許可される追加の条件。

条件付きエクスポートを持つパッケージでは、`package.json` に次の `exports` フィールドが含まれる場合があります:

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

ここで、`import` と `require` は「条件」です。条件はネストさせることができ、最も具体的なものから最も具体的でないものまで指定する必要があります。

Vite には「許可された条件」のリストがあり、許可されたリストにある最初の条件と一致します。 デフォルトで許可される条件は、`import`、`module`、`browser`、`default` と、現在のモードに基づく `production/development` です。`resolve.conditions` 設定オプションを使用すると、追加の許可条件を指定できます。

:::warning サブパスのエクスポートの解決
エクスポートのキーが "/" で終わるのは Node では非推奨で、うまく動作しない可能性があります。代わりに [`*` サブパスパターン](https://nodejs.org/api/packages.html#package-entry-points) を使用するよう、パッケージ作者に連絡してください。
:::

## resolve.mainFields

- **型:** `string[]`
- **デフォルト:** `['module', 'jsnext:main', 'jsnext']`

パッケージのエントリポイントを解決するときに試行する `package.json` のフィールドのリスト。これは `exports` フィールドから解決された条件付きエクスポートよりも優先順位が低いことに注意してください: エントリポイントが `exports` からの解決に成功した場合、main フィールドは無視されます。

## resolve.browserField

- **型:** `boolean`
- **デフォルト:** `true`
- **非推奨**

`browser` フィールドへの解決を有効にするかどうか。

将来的に `resolve.mainFields` のデフォルト値は `['browser', 'module', 'jsnext:main', 'jsnext']` となり、このオプションは削除される予定です。

## resolve.extensions

- **型:** `string[]`
- **デフォルト:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

拡張子を省略したインポートに試行するファイル拡張子のリスト。カスタムインポートタイプ（`.vue` など）の拡張子を省略すると、IDE や型のサポートに支障をきたす可能性があるため、推奨され**ません**。

## resolve.preserveSymlinks

- **型:** `boolean`
- **デフォルト:** `false`

この設定を有効にすると、Vite は実際のファイルパス（つまりシンボリックリンクを辿った後のパス）ではなく、オリジナルのファイルパス（つまりシンボリックリンクを辿っていないパス）でファイルの同一性を判別します。

- **関連:** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks), [webpack#resolve.symlinks
  ](https://webpack.js.org/configuration/resolve/#resolvesymlinks)

## css.modules

- **型:**
```ts
interface CSSModulesOptions {
  scopeBehaviour?: 'global' | 'local'
  globalModulePaths?: RegExp[]
  generateScopedName?:
    | string
    | ((name: string, filename: string, css: string) => string)
  hashPrefix?: string
  /**
   * デフォルト: null
   */
  localsConvention?:
    | 'camelCase'
    | 'camelCaseOnly'
    | 'dashes'
    | 'dashesOnly'
    | null
}
```

CSS モジュールの動作を設定します。オプションは [postcss-modules](https://github.com/css-modules/postcss-modules) に渡されます。

## css.postcss

- **型:** `string | (postcss.ProcessOptions & { plugins?: postcss.AcceptedPlugin[] })`

インラインの PostCSS 設定、もしくは PostCSS の設定ファイルを検索するカスタムディレクトリ（デフォルトはプロジェクトルート）。

インラインの PostCSS の設定には、`postcss.config.js` と同じ書式を想定してします。しかし、`plugins` のプロパティには、[配列のフォーマット](https://github.com/postcss/postcss-load-config/blob/main/README.md#array)しか使用できません。

検索は [postcss-load-config](https://github.com/postcss/postcss-load-config) を使用し、対応する設定ファイル名のみが読み込まれます。

インライン設定が提供された場合、Vite は他の PostCSS 設定ソースを検索しないことに注意してください。

## css.preprocessorOptions

- **型:** `Record<string, object>`

CSS プリプロセッサに渡すオプションを指定します。オプションのキーとしてファイルの拡張子を使用します。各プリプロセッサでサポートされているオプションは、それぞれのドキュメントで確認できます:

- `sass`/`scss` - [オプション](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions)。
- `less` - [オプション](https://lesscss.org/usage/#less-options)。
- `styl`/`stylus` - オブジェクトとして渡せる [`define`](https://stylus-lang.com/docs/js.html#define-name-node) のみサポートされています。

すべてのプリプロセッサオプションは `additionalData` オプションもサポートしており、これを使用して各スタイルのコンテンツに追加のコードを注入できます。変数だけでなく実際のスタイルを含めると、それらのスタイルは最終的なバンドルに複製されるので注意してください。

例:

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
    },
  },
})
```

## css.devSourcemap

- **実験的機能**
- **型:** `boolean`
- **デフォルト:** `false`

  開発時にソースマップを有効にするかどうか。

## json.namedExports

- **型:** `boolean`
- **デフォルト:** `true`

`.json` ファイルからの名前付きインポートをサポートするかどうか。

## json.stringify

- **型:** `boolean`
- **デフォルト:** `false`

`true` に設定すると、インポートされた JSON は `export default JSON.parse("...")` に変換されます。これは特に JSON ファイルが大きい場合、オブジェクトリテラルよりも大幅にパフォーマンスが向上します。

有効にすると、名前付きインポートは無効になります。

## esbuild

- **型:** `ESBuildOptions | false`

`ESBuildOptions` は [esbuild 自身の変換オプション](https://esbuild.github.io/api/#transform-api)を拡張します。最も一般的な使用例は、JSX のカスタマイズです:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

デフォルトでは esbuild は `ts`, `jsx`, `tsx` ファイルに適用されます。`esbuild.include` と `esbuild.exclude` でカスタマイズでき、正規表現か [picomatch](https://github.com/micromatch/picomatch#globbing-features) パターン、もしくはそれらの配列を指定します。

また、`esbuild.jsxInject` を使用すると、esbuild で変換されたすべてのファイルに対して JSX ヘルパの import を自動的に注入できます:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

[`build.minify`](./build-options.md#build-minify) が `true` のとき、全てのミニファイ最適化はデフォルトで適用されます。[特定の側面](https://esbuild.github.io/api/#minify)を無効化するためには、`esbuild.minifyIdentifiers` 、`esbuild.minifySyntax` 、`esbuild.minifyWhitespace` のいずれかを `false` に設定してください。`build.minify` を上書きするために `esbuild.minify` を利用できないことに注意してください。

esbuild の変換を無効にするには `false` を設定します。

## assetsInclude

- **型:** `string | RegExp | (string | RegExp)[]`
- **関連:** [静的アセットの取り扱い](/guide/assets)

静的アセットとして扱う追加の [picomatch パターン](https://github.com/micromatch/picomatch#globbing-features)を指定します。そして:

- HTML から参照されたり、`fetch` や XHR で直接リクエストされたりすると、プラグインの変換パイプラインから除外されます。

- JS からインポートすると、解決された URL 文字列が返されます（アセットタイプを別の方法で処理するための `enforce: 'pre'` プラグインがある場合は上書きされます）

組み込みのアセットタイプのリストは[こちら](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts)をご覧ください。

**例:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## logLevel

- **型:** `'info' | 'warn' | 'error' | 'silent'`

コンソール出力の詳細度を調整します。デフォルトは `'info'` です。

## customLogger

- **型:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

メッセージを記録するためのカスタムロガーを使用します。Vite の `createLogger` API を使って、デフォルトのロガーを取得し、例えば、メッセージを変更したり、特定の警告をフィルタリングしたりするようにカスタマイズできます。

```js
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // 空の CSS ファイル警告を無視する
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## clearScreen

- **型:** `boolean`
- **デフォルト:** `true`

Vite が特定のメッセージをログに出力する際、ターミナル画面をクリアしないようにするには `false` に設定します。コマンドラインからは、`--clearScreen false` を使用してください。

## envDir

- **型:** `string`
- **デフォルト:** `root`

`.env` ファイルを読み込むディレクトリ。絶対パス、もしくはプロジェクトルートからの相対パスを指定します。

環境ファイルの詳細については[こちら](/guide/env-and-mode#env-files)をご覧ください。

## envPrefix

- **型:** `string | string[]`
- **デフォルト:** `VITE_`

`envPrefix` で始まる環境変数は、import.meta.env でクライアントのソースコードに公開されます。

:::warning SECURITY NOTES
`envPrefix` に `''` を設定してはいけません。全ての env 変数を公開してしまい、予期せぬ機密情報の漏洩を引き起こします。Vite は `''` を検出するとエラーをスローします。

プレフィックスのない変数を公開したい場合は、[define](#define) を使って公開できます:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## appType

- **型:** `'spa' | 'mpa' | 'custom'`
- **デフォルト:** `'spa'`

アプリケーションがシングルページアプリケーション (SPA) か、[マルチページアプリケーション (MPA)](../guide/build#マルチページアプリ)か、カスタムアプリケーション (SSR と独自に HTML を処理するフレームワーク):

- `'spa'`: HTML ミドルウェアを含め、SPA 用のフォールバックを使用する。プレビューで `single: true` を [sirv](https://github.com/lukeed/sirv) に設定する
- `'mpa'`: HTML ミドルウェアを含める
- `'custom'`: HTML ミドルウェアを含めない

詳細は Vite の [SSR ガイド](/guide/ssr#vite-cli) 参照してください。関連: [`server.middlewareMode`](./server-options#server-middlewaremode)。
