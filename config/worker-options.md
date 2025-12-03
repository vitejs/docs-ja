# ワーカーのオプション

特に記載がない限り、このセクションのオプションは開発、ビルド、プレビューのすべてに適用されます。

## worker.format

- **型:** `'es' | 'iife'`
- **デフォルト:** `'iife'`

ワーカーバンドルの出力形式。

## worker.plugins

- **型:** [`() => (Plugin | Plugin[])[]`](./shared-options#plugins)

ワーカーバンドルに適用される Vite プラグイン。[config.plugins](./shared-options#plugins) は開発時のワーカーのみに適用されるため、ビルドの場合はここで設定する必要があることに注意してください。
この関数は、rollup ワーカーを並行してビルドする際に使用される新しいプラグインインスタンスを返す必要があります。そのため、 `config` フックの `config.worker` オプションの変更は無視されます。

## worker.rolldownOptions

<!-- TODO: update the link below to Rolldown's documentation -->

- **型:** [`RolldownOptions`](https://rollupjs.org/configuration-options/)

ワーカーバンドルをビルドするための Rolldown オプション。

## worker.rollupOptions

- **型:** `RolldownOptions`
- **非推奨**

このオプションは `worker.rolldownOptions` オプションのエイリアスです。代わりに `build.rolldownOptions` オプションを使用してください。
