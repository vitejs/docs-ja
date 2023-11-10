# ワーカのオプション

Web Worker に関連するオプション。

## worker.format

- **型:** `'es' | 'iife'`
- **デフォルト:** `'iife'`

ワーカバンドルの出力形式。

## worker.plugins

- **型:** [`() => (Plugin | Plugin[])[]`](./shared-options#plugins)

ワーカバンドルに適用される Vite プラグイン。[config.plugins](./shared-options#plugins) は開発時のワーカのみに適用されるため、ビルドの場合はここで設定する必要があることに注意してください。
この関数は、rollup ワーカーを並行してビルドする際に使用される新しいプラグインインスタンスを返す必要があります。そのため、 `config` フックの `config.worker` オプションの変更は無視されます。

## worker.rollupOptions

- **型:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

ワーカバンドルをビルドするための Rollup オプション。
