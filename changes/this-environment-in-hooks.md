# フック内の `this.environment`

::: tip フィードバック
[Environment API feedback discussion](https://github.com/vitejs/vite/discussions/16358)でフィードバックをお寄せください。
:::

Vite 6 以前は `client` と `ssr` という 2 つの環境しか利用できませんでした。`resolveId`、`load`、`transform` プラグインフックの `options.ssr` 引数によって、プラグインフックでモジュールを処理する際に、プラグイン作成者はこの 2 つの環境を区別することができました。Vite 6 では、Vite アプリケーションは必要に応じて任意の数の名前付き環境を定義できます。プラグインコンテキストに `this.environment` を導入し、フック内で現在のモジュールの環境と対話できるようにします。

影響範囲: `Vite プラグイン作成者`

::: warning 将来の廃止予定
`this.environment` は `v6.0` で導入されました。`options.ssr` の廃止は将来のメジャーバージョンで予定されています。その時点で、新しい API を使うようにプラグインを移行することを推奨します。使用状況を明確にするために、vite の設定で `future.removePluginHookSsrArgument` を `"warn"` に設定してください。
:::

## 動機

`this.environment` はプラグインフックの実装に現在の環境名を知らせるだけでなく、環境設定オプション、モジュールグラフ情報、トランスフォームパイプライン (`environment.config`, `environment.moduleGraph`, `environment.transformRequest()`) にもアクセスできるようにします。環境インスタンスをコンテキストで利用できるようにすることで、プラグイン作成者は開発サーバー全体への依存を避けることができます（通常は `configureServer` フックによって起動時にキャッシュされます）。

## 移行ガイド

既存のプラグインを素早くマイグレーションするには、`resolveId`、`load`、`transform` フックの `options.ssr` 引数を `this.environment.config.consumer === 'server'` に置き換えてください:

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [!code --]
      const isSSR = this.environment.config.consumer === 'server' // [!code ++]

      if (isSSR) {
        // SSR 固有のロジック
      } else {
        // クライアント固有のロジック
      }
    },
  }
}
```

より堅牢で長期的な実装のために、プラグインフックは環境名に依存するのではなく、きめ細かい環境オプションを使って[複数の環境](/guide/api-environment-plugins.html#accessing-the-current-environment-in-hooks)を扱うべきです。
