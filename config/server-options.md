# サーバオプション

## server.host

- **型:** `string | boolean`
- **デフォルト:** `'localhost'`

サーバがリッスンすべき IP アドレスを指定します。
`0.0.0.0` もしくは `true` に設定すると、LAN やパブリックアドレスを含むすべてのアドレスをリッスンします。

これは CLI で `--host 0.0.0.0` や `--host` を使用して設定できます。

::: tip 注意

Vite ではなく他のサーバがレスポンスを返す場合があります。

1 つ目の場合は `localhost` が利用されたときです。Node.js v17 未満はデフォルトでは DNS によって解決された結果のアドレスを並び替えます。`localhost` へアクセスするとき、ブラウザは DNS を利用してアドレスを解決し、そのアドレスは Vite がリッスンしているアドレスと異なる場合があります。

[`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/docs/latest-v18.x/api/dns.html#dnssetdefaultresultorderorder) を設定することで、この並び替える動作を無効化できます。または、明示的に `127.0.0.1` を `server.host` に設定できます。

```js
// vite.config.js
import { defineConfig } from 'vite'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // 省略
})
```

2 つ目の場合はワイルドカードホスト (例: `0.0.0.0`) が利用されたときです。これは、ワイルドカードでないホストにリッスンしているサーバが、ワイルドカードをリッスンしているサーバよりも優先されるためです。

:::

## server.port

- **型:** `number`
- **デフォルト:** `5173`

サーバのポートを指定します。このポートがすでに使用されている場合、Vite は次に使用可能なポートを自動的に試すので、サーバが最終的にリッスンする実際のポートとは異なる場合があることに注意してください。

## server.strictPort

- **型:** `boolean`

`true` に設定すると、ポートがすでに使用されている場合に、次に使用可能なポートを自動的に試すことなく終了します。

## server.https

- **型:** `boolean | https.ServerOptions`

TLS + HTTP/2 を有効にします。[`server.proxy` オプション](#server-proxy)も使用されている場合にのみ TLS にダウングレードされるので注意してください。

この値は `https.createServer()` に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でも構いません。

## server.open

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

## server.proxy

- **型:** `Record<string, string | ProxyOptions>`

開発サーバのカスタムプロキシのルールを設定します。`{ key: options }` のペアのオブジェクトが必要です。キーが `^` で始まる場合は `RegExp` として解釈されます。プロキシのインスタンスにアクセスするには `configure` オプションを使用します。

[`http-proxy`](https://github.com/http-party/node-http-proxy) を使用します。全オプションは[こちら](https://github.com/http-party/node-http-proxy#options)。

場合によっては、基盤となる開発サーバーを設定したいこともあるでしょう（例: 内部の [connect](https://github.com/senchalabs/connect) アプリにカスタムミドルウェアを追加する場合など）。そのためには、独自の [plugin](/guide/using-plugins.html) を書き、[configureServer](/guide/api-plugin.html#configureserver) 関数を使用する必要があります。

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
      },
      // Web ソケット か socket.io をプロキシ化
      '/socket.io': {
        target: 'ws://localhost:5173',
        ws: true
      }
    }
  }
})
```

## server.cors

- **型:** `boolean | CorsOptions`

開発サーバの CORS を設定します。これはデフォルトで有効になっており、どんなオリジンも許可します。[オプションオブジェクト](https://github.com/expressjs/cors)を渡して微調整するか、`false` で無効にします。

## server.headers

- **型:** `OutgoingHttpHeaders`

サーバのレスポンスヘッダを指定します。

## server.hmr

- **型:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

HMR 接続の無効化または設定（HMR WebSocket が http サーバと異なるアドレスを使用する必要がある場合）。

`server.hmr.overlay` を `false` に設定すると、サーバエラーのオーバレイが無効になります。

`clientPort` は、クライアント側のポートのみを上書きする高度なオプションで、クライアントコードが探すポートとは異なるポートで WebSocket を配信できます。開発サーバの前で SSL プロキシを使用している場合に便利です。

`server.hmr.server` を指定すると、Vite は指定されたサーバを通して HMR 接続要求を処理します。ミドルウェアモードでない場合、Vite は既存のサーバを通して HMR 接続要求を処理しようとします。これは、自己署名証明書を使用する場合や、Vite を単一ポートでネットワーク上に公開したい場合に役立ちます。

## server.watch

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

## server.middlewareMode

- **型:** `boolean`
- **デフォルト:** `false`

ミドルウェアモードで Vite サーバを作成します。

- **関連:** [appType](./shared-options#apptype), [SSR - 開発サーバのセットアップ](/guide/ssr#開発サーバのセットアップ)

- **例:**

```js
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // ミドルウェアモードで Vite サーバを作成
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom' // ViteのデフォルトのHTMLを処理するミドルウェアを含めない
  })
  // vite の接続インスタンスをミドルウェアとして使用
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // `appType` が `'custom'` なので、ここでレスポンスを返すべきです。
    // 注: `appType` が `'spa'` または `'mpa'` の際は、Vite に HTML リクエスト と 404 になる
    // リクエストを処理するミドルウェアが含まれます。したがって、ユーザーのミドルウェアが
    // 動作するためにはViteのミドルウェアよりも前に追加されるべきです。
  })
}

createServer()
```

## server.base

- **型:** `string | undefined`

Vite をサブフォルダとしてプロキシする場合に使用するため、http リクエストの前にこのフォルダを追加します。最初と最後は `/` の文字にする必要があります。

## server.fs.strict

- **型:** `boolean`
- **デフォルト:** `true`（Vite 2.7 以降、デフォルトで有効）

ワークスペースのルート以外のファイルの配信を制限します。

## server.fs.allow

- **型:** `string[]`

`/@fs/` 経由で配信可能なファイルを制限します。`server.fs.strict` が `true` に設定されている場合、このディレクトリリストの外にある、許可されたファイルからインポートされていないファイルにアクセスすると、403 が返されます。

Vite は、潜在的なワークスペースのルートを検索し、それをデフォルトとして使用します。有効なワークスペースは以下の条件を満たすもので、そうでない場合は[プロジェクトのルート](/guide/#index-html-とプロジェクトルート)にフォールバックします。

- `package.json` に `workspaces` フィールドが含まれている
- 以下のファイルのいずれかを含んでいる
  - `lerna.json`
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

## server.fs.deny

- **型:** `string[]`

Vite 開発サーバでの配信が制限されている機密ファイルのブロックリスト。

デフォルトは `['.env', '.env.*', '*.{pem,crt}']` です。

## server.origin

- **型:** `string`

開発時に生成されるアセット URL のオリジンを定義します。

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080'
  }
})
```
