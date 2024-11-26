# `ModuleRunner` API を使った SSR

::: tip フィードバック
[Environment API feedback discussion](https://github.com/vitejs/vite/discussions/16358)でフィードバックをお寄せください。
:::

`server.ssrLoadModule` は [Module Runner](/guide/api-environment#modulerunner) からのインポートに置き換えられました。

影響範囲: `Vite プラグイン作成者`

::: warning 将来の廃止予定
`ModuleRunner` は `v6.0` で初めて導入されました。`server.ssrLoadModule` の廃止は将来のメジャーバージョンで予定されています。使用状況を明確にするため、vite config で `future.removeSsrLoadModule` を `"warn"` に設定してください。
:::

## 動機

`server.ssrLoadModule(url)` は `ssr` 環境でのモジュールインポートのみを許可し、Vite 開発サーバーと同じプロセスでのみモジュールを実行できます。カスタム環境を持つアプリケーションでは、各環境は `ModuleRunner` と関連付けられ、個別のスレッドまたはプロセスで実行される場合があります。モジュールをインポートするには、`moduleRunner.import(url)` を使用します。

## 移行ガイド

[Environment API フレームワークガイド](../guide/api-environment-frameworks.md)をご覧ください。
