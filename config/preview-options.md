# プレビューのオプション

## preview.host

- **型:** `string | boolean`
- **デフォルト:** [`server.host`](./server-options#server_host)

サーバがリッスンすべき IP アドレスを指定します。
`0.0.0.0` または `true` に設定すると、LAN やパブリックアドレスを含むすべてのアドレスをリッスンします。

これは CLI で `--host 0.0.0.0` や `--host` を使用して設定できます。

## preview.port

- **型:** `number`
- **デフォルト:** `4173`

サーバのポートを指定します。このポートがすでに使用されている場合、Vite は次に使用可能なポートを自動的に試すので、サーバが最終的にリッスンする実際のポートとは異なる場合があることに注意してください。

**例:**

```js
export default defineConfig({
  server: {
    port: 3030
  },
  preview: {
    port: 8080
  }
})
```

## preview.strictPort

- **型:** `boolean`
- **デフォルト:** [`server.strictPort`](./server-options#server-strictport)

`true` に設定すると、ポートがすでに使用されている場合に、次に使用可能なポートを自動的に試すことなく終了します。

## preview.https

- **型:** `boolean | https.ServerOptions`
- **デフォルト:** [`server.https`](./server-options#server-https)

TLS + HTTP/2 を有効にします。[`server.proxy` オプション](./server-options#server-proxy)も使用されている場合にのみ TLS にダウングレードされるので注意してください。

この値は `https.createServer()` に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でも構いません。

## preview.open

- **型:** `boolean | string`
- **デフォルト:** [`server.open`](./server-options#server_open)

サーバ起動時に自動的にブラウザでアプリを開きます。値が文字列の場合、URL のパス名として使用されます。もしあなたの好きなブラウザでアプリを開きたい場合、環境変数 `process.env.BROWSER`（例: `firefox`）を定義できます。詳細は [`open` パッケージ](https://github.com/sindresorhus/open#app) をご覧ください。

## preview.proxy

- **型:** `Record<string, string | ProxyOptions>`
- **デフォルト:** [`server.proxy`](./server-options#server_proxy)

開発サーバのカスタムプロキシのルールを設定します。`{ key: options }` のペアのオブジェクトが必要です。キーが `^` で始まる場合は `RegExp` として解釈されます。プロキシのインスタンスにアクセスするには `configure` オプションを使用します。

[`http-proxy`](https://github.com/http-party/node-http-proxy) を使用します。全オプションは[こちら](https://github.com/http-party/node-http-proxy#options)。

## preview.cors

- **型:** `boolean | CorsOptions`
- **デフォルト:** [`server.cors`](./server-options#server_proxy)

開発サーバの CORS を設定します。これはデフォルトで有効になっており、どんなオリジンも許可します。[オプションオブジェクト](https://github.com/expressjs/cors)を渡して微調整するか、`false` で無効にします。
