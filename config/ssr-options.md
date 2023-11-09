# SSR オプション

## ssr.external

- **型:** `string[]`
- **関連:** [外部 SSR](/guide/ssr#ssr-externals)

SSR の依存関係を強制的に外部化します。

## ssr.noExternal

- **型:** `string | RegExp | (string | RegExp)[] | true`
- **関連:** [外部 SSR](/guide/ssr#ssr-externals)

指定した依存関係が SSR のために外部化されるのを防ぎます。`true` の場合、どの依存関係も外部化されません。

## ssr.target

- **型:** `'node' | 'webworker'`
- **デフォルト:** `node`

SSR サーバのビルドターゲット。
