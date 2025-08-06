# HMR `hotUpdate` プラグインフック

::: tip フィードバック
[Environment API feedback discussion](https://github.com/vitejs/vite/discussions/16358)でフィードバックをお寄せください。
:::

[Environment API](/guide/api-environment.md)を意識するために、`handleHotUpdate` プラグインフックを非推奨とし、[`hotUpdate` フック](/guide/api-environment#the-hotupdate-hook)を使用し、`create` と `delete` で追加の監視イベントを処理する予定です。

影響範囲: `Vite プラグイン作成者`

::: warning 将来の廃止予定
`hotUpdate` は `v6.0` で初めて導入されました。`handleHotUpdate` の廃止は将来のメジャーバージョンで予定されています。現時点では `handleHotUpdate` からの移行は推奨していません。もし実験して私たちにフィードバックをしたいのであれば、vite config で `future.removePluginHookHandleHotUpdate` を `"warn"` に指定してください。
:::

## 動機

[`handleHotUpdate` フック](/guide/api-plugin.md#handlehotupdate) はカスタム HMR 更新処理を行うことができます。更新するモジュールのリストは `HmrContext` に渡されます。

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

このフックはすべての環境に対して一度だけ呼び出され、渡されたモジュールはクライアント環境と SSR 環境だけの情報が混在しています。フレームワークがカスタム環境に移行すると、それぞれの環境に対して呼び出される新しいフックが必要になります。

新しい `hotUpdate` フックは `handleHotUpdate` と同じように動作しますが、環境ごとに呼び出され、新しい `HotUpdateOptions` インスタンスを受け取ります:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

現在の開発環境は他のプラグインフックのように `this.environment` でアクセスできます。`modules` のリストには現在の環境のモジュールノードのみが表示されます。各環境の更新は異なる更新ストラテジーを定義できます。

このフックは `'update'` だけでなく、追加の監視イベントでも呼び出されるようになりました。これらを区別するには `type` を使用します。

## 移行ガイド

HMR がより正確になるように、影響を受けるモジュールのリストをフィルタリングして絞り込みます。

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// 以下に移行:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

空の配列を返して完全なリロードを実行します:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // モジュールを手動で無効化
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// 以下に移行:

hotUpdate({ modules, timestamp }) {
  // モジュールを手動で無効化
  const invalidatedModules = new Set()
  for (const mod of modules) {
    this.environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  this.environment.hot.send({ type: 'full-reload' })
  return []
}
```

空の配列を返し、カスタムイベントをクライアントに送信することで、完全なカスタム HMR 処理を行います:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// 以下に移行...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```
