# ワーカのオプション

## worker.format

- **型:** `'es' | 'iife'`
- **デフォルト:** `iife`

ワーカバンドルの出力形式。

## worker.plugins

- **型:** [`(Plugin | Plugin[])[]`](./shared-options#plugins)

ワーカバンドルに適用される Vite プラグイン。[config.plugins](./shared-options#plugins) はワーカに適用されないため、代わりにここで設定する必要があることに注意してください。

## worker.rollupOptions

- **型:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

ワーカバンドルをビルドするための Rollup オプション。
