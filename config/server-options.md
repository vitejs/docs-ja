# サーバーオプション

特に記載がない限り、このセクションのオプションは開発にのみ適用されます。

## server.host

- **型:** `string | boolean`
- **デフォルト:** `'localhost'`

サーバーがリッスンすべき IP アドレスを指定します。
`0.0.0.0` もしくは `true` に設定すると、LAN やパブリックアドレスを含むすべてのアドレスをリッスンします。

これは CLI で `--host 0.0.0.0` や `--host` を使用して設定できます。

::: tip 注意

Vite ではなく他のサーバーがレスポンスを返す場合があります。

1 つ目の場合は `localhost` が利用されたときです。Node.js v17 未満はデフォルトでは DNS によって解決された結果のアドレスを並び替えます。`localhost` へアクセスするとき、ブラウザーは DNS を利用してアドレスを解決し、そのアドレスは Vite がリッスンしているアドレスと異なる場合があります。アドレスが異なっている場合は Vite は解決したアドレスを表示します。

[`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) を設定することで、この並び替える動作を無効化できます。そうすると、Vite はアドレスを `localhost` と出力します。

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'note:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // 省略
})
```

2 つ目の場合はワイルドカードホスト（例: `0.0.0.0`）が利用されたときです。これは、ワイルドカードでないホストにリッスンしているサーバーが、ワイルドカードをリッスンしているサーバーよりも優先されるためです。

:::

::: tip LAN から WSL2 上のサーバーにアクセスする

WSL2 上で Vite を動作させる場合、LAN からサーバーにアクセスするために `host: true` を設定するだけでは不十分です。
詳しくは [WSL のドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan)をご覧ください。

:::


## server.allowedHosts
- **型:** `string[] | true`
- **デフォルト:** `[]`

Vite が応答することを許可するホスト名。
`localhost` と `.localhost` 以下のドメインとすべての IP アドレスはデフォルトで許可されます。
HTTPS を使用する場合は、このチェックはスキップされます。

文字列が `.` で始まる場合、`.` なしのホスト名とそのホスト名配下のすべてのサブドメインを許可します。たとえば、`.example.com` は `example.com`、`foo.example.com`、`foo.bar.example.com` を許可します。`true` に設定した場合、サーバーが任意のホストのリクエストに応答することを許可します。

::: details 安全に追加できるホストは何ですか？

解決先の IP アドレスを制御できるホストは、許可されたホストのリストに追加しても安全です。

例えば、`vite.dev` というドメインを所有している場合は、`vite.dev` と `.vite.dev` をリストに追加できます。そのドメインを所有しておらず、そのドメインの所有者を信頼できない場合は、追加しないでください。

特に、`.com` のようなトップレベルドメインは絶対にリストへ追加しないでください。これは、誰でも `example.com` のようなドメインを購入し、それが解決する IP アドレスを制御できるためです。

:::

::: danger

`server.allowedHosts` を `true` に設定すると、任意のウェブサイトが DNS リバインド攻撃により開発サーバーにリクエストを送信できるようになり、ソースコードやコンテンツをダウンロードできるようになります。許可するホストの明示的なリストを常に使用することをお勧めします。詳細は [GHSA-vg6x-rcgg-rjx6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) を参照してください。

:::

::: details 環境変数による設定
環境変数 `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` を設定することで、許可するホストを追加できます。
:::

## server.port

- **型:** `number`
- **デフォルト:** `5173`

サーバーのポートを指定します。このポートがすでに使用されている場合、Vite は次に使用可能なポートを自動的に試すので、サーバーが最終的にリッスンする実際のポートとは異なる場合があることに注意してください。

## server.strictPort

- **型:** `boolean`

`true` に設定すると、ポートがすでに使用されている場合に、次に使用可能なポートを自動的に試すことなく終了します。

## server.https

- **型:** `https.ServerOptions`

TLS + HTTP/2 を有効にします。この値は `https.createServer()` に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)です。

TLS にダウングレードされるのは、[`server.proxy` オプション](#server-proxy)も使用している場合のみであることに注意してください。

有効な証明書が必要です。基本的なセットアップでは、自己署名証明書を自動的に作成しキャッシュする [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) をプロジェクトのプラグインに追加することもできます。しかし、独自の証明書を作成することを推奨します。

## server.open

- **型:** `boolean | string`

サーバー起動時に自動的にブラウザーでアプリを開きます。値が文字列の場合、URL のパス名として使用されます。もしあなたの好きなブラウザーでアプリを開きたい場合、環境変数 `process.env.BROWSER`（例: `firefox`）を定義できます。詳細は [`open` パッケージ](https://github.com/sindresorhus/open#app) をご覧ください。また、`process.env.BROWSER_ARGS` を設定して、追加の引数を渡すこともできます（例: `--incognito`）。

また、`BROWSER` と `BROWSER_ARGS` は `.env` ファイルで設定できる特別な環境変数です。詳しくは [`open` パッケージ](https://github.com/sindresorhus/open#app) を参照してください。

**例:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **型:** `Record<string, string | ProxyOptions>`

開発サーバーのカスタムプロキシのルールを設定します。`{ key: options }` のペアのオブジェクトが必要です。リクエストパスがそのキーで始まるすべてのリクエストは、その指定されたターゲットにプロキシされます。キーが `^` で始まる場合は `RegExp` として解釈されます。プロキシのインスタンスにアクセスするには `configure` オプションを使用します。リクエストが設定したプロキシのルールのいずれかに一致した場合、そのリクエストは Vite によって変換されません。

相対的でない [`base`](/config/shared-options.md#base) を使用する場合、各キーの先頭に `base` を付けなければならないことに注意してください。

[`http-proxy`](https://github.com/http-party/node-http-proxy#options) を拡張します。他のオプションは[こちら](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13)。

場合によっては、基盤となる開発サーバーを設定したいこともあるでしょう（例: 内部の [connect](https://github.com/senchalabs/connect) アプリにカスタムミドルウェアを追加する場合など）。そのためには、独自の [plugin](/guide/using-plugins.html) を書き、[configureServer](/guide/api-plugin.html#configureserver) 関数を使用する必要があります。

**例:**

```js
export default defineConfig({
  server: {
    proxy: {
      // 文字列のショートハンド:
      // http://localhost:5173/foo
      //   -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',
      // オプションを使用:
      // http://localhost:5173/api/bar
      //   -> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 正規表現を使用:
      // http://localhost:5173/fallback/
      //   -> http://jsonplaceholder.typicode.com/
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // プロキシインスタンスを使用
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // プロキシは 'http-proxy' のインスタンスになります
        },
      },
      // Web ソケット か socket.io をプロキシ化:
      // ws://localhost:5173/socket.io
      //   -> ws://localhost:5174/socket.io
      // `rewriteWsOrigin` を使用すると、プロキシが CSRF 攻撃に無防備になる
      // 可能性があるため、使用には注意してください。
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **型:** `boolean | CorsOptions`
- **デフォルト:** `{ origin: /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/ }`（localhost, `127.0.0.1`, `::1` を許可）

開発サーバーの CORS を設定します。[オプションオブジェクト](https://github.com/expressjs/cors#configuration-options)を渡して微調整するか、`true` で任意のオリジンを許可します。

:::danger

`server.cors` を `true` に設定すると、任意のウェブサイトから開発サーバーにリクエストを送信し、ソースコードやコンテンツをダウンロードできるようになります。許可するオリジンを明示的に常に指定することを推奨します。
:::


## server.headers

- **型:** `OutgoingHttpHeaders`

サーバーのレスポンスヘッダーを指定します。

## server.hmr

- **型:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

HMR 接続の無効化または設定（HMR WebSocket が http サーバーと異なるアドレスを使用する必要がある場合）。

`server.hmr.overlay` を `false` に設定すると、サーバーエラーのオーバレイが無効になります。

`protocol` は、HMR 接続のために使われる WebSocket プロトコルを設定します: `ws`（WebSocket）または `wss`（WebSocket Secure）

`clientPort` は、クライアント側のポートのみを上書きする高度なオプションで、クライアントコードが探すポートとは異なるポートで WebSocket を配信できます。

`server.hmr.server` を指定されている場合、Vite は指定されたサーバーを通して HMR 接続要求を処理します。ミドルウェアモードでない場合、Vite は既存のサーバーを通して HMR 接続要求を処理しようとします。これは、自己署名証明書を使用する場合や、Vite を単一ポートでネットワーク上に公開したい場合に役立ちます。

いくつかの例については、[`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue)をご覧ください。

::: tip 注意

デフォルトの設定では、Vite の前のリバースプロキシが WebSocket のプロキシに対応していることが期待されています。Vite の HMR クライアントが WebSocket の接続に失敗した場合、クライアントはリバースプロキシを迂回して直接 Vite の HMR サーバーに接続するようにフォールバックします:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

フォールバックが発生した際のブラウザーに表示されるエラーは無視できます。直接リバースプロキシを迂回してエラーを回避するには、次のいずれかを行えます:

- WebSocket もプロキシするようにリバースプロキシを設定する
- [`server.strictPort = true`](#server-strictport) を設定し、`server.hmr.clientPort` を `server.port` と同じ値に設定する
- `server.hmr.port` を [`server.port`](#server-port) とは異なる値に設定する

:::

## server.warmup

- **型:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **関連:** [よく使うファイルのウォームアップ](/guide/performance.html#warm-up-frequently-used-files)

変換するファイルをウォームアップし、結果を事前にキャッシュします。これにより、サーバー起動時の初期ページ読み込みが改善され、変換ウォーターフォールを防げます。

`clientFiles` はクライアントのみで使用されるファイルであり、`ssrFiles` は SSR のみで使用されるファイルです。これらは `root` を基準としたファイルパスや [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) パターンの配列を受け入れます。

起動時に Vite 開発サーバーに負荷がかからないように、頻繁に使用するファイルのみを追加するようにしてください。

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **型:** `object| null`

[chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api) に渡すファイルシステムウォッチャーのオプションです。

Vite サーバーのウォッチャーはデフォルトで `root` を監視し、`.git/`、`node_modules/`、および Vite の `cacheDir` と `build.outDir` ディレクトリーをスキップします。監視されているファイルを更新すると Vite は HMR を適用し、必要な場合にのみページを更新します。

`null` に設定すると、ファイルは監視されません。`server.watcher` は互換性のあるイベントエミッターを提供しますが、`add` または `unwatch` を呼び出しても効果はありません。

::: warning `node_modules` 内のファイルの監視

現在、`node_modules` 内のファイルやパッケージを監視することはできません。 さらなる進捗状況と回避策については、[issue #8619](https://github.com/vitejs/vite/issues/8619) を参照してください。

:::

::: warning Windows Subsystem for Linux (WSL) 2 上での Vite の実行

Vite を WSL2 で実行している際、ファイルシステム監視はファイルが Windows アプリケーション（WSL2 でないプロセス）により編集された場合に動作しません。これは [WSL2 の制約](https://github.com/microsoft/WSL/issues/4739) によるものです。これは WSL2 バックエンドの Docker で実行している場合でも該当します。

これを修正するためには、次のいずれかを行えます:

- **推奨**: ファイルを編集するのに WSL2 アプリケーションを使用します。
  - プロジェクトフォルダーを Windows ファイルシステムの外へ移動させることも推奨されます。WSL2 から Windows ファイルシステムへアクセスするのは遅いです。このオーバーヘッドを取り除くことでパフォーマンスが向上します。
- `{ usePolling: true }` を設定する。
  - [`usePolling` は CPU 使用率が高くなること](https://github.com/paulmillr/chokidar/tree/3.6.0#performance)に注意してください。

:::

## server.middlewareMode

- **型:** `boolean`
- **デフォルト:** `false`

ミドルウェアモードで Vite サーバーを作成します。

- **関連:** [appType](./shared-options#apptype), [SSR - 開発サーバーのセットアップ](/guide/ssr#setting-up-the-dev-server)

- **例:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // ミドルウェアモードで Vite サーバーを作成
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // Viteのデフォルトの HTML を処理するミドルウェアを含めない
    appType: 'custom',
  })
  // vite の接続インスタンスをミドルウェアとして使用
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // `appType` が `'custom'` なので、ここでレスポンスを返すべきです。
    // 注: `appType` が `'spa'` または `'mpa'` の際は、Vite に HTML リクエスト と
    // 404 を処理するミドルウェアが含まれるため、ユーザーのミドルウェアが
    // 動作するためには Vite のミドルウェアよりも前に追加されるべきです。
  })
}

createServer()
```

## server.fs.strict

- **型:** `boolean`
- **デフォルト:** `true`（Vite 2.7 以降、デフォルトで有効）

ワークスペースのルート以外のファイルの配信を制限します。

## server.fs.allow

- **型:** `string[]`

`/@fs/` 経由で配信可能なファイルを制限します。`server.fs.strict` が `true` に設定されている場合、このディレクトリーリストの外にある、許可されたファイルからインポートされていないファイルにアクセスすると、403 が返されます。

ディレクトリーとファイルの両方を指定することができます。

Vite は、潜在的なワークスペースのルートを検索し、それをデフォルトとして使用します。有効なワークスペースは以下の条件を満たすもので、そうでない場合は[プロジェクトのルート](/guide/#index-html-and-project-root)にフォールバックします。

- `package.json` に `workspaces` フィールドが含まれている
- 以下のファイルのいずれかを含んでいる
  - `lerna.json`
  - `pnpm-workspace.yaml`

カスタムワークスペースのルートを指定するパスを受け取ります。絶対パスか、[プロジェクトのルート](/guide/#index-html-and-project-root)からの相対パスを指定します。例えば:

```js
export default defineConfig({
  server: {
    fs: {
      // プロジェクトルートの 1 つ上の階層からファイルを配信できるようにする
      allow: ['..'],
    },
  },
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
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **型:** `string[]`
- **デフォルト:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Vite 開発サーバーでの配信が制限されている機密ファイルのブロックリスト。これは [`server.fs.allow`](#server-fs-allow) よりも優先度が高くなります。[picomatch パターン](https://github.com/micromatch/picomatch#globbing-features)がサポートされています。

## server.origin

- **型:** `string`

開発時に生成されるアセット URL のオリジンを定義します。

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **型:** `false | (sourcePath: string, sourcemapPath: string) => boolean`
- **デフォルト:** `(sourcePath) => sourcePath.includes('node_modules')`

サーバーのソースマップにあるソースファイルを無視するかどうか。[`x_google_ignoreList` ソースマップ拡張](https://developer.chrome.com/articles/x-google-ignore-list/)を設定するため使用されます。

`server.sourcemapIgnoreList` は、開発サーバーの [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) に相当します。2 つの設定オプションの違いは、rollup の関数が `sourcePath` の相対パスで呼び出されるのに対して、`server.sourcemapIgnoreList` は絶対パスで呼び出されることです。開発中、ほとんどのモジュールはマップとソースが同じフォルダーにあるため、`sourcePath` の相対パスはファイル名そのものになります。このような場合、代わりに絶対パスを使用するのが便利です。

デフォルトでは `node_modules` を含むすべてのパスを除外します。この動作を無効にするには `false` を渡します。もしくは、完全に制御するには、ソースパスとソースマップパスを受け取り、ソースパスを無視するかどうかを返す関数を指定します。

```js
export default defineConfig({
  server: {
    // これはデフォルトの値であり、パスに node_modules を含むすべての
    // ファイルを無視リストに追加します。
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip 
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) と [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) は個別に設定する必要があります。`server.sourcemapIgnoreList` はサーバーのみの設定であり、定義された rollup オプションからデフォルト値を取得しません。
:::
