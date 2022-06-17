# ワーカのオプション

## worker.format

- **型:** `'es' | 'iife'`
- **デフォルト:** `iife`

ワーカバンドルの出力形式。

## worker.plugins

- **型:** [`(Plugin | Plugin[])[]`](./shared-options#plugins)

ワーカバンドルに適用される Vite プラグイン

## worker.rollupOptions

- **型:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

ワーカバンドルをビルドするための Rollup オプション。
