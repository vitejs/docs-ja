# 環境ごとの API への移行

::: tip フィードバック
[Environment API feedback discussion](https://github.com/vitejs/vite/discussions/16358)でフィードバックをお寄せください。
:::

ViteDevServer のモジュールグラフに関連する複数の API は、より独立した環境 API に置き換えられました。

- `server.moduleGraph` -> [`environment.moduleGraph`](/guide/api-environment#separate-module-graphs)
- `server.transformRequest` -> `environment.transformRequest`
- `server.warmupRequest` -> `environment.warmupRequest`

影響範囲: `Vite プラグイン作成者`

::: warning 将来の廃止予定
Environment インスタンスは `v6.0` で初めて導入されました。`v7.0` では現在環境にある `server.moduleGraph` やその他のメソッドが廃止される予定です。まだサーバーのメソッドから移行することはお勧めしません。使用状況を明確にするために、vite の設定でこれらを設定してください。

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## 動機

// TODO: <small>（訳注: 原文ママ）</small>

## 移行ガイド

// TODO: <small>（訳注: 原文ママ）</small>
