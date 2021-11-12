# Vite の設定

## 設定ファイル

### 設定ファイルの解決

コマンドラインから `vite` を実行すると、Vite は[プロジェクトルート](/guide/#index-html-とプロジェクトルート)内の `vite.config.js` という名前の設定ファイルを自動的に解決しようとします。

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

あるいは、jsdoc のアノテーションがなくても入力補完を提供する `defineConfig` ヘルパを使用することもできます:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite は TS の設定ファイルも直接サポートしています。`vite.config.ts` を `defineConfig` ヘルパと一緒に使うこともできます。

### 条件付き設定

コマンド（`serve` か `build`）や使用されている[モード](/guide/env-and-mode)に基づいて条件付きで設定のオプションを決定する必要がある場合は、代わりに関数をエクスポートできます:

```js
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // serve 固有の設定
    }
  } else {
    return {
      // build 固有の設定
    }
  }
})
```

### 非同期の設定

設定で非同期の関数を呼び出す必要がある場合は、代わりに async 関数をエクスポートできます:

```js
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // build 固有の設定
  }
})
```

## 共通オプション

### root

- **型:** `string`
- **デフォルト:** `process.cwd()`

  プロジェクトのルートディレクトリ（`index.html` が置かれている場所）。絶対パス、または設定ファイル自体の場所からの相対パスを指定できます。

  詳細は [プロジェクトルート](/guide/#index-html-とプロジェクトルート) を参照してください。

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

  グローバル定数の置換を定義します。エントリは開発時にグローバルで定義され、ビルド時に静的に置き換えられます。

  - `2.0.0-beta.70` 以降、文字列の値は純粋な式として評価されるので、文字列の定数を定義する場合は、明示的に引用符で囲う必要があります（例 `JSON.stringify` を使う）。

  - マッチした部分が単語の境界（`\b`）で囲まれている場合のみ置換されます。

  構文解析なしの単純なテキスト置換として実装されているため、`define` は「定数」にのみ使用することをおすすめします。

  例えば、`process.env.FOO` や `__APP_VERSION__` などが適しています。しかし、`process` や `global` はこのオプションに入れるべきではありません。変数は代わりに Shim や Polyfill で使用できます。

### plugins

- **型:** ` (Plugin | Plugin[])[]`

  使用するプラグインの配列。falsy なプラグインは無視され、プラグインの配列はフラット化されます。 Vite プラグインの詳細は [プラグイン API](/guide/api-plugin) を参照してください。

### publicDir

- **型:** `string | false`
- **デフォルト:** `"public"`

  加工せずに静的アセットとして配信するディレクトリ。このディレクトリのファイルは、開発時には `/` として配信され、ビルド時には `outDir` のルートにコピーされます。常に変換されることなくそのまま配信またはコピーされます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。

  `publicDir` を `false` に設定すると、この機能は無効になります。

  詳細は [`public` ディレクトリ](/guide/assets#public-ディレクトリ) を参照してください。

### cacheDir

- **型:** `string`
- **デフォルト:** `"node_modules/.vite"`

  キャッシュファイルを保存するディレクトリ。このディレクトリのファイルは、事前バンドルされた依存関係や Vite によって生成されたキャッシュファイルで、パフォーマンスを向上させることができます。`--force` フラグを使用したり、手動でディレクトリを削除するとキャッシュファイルを再生成できます。この値にはファイルシステムの絶対パスかプロジェクトルートからの相対パスを指定できます。

### resolve.alias

- **型:**
  `Record<string, string> | Array<{ find: string | RegExp, replacement: string }>`

  [エントリオプション](https://github.com/rollup/plugins/tree/master/packages/alias#entries)として `@rollup/plugin-alias` に渡されます。`{ find, replacement }` ペアの配列か、オブジェクトを指定します。

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

  パッケージのエントリポイントを解決するときに試行する `package.json` のフィールドのリスト。これは `exports` フィールドから解決された条件付きエクスポートよりも優先順位が低いことに注意してください: エントリポイントが `exports` からの解決に成功した場合、main フィールドは無視されます。

### resolve.extensions

- **型:** `string[]`
- **デフォルト:** `['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']`

  拡張子を省略したインポートに試行するファイル拡張子のリスト。カスタムインポートタイプ（`.vue` など）の拡張子を省略すると、IDE や型のサポートに支障をきたす可能性があるため、推奨され**ません**。

### resolve.preserveSymlinks

- **型:** `boolean`
- **デフォルト:** `false`

  この設定を有効にすると、Vite は実際のファイルパス（つまりシンボリックリンクを辿った後のパス）ではなく、オリジナルのファイルパス（つまりシンボリックリンクを辿っていないパス）でファイルの同一性を判別します。

- **関連:** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks), [webpack#resolve.symlinks
  ](https://webpack.js.org/configuration/resolve/#resolvesymlinks)

### css.modules

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
  export default defineConfig({
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$injectedColor: orange;`
        }
      }
    }
  })
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
  export default defineConfig({
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  })
  ```

  デフォルトでは ESBuild は `ts`, `jsx`, `tsx` ファイルに適用されます。`esbuild.include` と `esbuild.exclude` でカスタマイズでき、どちらも `string | RegExp | (string | RegExp)[]` の型を想定しています。

  また、`esbuild.jsxInject` を使用すると、ESBuild で変換されたすべてのファイルに対して JSX ヘルパの import を自動的に注入できます:

  ```js
  export default defineConfig({
    esbuild: {
      jsxInject: `import React from 'react'`
    }
  })
  ```

  ESbuild の変換を無効にするには `false` を設定します。

### assetsInclude

- **型:** `string | RegExp | (string | RegExp)[]`
- **関連:** [静的アセットの取り扱い](/guide/assets)

  静的アセットとして扱う追加の [picomatch パターン](https://github.com/micromatch/picomatch)を指定します。そして:

  - HTML から参照されたり、`fetch` や XHR で直接リクエストされたりすると、プラグインの変換パイプラインから除外されます。

  - JS からインポートすると、解決された URL 文字列が返されます（アセットタイプを別の方法で処理するための `enforce: 'pre'` プラグインがある場合は上書きされます）

  組み込みのアセットタイプのリストは[こちら](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts)をご覧ください。

  **例:**

  ```js
  export default defineConfig({
    assetsInclude: ['**/*.gltf']
  })
  ```

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

### envPrefix

- **型:** `string | string[]`
- **デフォルト:** `VITE_`

  `envPrefix` で始まる環境変数は、import.meta.env でクライアントのソースコードに公開されます。

:::warning SECURITY NOTES

- `envPrefix` に `''` を設定してはいけません。全ての env 変数を公開してしまい、予期せぬ機密情報の漏洩を引き起こします。Vite は `''` を検出するとエラーをスローします。
  :::

## サーバオプション

### server.host

- **型:** `string`
- **デフォルト:** `'127.0.0.1'`

  サーバがリッスンすべき IP アドレスを指定します。
  `0.0.0.0` に設定すると、LAN やパブリックアドレスを含むすべてのアドレスをリッスンします。

  これは CLI で `--host 0.0.0.0` や `--host` を使用して設定できます。

### server.port

- **型:** `number`

  サーバのポートを指定します。このポートがすでに使用されている場合、Vite は次に使用可能なポートを自動的に試すので、サーバが最終的にリッスンする実際のポートとは異なる場合があることに注意してください。

### server.strictPort

- **型:** `boolean`

  `true` に設定すると、ポートがすでに使用されている場合に、次に使用可能なポートを自動的に試すことなく終了します。

### server.https

- **型:** `boolean | https.ServerOptions`

  TLS + HTTP/2 を有効にします。[`server.proxy` オプション](#server-proxy)も使用されている場合にのみ TLS にダウングレードされるので注意してください。

  この値は `https.createServer()` に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でも構いません。

### server.open

- **型:** `boolean | string`

  サーバ起動時に自動的にブラウザでアプリを開きます。値が文字列の場合、URL のパス名として使用されます。もしあなたの好きなブラウザでアプリを開きたい場合、環境変数 `process.env.BROWSER`（例: `firefox`）を定義できます。詳細は [`open` パッケージ](https://github.com/sindresorhus/open#app) をご覧ください。

  **例:**

  ```js
  export default defineConfig({
    server: {
      open: '/docs/index.html'
    }
  })
  ```

### server.proxy

- **型:** `Record<string, string | ProxyOptions>`

  開発サーバのカスタムプロキシのルールを設定します。`{ key: options }` のペアのオブジェクトが必要です。キーが `^` で始まる場合は `RegExp` として解釈されます。プロキシのインスタンスにアクセスするには `configure` オプションを使用します。

  [`http-proxy`](https://github.com/http-party/node-http-proxy) を使用します。全オプションは[こちら](https://github.com/http-party/node-http-proxy#options)。

  **例:**

  ```js
  export default defineConfig({
    server: {
      proxy: {
        // 文字列のショートハンド
        '/foo': 'http://localhost:4567',
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
          },
        }
      }
    }
  })
  ```

### server.cors

- **型:** `boolean | CorsOptions`

  開発サーバの CORS を設定します。これはデフォルトで有効になっており、どんなオリジンも許可します。[オプションオブジェクト](https://github.com/expressjs/cors)を渡して微調整するか、`false` で無効にします。

### server.force

- **型:** `boolean`
- **関連:** [依存関係の事前バンドル](/guide/dep-pre-bundling)

  依存関係の事前バンドルを強制するには、`true` に設定します。

### server.hmr

- **型:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

  HMR 接続の無効化または設定（HMR WebSocket が http サーバと異なるアドレスを使用する必要がある場合）。

  `server.hmr.overlay` を `false` に設定すると、サーバエラーのオーバレイが無効になります。

  `clientPort` は、クライアント側のポートのみを上書きする高度なオプションで、クライアントコードが探すポートとは異なるポートで WebSocket を配信できます。開発サーバの前で SSL プロキシを使用している場合に便利です。

  `server.middlewareMode` または `server.https` を使用している場合、`server.hmr.server` を HTTP(S) サーバに割り当てると、HMR のセキュアな接続要求がサーバ経由で処理されます。これは、自己署名証明書を使用する場合や、Vite を単一ポートでネットワーク上に公開したい場合に役立ちます。

### server.watch

- **型:** `object`

  [chokidar](https://github.com/paulmillr/chokidar#api) に渡すファイルシステムウォッチャのオプションです。

  Windows Subsystem for Linux (WSL) 2 上で Vite を実行している時に、プロジェクトフォルダが Windows ファイルシステム内にある場合は、このオプションを `{ usePolling: true }` に設定する必要があります。これは、Windows ファイルシステムにおける [WSL2 の制限](https://github.com/microsoft/WSL/issues/4739)によるものです。

  Vite サーバのウォッチャは、デフォルトでは `.git/` と `node_modules/` ディレクトリをスキップします。もし `node_modules/` 内のパッケージを監視したい場合は、`server.watch.regard` に否定の glob パターンを渡すことができます。つまり:

  ```js
  export default defineConfig({
    server: {
      watch: {
        ignored: ['!**/node_modules/your-package-name/**']
      }
    },
    // 監視するパッケージは、最適化から除外する必要があります。
    // これにより、依存関係グラフに現れ、ホットリロードをトリガーできるようになります。
    optimizeDeps: {
      exclude: ['your-package-name']
    }
  })
  ```

### server.middlewareMode

- **型:** `'ssr' | 'html'`

  ミドルウェアモードで Vite サーバを作成します（HTTP サーバなし）。

  - `'ssr'` は Vite 自体の HTML 配信ロジックを無効にするため、`index.html` を手動で配信する必要があります。
  - `'html'` は Vite 自体の HTML 配信ロジックを有効にします。

- **関連:** [SSR - 開発サーバのセットアップ](/guide/ssr#開発サーバのセットアップ)

- **例:**

```js
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // ミドルウェアモードで Vite サーバを作成します。
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  // vite の接続インスタンスをミドルウェアとして使用
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // `middlewareMode` が `'ssr'` の場合、ここで `index.html` を配信する必要があります。
    // `middlewareMode` が `'html'` の場合、Vite が配信するので
    // `index.html` を配信する必要はありません。
  })
}

createServer()
```

### server.fs.strict

- **実験的機能**
- **型:** `boolean`
- **デフォルト:** `false`（将来のバージョンでは `true` に変更されます）

  ワークスペースのルート以外のファイルの配信を制限します。

### server.fs.allow

- **実験的機能**
- **型:** `string[]`

  `/@fs/` 経由で配信可能なファイルを制限します。`server.fs.strict` が `true` に設定されている場合、このディレクトリリストの外にあるファイルにアクセスすると、403 が返されます。

  Vite は、潜在的なワークスペースのルートを検索し、それをデフォルトとして使用します。有効なワークスペースは以下の条件を満たすもので、そうでない場合は[プロジェクトのルート](/guide/#index-html-とプロジェクトルート)にフォールバックします。

  - `package.json` に `workspaces` フィールドが含まれている
  - 以下のファイルのいずれかを含んでいる
    - `pnpm-workspace.yaml`

  カスタムワークスペースのルートを指定するパスを受け取ります。絶対パスか、[プロジェクトのルート](/guide/#index-html-とプロジェクトルート)からの相対パスを指定します。例えば:

  ```js
  export default defineConfig({
    server: {
      fs: {
        // プロジェクトルートの 1 つ上の階層からファイルを配信できるようにする
        allow: ['..']
      }
    }
  })
  ```

  `server.fs.allow` を指定すると、ワークスペースルートの自動検出が無効になります。本来の動作を拡張するために、ユーティリティーの `searchForWorkspaceRoot` が公開されています:

  ```js
  import { defineConfig, searchForWorkspaceRoot } from 'vite'

  export default defineConfig({
    server: {
      fs: {
        allow: [
          // ワークスペースルートの検索
          searchForWorkspaceRoot(process.cwd()),
          // あなたのカスタムルール
          '/path/to/custom/allow'
        ]
      }
    }
  })
  ```

### server.origin

- **型:** `string`

開発時に生成されるアセット URL のオリジンを定義します。

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080/'
  }
})
```

## ビルドオプション

### build.target

- **型:** `string | string[]`
- **デフォルト:** `'modules'`
- **関連:** [ブラウザの互換性](/guide/build#ブラウザの互換性)

  最終的なバンドルのブラウザ互換性のターゲット。デフォルトは Vite の特別な値 `'modules'` で、これは[ネイティブの ES モジュールをサポートするブラウザ](https://caniuse.com/es6-module)を対象にします。

  もうひとつの特別な値は `'esnext'` で、これはネイディブの動的インポートをサポートしていることを前提としており、トランスパイルが可能な限り少なくなります:

  - [`build.minify`](#build-minify) が `'terser'` の場合、`'esnext'` は強制的に `'es2019'` に下げられます。
  - それ以外の場合、トランスパイルはまったく行なわれません。

  変換は esbuild で実行され、この値は有効な [esbuild の target オプション](https://esbuild.github.io/api/#target)でなければいけません。カスタムターゲットは ES のバージョン（例: `es2015`）、バージョン付きのブラウザ（例: `chrome58`）、または複数のターゲットの文字列の配列を指定できます。

  esbuild で安全にトランスパイルできない機能がコードに含まれていると、ビルドが失敗するので注意してください。詳細は [esbuild のドキュメント](https://esbuild.github.io/content-types/#javascript)を参照してください。

### build.polyfillModulePreload

- **型:** `boolean`
- **デフォルト:** `true`

  自動的に [module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) を注入するかどうか。

  `true` に設定すると、Polyfill は各 `index.html` エントリのプロキシモジュールに自動注入されます。ビルドが `build.rollupOptions.input` を通して非 HTML のカスタムエントリを使用するように設定されている場合は、カスタムエントリで Polyfill を手動でインポートする必要があります:

  ```js
  import 'vite/modulepreload-polyfill'
  ```

  注意: この Polyfill は[ライブラリモード](/guide/build#ライブラリモード)には **適用されません** 。ネイティブの動的インポートを持たないブラウザをサポートする必要がある場合は、ライブラリでの使用は避けた方が良いでしょう。
  
### build.outDir

- **型:** `string`
- **デフォルト:** `dist`

  出力ディレクトリを指定します（[プロジェクトルート](/guide/#index-html-とプロジェクトルート)からの相対パス）。

### build.assetsDir

- **型:** `string`
- **デフォルト:** `assets`

  生成されたアセットをネストするディレクトリを指定します（`build.outDir` からの相対パス）。

### build.assetsInlineLimit

- **型:** `number`
- **デフォルト:** `4096` (4kb)

  インポートもしくは参照されたアセットでこの閾値より小さいものは、余計な HTTP リクエストを避けるために base64 URL としてインライン化されます。`0` に設定するとインライン化は完全に無効になります。

  ::: tip 注意
  `build.lib` を指定すると `build.assetsInlineLimit` は無視され、ファイルサイズに関係なく、アセットは常にインライン化されます。
  :::

### build.cssCodeSplit

- **型:** `boolean`
- **デフォルト:** `true`

  CSS コード分割を有効/無効にします。有効にすると、非同期のチャンクでインポートされた CSS は非同期チャンク自体の中にインライン化され、チャンクがロードされるときに挿入されます。

  無効にした場合、プロジェクト全体のすべての CSS はひとつの CSS ファイルに抽出されます。

### build.cssTarget

- **型:** `string | string[]`
- **デフォルト:** [`build.target`](/config/#build-target) と同じ

  このオプションを使用すると、CSS ミニファイのブラウザターゲットを、JavaScript の変換に使用されるものと違う設定にできます。

  これは主流でないブラウザをターゲットにしている場合にのみ使用してください。
  例えば Android の WeChat WebView は、ほとんどのモダンな JavaScript の機能をサポートしていますが、[CSS の `#RGBA` 16 進表記](https://developer.mozilla.org/ja/docs/Web/CSS/color_value#rgb_色)はサポートしていません。
  この場合、Vite が `rgba()` の色を `#RGBA` の 16 進表記に変換するのを防ぐために、`build.cssTarget` を `chrome61` に設定する必要があります。

### build.sourcemap

- **型:** `boolean | 'inline' | 'hidden'`
- **デフォルト:** `false`

  本番用のソースマップを作成します。`true` の場合、ソースマップファイルは別に作られます。`inline` の場合、ソースマップは出力結果ファイルにデータ URI として追加されます。`hidden` は `true` と同様に動作しますが、バンドルファイル内のソースマップを指し示すコメントは削除されます。

### build.rollupOptions

- **型:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

  基礎となる Rollup バンドルを直接カスタマイズします。これは、Rollup 設定ファイルからエクスポートされるオプションと同じで、Vite 内部の Rollup オプションにマージされます。詳細は [Rollup options docs](https://rollupjs.org/guide/en/#big-list-of-options) を参照してください。

### build.commonjsOptions

- **型:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

  [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) に渡すオプションです。

### build.dynamicImportVarsOptions

- **型:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)

  [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) に渡すオプションです。

### build.lib

- **型:** `{ entry: string, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat) => string) }`
- **関連:** [ライブラリモード](/guide/build#ライブラリモード)

  ライブラリとしてビルドします。ライブラリではエントリとして HTML を使用できないため、`entry` が必要です。`name` は公開されているグローバル変数で、`formats` に `'umd'` や `'iife'` が含まれている場合に必要です。デフォルトの `formats` は `['es', 'umd']` です。`fileName` は出力されるパッケージファイルの名前です。デフォルトの `fileName` は package.json の name オプションですが、`format` を引数にとる関数として定義することもできます。

### build.manifest

- **型:** `boolean`
- **デフォルト:** `false`
- **関連:** [バックエンドとの統合](/guide/backend-integration)

  `true` に設定すると、ビルドはハッシュ化されていないアセットファイル名とハッシュ化されたバージョンのマッピングを含む `manifest.json` ファイルを生成するようになり、サーバフレームワークがこれを使用して正しいアセットリンクをレンダリングできるようになります。

### build.ssrManifest

- **型:** `boolean`
- **デフォルト:** `false`
- **関連:** [サーバサイドレンダリング](/guide/ssr)

  `true` に設定すると、本番環境でのスタイルリンクやアセットプリロードディレクティブを決定するための SSR マニフェストもビルドで生成されます。

### build.ssr

- **型:** `boolean | string`
- **デフォルト:** `undefined`
- **関連:** [サーバサイドレンダリング](/guide/ssr)

  SSR 指向のビルドを生成します。この値は、SSR エントリを直接指定する文字列か、`true` にして `rollupOptions.input` で SSR エントリを指定する必要があります。

### build.minify

- **型:** `boolean | 'terser' | 'esbuild'`
- **デフォルト:** `'esbuild'`

  ミニファイを無効にするには `false` を設定するか、使用するミニファイツールを指定します。デフォルトは [Esbuild](https://github.com/evanw/esbuild) で、これは terser に比べて 20～40 倍速く、圧縮率は 1～2％だけ低下します。[ベンチマーク](https://github.com/privatenumber/minification-benchmarks)

### build.terserOptions

- **型:** `TerserOptions`

  Terser に渡す追加の[ミニファイオプション](https://terser.org/docs/api-reference#minify-options)です。

### build.write

- **型:** `boolean`
- **デフォルト:** `true`

  バンドルのディスクへの書き込みを無効にするには、`false` を設定します。これは、主に[プログラムによる `build()` 呼び出し](/guide/api-javascript#build)で使用され、ディスクに書き込む前にバンドルの後処理が必要な場合に使用されます。

### build.emptyOutDir

- **型:** `boolean`
- **デフォルト:** `outDir` が `root` 内にあると `true`

  デフォルトでは、Vite はビルド時に `outDir` がプロジェクトルート内にある場合、それを空にします。重要なファイルを誤って削除してしまわないように、`outDir` がルートの外にある場合は警告を発します。このオプションを明示的に設定することで、警告を出さないようにできます。このオプションは、コマンドラインで `--emptyOutDir` としても利用できます。

### build.brotliSize

- **型:** `boolean`
- **デフォルト:** `true`

  brotli で圧縮されたサイズレポートを有効/無効にします。大きな出力ファイルの圧縮には時間がかかるため、これを無効にすると、大規模なプロジェクトでのビルドのパフォーマンスが向上する可能性があります。

### build.chunkSizeWarningLimit

- **型:** `number`
- **デフォルト:** `500`

  チャンクサイズ警告の制限値（kb 単位）。

### build.watch

- **型:** [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options)`| null`
- **デフォルト:** `null`

  Rollup ウォッチャを有効にするには、`{}` に設定します。これは主に、ビルドのみのプラグインや統合プロセスを伴うケースで使用されます。

## 依存関係の最適化オプション

- **関連:** [依存関係の事前バンドル](/guide/dep-pre-bundling)

### optimizeDeps.entries

- **型:** `string | string[]`

  デフォルトでは、Vite は index.html をクロールして、事前にバンドルする必要のある依存関係を検出します。build.rollupOptions.input が指定されている場合、Vite は代わりにそれらのエントリポイントをクロールします。

  これらのいずれもニーズに合わない場合、このオプションを使ってカスタムエントリを指定することができます。値は Vite プロジェクトルートからの相対的な [fast-glob パターン](https://github.com/mrmlnc/fast-glob#basic-syntax) か、パターンの配列でなければいけません。これによりデフォルトのエントリの推論が上書きされます。

### optimizeDeps.exclude

- **型:** `string[]`

  事前バンドルから除外する依存関係。

  :::warning CommonJS
  CommonJS の依存関係を最適化から除外してはいけません。ESM の依存関係が最適化から除外されているが、ネストされた CommonJS の依存関係がある場合は、CommonJS の依存関係を `optimizeDeps.include` に追加する必要があります。例:

  ```js
  export default defineConfig({
    optimizeDeps: {
      include: ['esm-dep > cjs-dep']
    }
  })
  ```

  :::

### optimizeDeps.include

- **型:** `string[]`

  デフォルトでは、リンクされたパッケージのうち `node_modules` の外にあるものは事前バンドルされません。このオプションを使用してリンクされたパッケージを強制的に事前バンドルします。

### optimizeDeps.keepNames

- **型:** `boolean`
- **デフォルト:** `false`

  バンドラは、衝突を避けるためにシンボルの名前を変更する必要がある場合があります。
  これを `true` に設定すると、関数やクラスの `name` プロパティが維持されます。
  [`keepNames`](https://esbuild.github.io/api/#keep-names) を参照してください。

## SSR オプション

:::warning 実験的な機能
SSR オプションは、マイナリリースで調整される可能性があります。
:::

- **関連:** [外部 SSR](/guide/ssr#外部-ssr)

### ssr.external

- **型:** `string[]`

  SSR の依存関係を強制的に外部化します。

### ssr.noExternal

- **型:** `string | RegExp | (string | RegExp)[] | true`

  指定した依存関係が SSR のために外部化されるのを防ぎます。`true` の場合、どの依存関係も外部化されません。

### ssr.target

- **型:** `'node' | 'webworker'`
- **デフォルト:** `node`

  SSR サーバのビルドターゲット。
