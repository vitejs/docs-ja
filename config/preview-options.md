# プレビューのオプション

特に記載がない限り、このセクションのオプションはプレビューにのみ適用されます。

## preview.host

- **型:** `string | boolean`
- **デフォルト:** [`server.host`](./server-options#server_host)

サーバーがリッスンすべき IP アドレスを指定します。
`0.0.0.0` または `true` に設定すると、LAN やパブリックアドレスを含むすべてのアドレスをリッスンします。

これは CLI で `--host 0.0.0.0` や `--host` を使用して設定できます。

:::tip 注意

Vite ではなく他のサーバーがレスポンスを返す場合があります。
詳細は [`server.host`](./server-options.md#server-host) をご覧ください。

:::

## preview.allowedHosts

- **型:** `string | true`
- **デフォルト:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Vite が応答することを許可するホスト名。

詳細は [`server.allowedHosts`](./server-options#server-allowedhosts) を参照してください。

## preview.port

- **型:** `number`
- **デフォルト:** `4173`

サーバーのポートを指定します。このポートがすでに使用されている場合、Vite は次に使用可能なポートを自動的に試すので、サーバーが最終的にリッスンする実際のポートとは異なる場合があることに注意してください。

**例:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **型:** `boolean`
- **デフォルト:** [`server.strictPort`](./server-options#server-strictport)

`true` に設定すると、ポートがすでに使用されている場合に、次に使用可能なポートを自動的に試すことなく終了します。

## preview.https

- **型:** `https.ServerOptions`
- **デフォルト:** [`server.https`](./server-options#server-https)

TLS + HTTP/2 を有効にします。[`server.proxy` オプション](./server-options#server-proxy)も使用されている場合にのみ TLS にダウングレードされるので注意してください。

この値は `https.createServer()` に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でも構いません。

## preview.open

- **型:** `boolean | string`
- **デフォルト:** [`server.open`](./server-options#server-open)

サーバー起動時に自動的にブラウザーでアプリを開きます。値が文字列の場合、URL のパス名として使用されます。もしあなたの好きなブラウザーでアプリを開きたい場合、環境変数 `process.env.BROWSER`（例: `firefox`）を定義できます。詳細は [`open` パッケージ](https://github.com/sindresorhus/open#app) をご覧ください。また、`process.env.BROWSER_ARGS` を設定して、追加の引数を渡すこともできます（例: `--incognito`）。

また、`BROWSER` と `BROWSER_ARGS` は `.env` ファイルで設定できる特別な環境変数です。詳しくは [`open` パッケージ](https://github.com/sindresorhus/open#app) を参照してください。

## preview.proxy

- **型:** `Record<string, string | ProxyOptions>`
- **デフォルト:** [`server.proxy`](./server-options#server-proxy)

プレビューサーバーのカスタムプロキシのルールを設定します。`{ key: options }` のペアのオブジェクトが必要です。キーが `^` で始まる場合は `RegExp` として解釈されます。プロキシのインスタンスにアクセスするには `configure` オプションを使用します。

[`http-proxy`](https://github.com/http-party/node-http-proxy) を使用します。全オプションは[こちら](https://github.com/http-party/node-http-proxy#options)。

## preview.cors

- **型:** `boolean | CorsOptions`
- **デフォルト:** [`server.cors`](./server-options#server-cors)

プレビューサーバーの CORS を設定します。これはデフォルトで有効になっており、どんなオリジンも許可します。[オプションオブジェクト](https://github.com/expressjs/cors#configuration-options)を渡して微調整するか、`false` で無効にします。

## preview.headers

- **型:** `OutgoingHttpHeaders`

サーバーのレスポンスヘッダーを指定します。
