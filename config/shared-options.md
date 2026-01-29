# 共通オプション

特に記載がない限り、このセクションのオプションは開発、ビルド、プレビューのすべてに適用されます。

## root

- **型:** `string`
- **デフォルト:** `process.cwd()`

プロジェクトのルートディレクトリー（`index.html` が置かれている場所）。絶対パス、または現在のワーキングディレクトリーからの相対パスを指定できます。

詳細は [プロジェクトルート](/guide/#index-html-and-project-root) を参照してください。

## base

- **型:** `string`
- **デフォルト:** `/`
- **関連:** [`server.origin`](/config/server-options.md#server-origin)

開発環境または本番環境で配信される際のベースとなるパブリックパス。有効な値は次のとおりです:

- 絶対 URL パス名。例 `/foo/`
- 完全な URL。例 `https://bar.com/foo/`（オリジン部分は開発環境では使用されないため、値は `/foo/` と同じです）
- 空文字列または `./`（埋め込みデプロイ用）

詳細は [Public Base Path](/guide/build#public-base-path) を参照してください。

## mode

- **型:** `string`
- **デフォルト:** serve は `'development'`、build では `'production'`

config でこれを指定すると、**serve と build 両方**のデフォルトモードが上書きされます。この値はコマンドラインの `--mode` オプションでも上書きできます。

詳細は [環境変数とモード](/guide/env-and-mode) を参照してください。

## define

- **型:** `Record<string, any>`

グローバル定数の置換を定義します。エントリーは開発時にグローバルで定義され、ビルド時に静的に置き換えられます。

Vite は [Oxc の define 機能](https://oxc.rs/docs/guide/usage/transformer/global-variable-replacement#define) を使って置換を行うので、値の式は JSON でシリアライズ可能な値（null、boolean、数値、文字列、配列、オブジェクト）または単一の識別子を含む文字列でなければなりません。文字列以外の値の場合、Vite は自動的に `JSON.stringify` で文字列に変換します。

**例:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip 注意
TypeScript を使用する場合、型チェックと自動補完を利用するには `vite-env.d.ts` ファイルに型定義を追加してください。

例:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## plugins

- **型:** `(Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[]`

使用するプラグインの配列。falsy なプラグインは無視され、プラグインの配列はフラット化されます。 promise が返された場合は、実行前に解決されます。 Vite プラグインの詳細は [プラグイン API](/guide/api-plugin) を参照してください。

## publicDir

- **型:** `string | false`
- **デフォルト:** `"public"`

加工せずに静的アセットとして配信するディレクトリー。このディレクトリーのファイルは、開発時には `/` として配信され、ビルド時には `outDir` のルートにコピーされます。常に変換されることなくそのまま配信またはコピーされます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。

`publicDir` を `false` に設定すると、この機能は無効になります。

詳細は [`public` ディレクトリー](/guide/assets#the-public-directory) を参照してください。

## cacheDir

- **型:** `string`
- **デフォルト:** `"node_modules/.vite"`

キャッシュファイルを保存するディレクトリー。このディレクトリーのファイルは、事前バンドルされた依存関係や Vite によって生成されたキャッシュファイルで、パフォーマンスを向上させることができます。`--force` フラグを使用したり、手動でディレクトリーを削除するとキャッシュファイルを再生成できます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。`package.json` が検出されなかった場合のデフォルトは `.vite` です。

## resolve.alias

- **型:**
`Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

`import` や `require` 文の値を置換するために使用するエイリアスを定義します。これは [`@rollup/plugin-alias`](https://github.com/rollup/plugins/tree/master/packages/alias) と同様に動作します。

エントリーの順序は重要で、最初に定義されたルールが最初に適用されます。

ファイルシステムのパスにエイリアスを設定する場合は、必ず絶対パスを使用してください。相対的なエイリアス値はそのまま使用され、ファイルシステムのパスには解決されません。

より高度なカスタム解決は[プラグイン](/guide/api-plugin)によって実現できます。

:::warning エイリアスの操作
[SSR の外部化された依存関係](/guide/ssr#ssr-externals)のエイリアスを設定した場合は、実際の `node_modules` パッケージのエイリアスを設定することをお勧めします。[Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) と [pnpm](https://pnpm.io/aliases/) の両方で `npm:` のエイリアスをサポートします。
:::

### オブジェクト形式（`Record<string, string>`）

オブジェクト形式では、エイリアスをキーとして指定し、対応する値を実際のインポート値として指定できます。例えば:

```js
resolve: {
  alias: {
    utils: '../../../utils',
    'batman-1.0.0': './joker-1.5.0'
  }
}
```

### 配列形式（`Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`）

配列形式では、エイリアスをオブジェクトとして指定できます。これは複雑なキー/値のペアに便利です。

```js
resolve: {
  alias: [
    { find: 'utils', replacement: '../../../utils' },
    { find: 'batman-1.0.0', replacement: './joker-1.5.0' },
  ]
}
```

`find` が正規表現の場合、`replacement` で `$1` などの[置換パターン](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E7%BD%AE%E6%8F%9B%E6%96%87%E5%AD%97%E5%88%97%E3%81%A8%E3%81%97%E3%81%A6%E3%81%AE%E6%96%87%E5%AD%97%E5%88%97%E3%81%AE%E6%8C%87%E5%AE%9A)を使用できます。例えば、拡張子を別の拡張子に置換するには、次のようなパターンを使用します:

```js
{ find:/^(.*)\.js$/, replacement: '$1.alias' }
```

`customResolver` オプションを使用すると、個々のエイリアスに対して別のモジュール解決を提供できます。

## resolve.dedupe

- **型:** `string[]`

アプリ内で同じ依存関係のコピーが重複している場合（おそらくモノレポのリンクされたパッケージや巻き上げが原因）、このオプションを使用して、リストされた依存関係を（プロジェクトルートから）常に同じコピーに解決するように Vite に強制します。

:::warning SSR + ESM
SSR ビルドの場合、`build.rollupOptions.output` で設定された ESM ビルド出力に対して重複排除が機能しません。これを回避するには、ESM のモジュール読み込みのためのプラグインのサポートが改善されるまで、CJS ビルド出力を使用する必要があります。
:::

## resolve.conditions <NonInheritBadge />

- **型:** `string[]`
- **デフォルト:** `['module', 'browser', 'development|production']` (`defaultClientConditions`)

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

`development|production` は、`process.env.NODE_ENV` の値に応じて `production` または `development` に置換される特殊な値です。`process.env.NODE_ENV === 'production'` の場合には `production` に置換され、それ以外の場合は `development` に置換されます。

要件が満たされている場合は、`import`、`require`、`default` の条件が常に適用されることに注意してください。

## resolve.mainFields <NonInheritBadge />

- **型:** `string[]`
- **デフォルト:** `['browser', 'module', 'jsnext:main', 'jsnext']` (`defaultClientMainFields`)

パッケージのエントリーポイントを解決するときに試行する `package.json` のフィールドのリスト。これは `exports` フィールドから解決された条件付きエクスポートよりも優先順位が低いことに注意してください: エントリーポイントが `exports` からの解決に成功した場合、main フィールドは無視されます。

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

## resolve.tsconfigPaths

- **型:** `boolean`
- **デフォルト:** `false`

tsconfig パス解決機能を有効にします。`tsconfig.json` の `paths` オプションがインポートの解決に使用されます。詳細は [特徴](/guide/features.md#paths) を参照してください。

## html.cspNonce

- **型:** `string`
- **関連:** [コンテンツセキュリティポリシー（CSP）](/guide/features#content-security-policy-csp)

script や style タグを生成するときに使われる nonce 値のプレースホルダー。この値を設定すると、nonce 値を持つ meta タグも生成されます。

## css.modules

- **型:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * デフォルト: undefined
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

CSS モジュールの動作を設定します。オプションは [postcss-modules](https://github.com/css-modules/postcss-modules) に渡されます。

このオプションは [Lightning CSS](../guide/features.md#lightning-css) 使用時には効果がありません。有効にする場合は [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) を使用してください。

## css.postcss

- **型:** `string | (postcss.ProcessOptions & { plugins?: postcss.AcceptedPlugin[] })`

インラインの PostCSS 設定、もしくは PostCSS の設定ファイルを検索するカスタムディレクトリー（デフォルトはプロジェクトルート）。

インラインの PostCSS の設定には、`postcss.config.js` と同じ書式を想定してします。しかし、`plugins` のプロパティには、[配列のフォーマット](https://github.com/postcss/postcss-load-config/blob/main/README.md#array)しか使用できません。

検索は [postcss-load-config](https://github.com/postcss/postcss-load-config) を使用し、対応する設定ファイル名のみが読み込まれます。ワークスペースルート（またはワークスペースが見つからない場合は [プロジェクトルート](/guide/#index-html-and-project-root)）以外の設定ファイルは、デフォルトでは検索されません。必要に応じて、特定の設定ファイルを読み込むために、ルート外のカスタムパスを指定できます。

インライン設定が提供された場合、Vite は他の PostCSS 設定ソースを検索しないことに注意してください。

## css.preprocessorOptions

- **型:** `Record<string, object>`

CSS プリプロセッサーに渡すオプションを指定します。オプションのキーとしてファイルの拡張子を使用します。各プリプロセッサーでサポートされているオプションは、それぞれのドキュメントで確認できます:

- `sass`/`scss`:
  - `sass-embedded` がインストールされている場合はそれを使用し、そうでない場合は `sass` を使用します。最高のパフォーマンスを得るには、`sass-embedded` パッケージをインストールすることをお勧めします。
  - [オプション](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
- `less`: [オプション](https://lesscss.org/usage/#less-options)。
- `styl`/`stylus`: オブジェクトとして渡せる [`define`](https://stylus-lang.com/docs/js.html#define-name-node) のみサポートされています。

**例:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **型:** `string | ((source: string, filename: string) => (string | { content: string; map?: SourceMap }))`

このオプションは、各スタイルコンテンツに追加のコードを挿入するために使用できます。変数だけではなく実際のスタイルを含めた場合、それらのスタイルは最終的なバンドルに複製されることに注意してください。

**例:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

::: tip ファイルのインポート
異なるディレクトリのファイルに同じコードが追加されるため、相対パスは正しく解決されません。代わりに絶対パスまたは[エイリアス](#resolve-alias)を使用してください。
:::

## css.preprocessorMaxWorkers

- **型:** `number | true`
- **デフォルト:** `true`

CSS プリプロセッサーが使用できるスレッドの最大数を指定します。`true` は CPU の数 -1 を意味します。`0` に指定すると、Vite ワーカーを作成せず、メインスレッドでプリプロセッサーを実行します。  

プリプロセッサのオプションによっては、このオプションを `0` に設定しなかったとしても、Vite はプリプロセッサをメインスレッドで実行する場合があります。

## css.devSourcemap

- **実験的機能:** [フィードバックをしてください](https://github.com/vitejs/vite/discussions/13845)
- **型:** `boolean`
- **デフォルト:** `false`

  開発時にソースマップを有効にするかどうか。

## css.transformer

- **実験的機能:** [フィードバックをしてください](https://github.com/vitejs/vite/discussions/13835)
- **型:** `'postcss' | 'lightningcss'`
- **デフォルト:** `'postcss'`

CSS 処理に使用するエンジンを選択します。詳細は [Lightning CSS](../guide/features.md#lightning-css) を参照してください。

::: info `@import` の重複
postcss (postcss-import) は、ブラウザーからの `@import` が重複した場合の動作が異なることに注意してください。[postcss/postcss-import#462](https://github.com/postcss/postcss-import/issues/462) を参照してください。
:::

## css.lightningcss

- **実験的機能:** [フィードバックをしてください](https://github.com/vitejs/vite/discussions/13835)
- **型:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Lightning CSS の設定。すべての変換オプションは [Lightning CSS のリポジトリー](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts)で確認できます。

## json.namedExports

- **型:** `boolean`
- **デフォルト:** `true`

`.json` ファイルからの名前付きインポートをサポートするかどうか。

## json.stringify

- **型:** `boolean | 'auto'`
- **デフォルト:** `'auto'`

`true` に設定すると、インポートされた JSON は `export default JSON.parse("...")` に変換されます。これは特に JSON ファイルが大きい場合、オブジェクトリテラルよりも大幅にパフォーマンスが向上します。

`'auto'` に設定すると、[データが 10kB より大きい](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger) 場合にのみデータが文字列化されます。

## oxc

- **型:** `OxcOptions | false`

`OxcOptions` は [Oxc Transformer のオプション](https://oxc.rs/docs/guide/usage/transformer)を拡張します。最も一般的な使用例は、JSX のカスタマイズです:

```js
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'classic',
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
})
```

デフォルトでは Oxc による変換は `ts`, `jsx`, `tsx` ファイルに適用されます。`oxc.include` と `oxc.exclude` でカスタマイズでき、正規表現か [picomatch](https://github.com/micromatch/picomatch#globbing-features) パターン、もしくはそれらの配列を指定します。

また、`oxc.jsxInject` を使用すると、Oxc で変換されたすべてのファイルに対して JSX ヘルパーの import を自動的に注入できます:

```js
export default defineConfig({
  oxc: {
    jsxInject: `import React from 'react'`,
  },
})
```

Oxc による変換を無効にするには `false` を設定します。

## esbuild

- **型:** `ESBuildOptions | false`
- **非推奨**

このオプションは内部的に `oxc` オプションに変換されます。代わりに `oxc` オプションを使用してください。

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

```js twoslash
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

- **型:** `string | false`
- **デフォルト:** `root`

`.env` ファイルを読み込むディレクトリー。絶対パス、もしくはプロジェクトルートからの相対パスを指定します。`false` は `.env` ファイルの読み込みを無効化します。

環境ファイルの詳細については[こちら](/guide/env-and-mode#env-files)をご覧ください。

## envPrefix

- **型:** `string | string[]`
- **デフォルト:** `VITE_`

`envPrefix` で始まる環境変数は、`import.meta.env` でクライアントのソースコードに公開されます。

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

アプリケーションがシングルページアプリケーション（SPA）か、[マルチページアプリケーション（MPA）](../guide/build#multi-page-app)か、カスタムアプリケーション（SSR と独自に HTML を処理するフレームワーク）:

- `'spa'`: HTML ミドルウェアを含め、SPA 用のフォールバックを使用する。プレビューで `single: true` を [sirv](https://github.com/lukeed/sirv) に設定する
- `'mpa'`: HTML ミドルウェアを含める
- `'custom'`: HTML ミドルウェアを含めない

詳細は Vite の [SSR ガイド](/guide/ssr#vite-cli) 参照してください。関連: [`server.middlewareMode`](./server-options#server-middlewaremode)。

## future

- **型:** `Record<string, 'warn' | undefined>`
- **関連:** [破壊的変更](/changes/)

Vite の次期メジャーバージョンへのスムーズな移行に備え、将来的な破壊的変更を可能にします。このリストは、新機能の開発に伴い、いつでも更新、追加、削除される可能性があります。

設定可能なオプションの詳細については、[破壊的変更](/changes/) ページを参照してください。
