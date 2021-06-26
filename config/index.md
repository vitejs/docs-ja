# Vite の設定

## 設定ファイル

### 設定ファイルの解決

コマンドラインから `vite` を実行すると、Vite は[プロジェクトルート](/guide/#index-html-and-project-root)内の `vite.config.js` という名前の設定ファイルを自動的に解決しようとします。

最も基本的な設定ファイルは次のようになります:

```js
// vite.config.js
export default {
  // 設定オプション
}
```

プロジェクトが `type: "module"` を介してネイティブな Node ESM を使用していない場合でも、Vite は設定ファイルで ES モジュール構文の使用をサポートしています。この場合、設定ファイルはロードの前に自動的に前処理されます。

また、CLI の `--config` オプションで、使用するコンフィグファイルを明示的に指定することもできます（`cwd` からの相対的な解決）:

```bash
vite --config my-config.js
```

### 設定の入力補完

Vite には TypeScript の型が同梱されているので、jsdoc のタイプヒントを使って IDE の入力補完を活用できます:

```js
/**
 * @type {import('vite').UserConfig}
 */
const config = {
  // ...
}

export default config
```

あるいは、jsdoc のアノテーションがなくても入力補完を提供する `defineConfig` ヘルパーを使用することもできます:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite は TS の設定ファイルも直接サポートしています。`vite.config.ts` を `defineConfig` ヘルパーと一緒に使うこともできます。

### 条件付き設定

コマンド（`serve` か `build`）や使用されている[モード](/guide/env-and-mode)に基づいて条件付きで設定のオプションを決定する必要がある場合は、代わりに関数をエクスポートできます:

```js
export default ({ command, mode }) => {
  if (command === 'serve') {
    return {
      // serve 固有の設定
    }
  } else {
    return {
      // build 固有の設定
    }
  }
}
```

### 非同期の設定

設定で非同期の関数を呼び出す必要がある場合は、代わりに async 関数をエクスポートできます:

```js
export default async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // build 固有の設定
  }
}
```

## 共通オプション

### root

- **型:** `string`
- **デフォルト:** `process.cwd()`

  プロジェクトのルートディレクトリ（`index.html` が置かれている場所）。絶対パス、または設定ファイル自体の場所からの相対パスを指定できます。

  詳細は [プロジェクトルート](/guide/#index-html-and-project-root) を参照してください。

### base

- **型:** `string`
- **デフォルト:** `/`

  開発環境または本番環境で配信される際のベースとなるパブリックパス。有効な値は次のとおりです:

  - 絶対 URL パス名。例 `/foo/`
  - 完全な URL。例 `https://foo.com/`
  - 空文字列または `./`（埋め込みデプロイ用）

  詳細は [Public Base Path](/guide/build#public-base-path) を参照してください。

### mode

- **型:** `string`
- **デフォルト:** serve は `'development'`、build では `'production'`

  config でこれを指定すると、**serve と build 両方**のデフォルトモードが上書きされます。この値はコマンドラインの `--mode` オプションでも上書きできます。

  詳細は [環境変数とモード](/guide/env-and-mode) を参照してください。

### define

- **型:** `Record<string, string>`

  グローバル定数の置換を定義します。エントリーは開発時にグローバルで定義され、ビルド時に静的に置き換えられます。

  - `2.0.0-beta.70` 以降、文字列の値は純粋な式として評価されるので、文字列の定数を定義する場合は、明示的に引用符で囲う必要があります（例 `JSON.stringify` を使う）。

  - マッチした部分が単語の境界（`\b`）で囲まれている場合のみ置換されます。

  構文解析なしの単純なテキスト置換として実装されているため、`define` は「定数」にのみ使用することをおすすめします。

  例えば、`process.env.FOO` や `__APP_VERSION__` などが適しています。しかし、`process` や `global` はこのオプションに入れるべきではありません。変数は代わりに Shim や Polyfill で使用できます。

### plugins

- **型:** ` (Plugin | Plugin[])[]`

  使用するプラグインの配列。falsy なプラグインは無視され、プラグインの配列はフラット化されます。 Vite プラグインの詳細は [プラグイン API](/guide/api-plugin) を参照してください。

### publicDir

- **型:** `string`
- **デフォルト:** `"public"`

  加工せずに静的アセットとして配信するディレクトリ。このディレクトリのファイルは、開発時には `/` として配信され、ビルド時には `outDir` のルートにコピーされます。常に変換されることなくそのまま配信またはコピーされます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。

  詳細は [The `public` Directory](/guide/assets#the-public-directory) を参照してください。

### cacheDir

- **型:** `string`
- **デフォルト:** `"node_modules/.vite"`

  キャッシュファイルを保存するディレクトリ。このディレクトリのファイルは、事前バンドルされた依存関係や Vite によって生成されたキャッシュファイルで、パフォーマンスを向上させることができます。`--force` フラグを使用したり、手動でディレクトリを削除するとキャッシュファイルを再生成できます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。

### resolve.alias

- **型:**
  `Record<string, string> | Array<{ find: string | RegExp, replacement: string }>`

  [エントリーオプション](https://github.com/rollup/plugins/tree/master/packages/alias#entries)として `@rollup/plugin-alias` に渡されます。`{ find, replacement }` ペアの配列か、オブジェクトを指定します。

  ファイルシステムのパスにエイリアスを設定する場合は、必ず絶対パスを使用してください。相対的なエイリアス値はそのまま使用され、ファイルシステムのパスには解決されません。

  より高度なカスタム解決は[プラグイン](/guide/api-plugin)によって実現できます。

### resolve.dedupe

- **型:** `string[]`

  アプリ内で同じ依存関係のコピーが重複している場合（おそらくモノレポのリンクされたパッケージや巻き上げが原因）、このオプションを使用して、リストされた依存関係を（プロジェクトルートから）常に同じコピーに解決するように Vite に強制します。

### resolve.conditions

- **型:** `string[]`

  パッケージからの[条件付きエクスポート](https://nodejs.org/api/packages.html#packages_conditional_exports)解決する際に許可される追加の条件。

  条件付きエクスポートを持つパッケージでは、`package.json` に次の `exports` フィールドが含まれる場合があります:

  ```json
  {
    "exports": {
      ".": {
        "import": "./index.esm.js",
        "require": "./index.cjs.js"
      }
    }
  }
  ```

  ここで、`import` と `require` は「条件」です。条件はネストさせることができ、最も具体的なものから最も具体的でないものまで指定する必要があります。

  Vite には「許可された条件」のリストがあり、許可されたリストにある最初の条件と一致します。 デフォルトで許可される条件は、`import`、`module`、`browser`、`default` と、現在のモードに基づく `production/development` です。`resolve.conditions` 設定オプションを使用すると、追加の許可条件を指定できます。

### resolve.mainFields

- **型:** `string[]`
- **デフォルト:** `['module', 'jsnext:main', 'jsnext']`

  パッケージのエントリーポイントを解決するときに試行する `package.json` のフィールドのリスト。これは `exports` フィールドから解決された条件付きエクスポートよりも優先順位が低いことに注意してください: エントリーポイントが `exports` からの解決に成功した場合、main フィールドは無視されます。

### resolve.extensions

- **型:** `string[]`
- **デフォルト:** `['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']`

  拡張子を省略したインポートに試行するファイル拡張子のリスト。カスタムインポートタイプ（`.vue` など）の拡張子を省略すると、IDE や型のサポートに支障をきたす可能性があるため、推奨され**ません**。

### css.modules

- **型:**

  ```ts
  interface CSSModulesOptions {
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: string[]
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * デフォルト: 'camelCaseOnly'
     */
    localsConvention?: 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly'
  }
  ```

  CSS モジュールの動作を設定します。オプションは [postcss-modules](https://github.com/css-modules/postcss-modules) に渡されます。

### css.postcss

- **型:** `string | (postcss.ProcessOptions & { plugins?: postcss.Plugin[] })`

  インラインの PostCSS 設定（`postcss.config.js` と同じフォーマットを想定）、もしくは PostCSS の設定ファイルを検索するカスタムパス（デフォルトはプロジェクトルート）。検索には [postcss-load-config](https://github.com/postcss/postcss-load-config) が使用されます。

  インライン設定が提供された場合、Vite は他の PostCSS 設定ソースを検索しないことに注意してください。

### css.preprocessorOptions

- **型:** `Record<string, object>`

  CSS プリプロセッサに渡すオプションを指定します。例:

  ```js
  export default {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$injectedColor: orange;`
        }
      }
    }
  }
  ```

### json.namedExports

- **型:** `boolean`
- **デフォルト:** `true`

  `.json` ファイルからの名前付きインポートをサポートするかどうか。

### json.stringify

- **型:** `boolean`
- **デフォルト:** `false`

  `true` に設定すると、インポートされた JSON は `export default JSON.parse("...")` に変換されます。これは特に JSON ファイルが大きい場合、オブジェクトリテラルよりも大幅にパフォーマンスが向上します。

  有効にすると、名前付きインポートは無効になります。 

### esbuild

- **型:** `ESBuildOptions | false`

  `ESBuildOptions` は [ESbuild 自身の変換オプション](https://esbuild.github.io/api/#transform-api)を拡張します。最も一般的な使用例は、JSX のカスタマイズです:

  ```js
  export default {
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  }
  ```

  デフォルトでは ESBuild は `ts`, `jsx`, `tsx` ファイルに適用されます。`esbuild.include` と `esbuild.exclude` でカスタマイズでき、どちらも `string | RegExp | (string | RegExp)[]` の型を想定しています。

  また、`esbuild.jsxInject` を使用すると、ESBuild で変換されたすべてのファイルに対して JSX ヘルパーの import を自動的に注入できます:

  ```js
  export default {
    esbuild: {
      jsxInject: `import React from 'react'`
    }
  }
  ```

  ESbuild の変換を無効にするには `false` を設定します。

### assetsInclude

- **型:** `string | RegExp | (string | RegExp)[]`
- **関連:** [静的アセットの取り扱い](/guide/assets)

  静的アセットとして扱う追加のファイルタイプを指定します。そして:

  - HTML から参照されたり、`fetch` や XHR で直接リクエストされたりすると、プラグインの変換パイプラインから除外されます。

  - JS からインポートすると、解決された URL 文字列が返されます（アセットタイプを別の方法で処理するための `enforce: 'pre'` プラグインがある場合は上書きされます）

  組み込みのアセットタイプのリストは[こちら](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts)をご覧ください。

### logLevel

- **型:** `'info' | 'warn' | 'error' | 'silent'`

  コンソール出力の詳細度を調整します。デフォルトは `'info'` です。

### clearScreen

- **型:** `boolean`
- **デフォルト:** `true`

  Vite が特定のメッセージをログに出力する際、ターミナル画面をクリアしないようにするには `false` に設定します。コマンドラインからは、`--clearScreen false` を使用してください。

### envDir

- **型:** `string`
- **デフォルト:** `root`

  `.env` ファイルを読み込むディレクトリ。絶対パス、もしくはプロジェクトルートからの相対パスを指定します。

  環境ファイルの詳細については[こちら](/guide/env-and-mode#env-files)をご覧ください。

## サーバーオプション

### server.host

- **型:** `string`
- **デフォルト:** `'127.0.0.1'`

  サーバーがリッスンすべき IP アドレスを指定します。
  `0.0.0.0` に設定すると、LAN やパブリックアドレスを含むすべてのアドレスをリッスンします。

  これは CLI で `--host 0.0.0.0` や `--host` を使用して設定できます。

### server.port

- **型:** `number`

  サーバーポートを指定します。このポートがすでに使用されている場合、Vite は次に使用可能なポートを自動的に試すので、サーバーが最終的にリッスンする実際のポートとは異なる場合があることに注意してください。

### server.strictPort

- **型:** `boolean`

  `true` に設定すると、ポートがすでに使用されている場合に、次に使用可能なポートを自動的に試すことなく終了します。

### server.https

- **型:** `boolean | https.ServerOptions`

  TLS + HTTP/2 を有効にします。[`server.proxy` オプション](#server-proxy)も使用されている場合にのみ TLS にダウングレードされるので注意してください。

  この値は `https.createServer()` に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でも構いません。

### server.open

- **型:** `boolean | string`

  サーバー起動時に自動的にブラウザでアプリを開きます。値が文字列の場合、URL のパス名として使用されます。

  **例:**

  ```js
  export default {
    server: {
      open: '/docs/index.html'
    }
  }
  ```

### server.proxy

- **型:** `Record<string, string | ProxyOptions>`

  開発サーバーのカスタムプロキシのルールを設定します。`{ key: options }` のペアのオブジェクトが必要です。キーが `^` で始まる場合は `RegExp` として解釈されます。プロキシのインスタンスにアクセスするには `configure` オプションを使用します。

  [`http-proxy`](https://github.com/http-party/node-http-proxy) を使用します。全オプションは[こちら](https://github.com/http-party/node-http-proxy#options)。

  **例:**

  ```js
  export default {
    server: {
      proxy: {
        // 文字列のショートハンド
        '/foo': 'http://localhost:4567/foo',
        // オプションを使用
        '/api': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // 正規表現を使用
        '^/fallback/.*': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fallback/, '')
        },
        // プロキシインスタンスを使用
        '/api': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          configure: (proxy, options) => {
            // プロキシは 'http-proxy' のインスタンスになります
          }),
        }
      }
    }
  }
  ```

### server.cors

- **型:** `boolean | CorsOptions`

  開発サーバーの CORS を設定します。これはデフォルトで有効になっており、どんなオリジンも許可します。[オプションオブジェクト](https://github.com/expressjs/cors)を渡して微調整するか、`false` で無効にします。

### server.force

- **Type:** `boolean`
- **Related:** [Dependency Pre-Bundling](/guide/dep-pre-bundling)

  Set to `true` to force dependency pre-bundling.

### server.hmr

- **Type:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

  Disable or configure HMR connection (in cases where the HMR websocket must use a different address from the http server).

  Set `server.hmr.overlay` to `false` to disable the server error overlay.

  `clientPort` is an advanced option that overrides the port only on the client side, allowing you to serve the websocket on a different port than the client code looks for it on. Useful if you're using an SSL proxy in front of your dev server.

  When using `server.middlewareMode` and `server.https`, setting `server.hmr.server` to your HTTPS server will process HMR secure connection requests through your server. This can be helpful when using self-signed certificates.


### server.watch

- **Type:** `object`

  File system watcher options to pass on to [chokidar](https://github.com/paulmillr/chokidar#api).

### server.middlewareMode

- **Type:** `'ssr' | 'html'`

  Create Vite server in middleware mode. (without a HTTP server)

  - `'ssr'` will disable Vite's own HTML serving logic so that you should serve `index.html` manually.
  - `'html'` will enable Vite's own HTML serving logic.

- **Related:** [SSR - Setting Up the Dev Server](/guide/ssr#setting-up-the-dev-server)

- **Example:**
```js
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // Create vite server in middleware mode.
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  // Use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // If `middlewareMode` is `'ssr'`, should serve `index.html` here.
    // If `middlewareMode` is `'html'`, there is no need to serve `index.html`
    // because Vite will do that.
  })
}

createServer()
```

### server.fsServe.strict

- **Experimental**
- **Type:** `boolean`
- **Default:** `false` (will change to `true` in future versions)

  Restrict serving files outside of workspace root.

### server.fsServe.root

- **Experimental**
- **Type:** `string`

  Restrict files that could be served via `/@fs/`. When `server.fsServe.strict` is set to `true`, accessing files outside this directory will result in a 403.

  Vite will search for the root of the potential workspace and use it as default. A valid workspace met the following conditions, otherwise will fallback to the [project root](/guide/#index-html-and-project-root).

  - contains `workspaces` field in `package.json`
  - contains one of the following file
    - `pnpm-workspace.yaml`

  Accepts a path to specify the custom workspace root. Could be a absolute path or a path relative to [project root](/guide/#index-html-and-project-root). For example

  ```js
  export default {
    server: {
      fsServe: {
        // Allow serving files from one level up to the project root
        root: '..'
      }
    }
  }
  ```

## Build Options

### build.target

- **Type:** `string`
- **Default:** `'modules'`
- **Related:** [Browser Compatibility](/guide/build#browser-compatibility)

  Browser compatibility target for the final bundle. The default value is a Vite special value, `'modules'`, which targets [browsers with native ES module support](https://caniuse.com/es6-module).

  Another special value is 'esnext' - which only performs minimal transpiling (for minification compat) and assumes native dynamic imports support.

  The transform is performed with esbuild and the value should be a valid [esbuild target option](https://esbuild.github.io/api/#target). Custom targets can either be a ES version (e.g. `es2015`), a browser with version (e.g. `chrome58`), or an array of multiple target strings.

  Note the build will fail if the code contains features that cannot be safely transpiled by esbuild. See [esbuild docs](https://esbuild.github.io/content-types/#javascript) for more details.

### build.polyfillDynamicImport

- **Type:** `boolean`
- **Default:** `false`

  Whether to automatically inject [dynamic import polyfill](https://github.com/GoogleChromeLabs/dynamic-import-polyfill).

  If set to true, the polyfill is auto injected into the proxy module of each `index.html` entry. If the build is configured to use a non-html custom entry via `build.rollupOptions.input`, then it is necessary to manually import the polyfill in your custom entry:

  ```js
  import 'vite/dynamic-import-polyfill'
  ```

  When using [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), the plugin sets this option to `true` automatically.

  Note: the polyfill does **not** apply to [Library Mode](/guide/build#library-mode). If you need to support browsers without native dynamic import, you should probably avoid using it in your library.

### build.outDir

- **Type:** `string`
- **Default:** `dist`

  Specify the output directory (relative to [project root](/guide/#index-html-and-project-root)).

### build.assetsDir

- **Type:** `string`
- **Default:** `assets`

  Specify the directory to nest generated assets under (relative to `build.outDir`).

### build.assetsInlineLimit

- **Type:** `number`
- **Default:** `4096` (4kb)

  Imported or referenced assets that are smaller than this threshold will be inlined as base64 URLs to avoid extra http requests. Set to `0` to disable inlining altogether.

  ::: tip Note
  If you specify `build.lib`, `build.assetsInlineLimit` will be ignored and assets will always be inlined, regardless of file size.
  :::

### build.cssCodeSplit

- **Type:** `boolean`
- **Default:** `true`

  Enable/disable CSS code splitting. When enabled, CSS imported in async chunks will be inlined into the async chunk itself and inserted when the chunk is loaded.

  If disabled, all CSS in the entire project will be extracted into a single CSS file.

### build.sourcemap

- **Type:** `boolean | 'inline' | 'hidden'`
- **Default:** `false`

  Generate production source maps.

### build.rollupOptions

- **Type:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

  Directly customize the underlying Rollup bundle. This is the same as options that can be exported from a Rollup config file and will be merged with Vite's internal Rollup options. See [Rollup options docs](https://rollupjs.org/guide/en/#big-list-of-options) for more details.

### build.commonjsOptions

- **Type:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

  Options to pass on to [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs).

### build.lib

- **Type:** `{ entry: string, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string }`
- **Related:** [Library Mode](/guide/build#library-mode)

  Build as a library. `entry` is required since the library cannot use HTML as entry. `name` is the exposed global variable and is required when `formats` includes `'umd'` or `'iife'`. Default `formats` are `['es', 'umd']`. `fileName` is the name of the package file output, default `fileName` is the name option of package.json

### build.manifest

- **Type:** `boolean`
- **Default:** `false`
- **Related:** [Backend Integration](/guide/backend-integration)

  When set to `true`, the build will also generate a `manifest.json` file that contains mapping of non-hashed asset filenames to their hashed versions, which can then be used by a server framework to render the correct asset links.

### build.minify

- **Type:** `boolean | 'terser' | 'esbuild'`
- **Default:** `'terser'`

  Set to `false` to disable minification, or specify the minifier to use. The default is [Terser](https://github.com/terser/terser) which is slower but produces smaller bundles in most cases. Esbuild minification is significantly faster, but will result in slightly larger bundles.

### build.terserOptions

- **Type:** `TerserOptions`

  Additional [minify options](https://terser.org/docs/api-reference#minify-options) to pass on to Terser.

### build.cleanCssOptions

- **Type:** `CleanCSS.Options`

  Constructor options to pass on to [clean-css](https://github.com/jakubpawlowicz/clean-css#constructor-options).

### build.write

- **Type:** `boolean`
- **Default:** `true`

  Set to `false` to disable writing the bundle to disk. This is mostly used in [programmatic `build()` calls](/guide/api-javascript#build) where further post processing of the bundle is needed before writing to disk.

### build.emptyOutDir

- **Type:** `boolean`
- **Default:** `true` if `outDir` is inside `root`

  By default, Vite will empty the `outDir` on build if it is inside project root. It will emit a warning if `outDir` is outside of root to avoid accidentially removing important files. You can explicitly set this option to suppress the warning. This is also available via command line as `--emptyOutDir`.

### build.brotliSize

- **Type:** `boolean`
- **Default:** `true`

  Enable/disable brotli-compressed size reporting. Compressing large output files can be slow, so disabling this may increase build performance for large projects.

### build.chunkSizeWarningLimit

- **Type:** `number`
- **Default:** `500`

  Limit for chunk size warnings (in kbs).

### build.watch

- **Type:** [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options)`| null`
- **Default:** `null`

  Set to `{}` to enable rollup watcher. This is mostly used in cases that involve build-only plugins or integrations processes.

## 依存関係の最適化オプション

- **関連:** [依存関係の事前バンドル](/guide/dep-pre-bundling)

### optimizeDeps.entries

- **型:** `string | string[]`

  デフォルトでは、Vite は index.html をクロールして、事前にバンドルする必要のある依存関係を検出します。build.rollupOptions.input が指定されている場合、Vite は代わりにそれらのエントリーポイントをクロールします。

  これらのいずれもニーズに合わない場合、このオプションを使ってカスタムエントリーを指定することができます。値は Vite プロジェクトルートからの相対的な [fast-glob パターン](https://github.com/mrmlnc/fast-glob#basic-syntax) か、パターンの配列でなければいけません。これによりデフォルトのエントリーの推論が上書きされます。

### optimizeDeps.exclude

- **型:** `string[]`

  事前バンドルから除外する依存関係。

### optimizeDeps.include

- **型:** `string[]`

  デフォルトでは、リンクされたパッケージのうち `node_modules` の外にあるものは事前バンドルされません。このオプションを使用してリンクされたパッケージを強制的に事前バンドルします。

### optimizeDeps.keepNames

- **型:** `boolean`
- **デフォルト:** `false`

  バンドラーは、衝突を避けるためにシンボルの名前を変更する必要がある場合があります。
  これを `true` に設定すると、関数やクラスの `name` プロパティが維持されます。
  [`keepNames`](https://esbuild.github.io/api/#keep-names) を参照してください。

## SSR オプション

:::warning 実験的な機能
SSR オプションは、マイナーリリースで調整される可能性があります。
:::

- **Related:** [外部 SSR](/guide/ssr#ssr-externals)

### ssr.external

- **型:** `string[]`

  SSR の依存関係を強制的に外部化します。

### ssr.noExternal

- **型:** `string[]`

  指定した依存関係が SSR のために外部化されるのを防ぎます。

### ssr.target

- **型:** `'node' | 'webworker'`
- **デフォルト:** `node`

  SSR サーバーのビルドターゲット。
