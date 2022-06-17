# SSR オプション

- **関連:** [外部 SSR](/guide/ssr#外部-ssr)

:::warning 実験的な機能
SSR オプションは、マイナリリースで調整される可能性があります。
:::

## ssr.external

- **型:** `string[]`

SSR の依存関係を強制的に外部化します。

## ssr.noExternal

- **型:** `string | RegExp | (string | RegExp)[] | true`

指定した依存関係が SSR のために外部化されるのを防ぎます。`true` の場合、どの依存関係も外部化されません。

## ssr.target

- **型:** `'node' | 'webworker'`
- **デフォルト:** `node`

SSR サーバのビルドターゲット。
