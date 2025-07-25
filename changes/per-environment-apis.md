# 環境ごとの API への移行

::: tip フィードバック
[Environment API feedback discussion](https://github.com/vitejs/vite/discussions/16358)でフィードバックをお寄せください。
:::

モジュールグラフとモジュール変換に関連する `ViteDevServer` の複数の API が `DevEnvironment` インスタンスに移動されました。

影響範囲: `Vite プラグイン作成者`

::: warning 将来の廃止予定
`Environment` インスタンスは `v6.0` で初めて導入されました。将来のメジャーバージョンでは現在環境にある `server.moduleGraph` やその他のメソッドが廃止される予定です。まだサーバーのメソッドから移行することはお勧めしません。使用状況を明確にするために、vite の設定でこれらを設定してください。

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerReloadModule: 'warn',
  removeServerPluginContainer: 'warn',
  removeServerHot: 'warn',
  removeServerTransformRequest: 'warn',
  removeServerWarmupRequest: 'warn',
}
```

:::

## 動機

Vite v5 以前では、単一の Vite 開発サーバーには常に 2 つの環境（`client` と `ssr`）がありました。 `server.moduleGraph` には、これらの両方の環境からの混合モジュールが含まれていました。ノードは `clientImportedModules` と `ssrImportedModules` のリストで接続されていました（ただし、それぞれに対して単一の `importers` リストが維持されていました）。変換されたモジュールは `id` と `ssr` ブーリアンで表されていました。このブール値は、`server.moduleGraph.getModuleByUrl(url, ssr)` や `server.transformRequest(url, { ssr })` などの API に渡す必要がありました。

Vite v6 では、任意の数のカスタム環境（`client`、`ssr`、`edge` など）を作成できるようになりました。単一の `ssr` ブール値では不十分になりました。API を `server.transformRequest(url, { environment })` という形式に変更する代わりに、これらのメソッドを環境インスタンスに移動し、Vite 開発サーバーなしで呼び出せるようにしました。

## 移行ガイド

- `server.moduleGraph` -> [`environment.moduleGraph`](/guide/api-environment-instances#separate-module-graphs)
- `server.reloadModule(module)` -> `environment.reloadModule(module)`
- `server.pluginContainer` -> `environment.pluginContainer`
- `server.transformRequest(url, ssr)` -> `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` -> `environment.warmupRequest(url)`
- `server.hot` -> `server.client.environment.hot`
