# SSR オプション

## ssr.external

- **型:** `string[]`
- **関連:** [SSR Externals](/guide/ssr#外部-ssr)

SSR の依存関係を強制的に外部化します。

## ssr.noExternal

- **型:** `string | RegExp | (string | RegExp)[] | true`
- **関連:** [SSR Externals](/guide/ssr#外部-ssr)

指定した依存関係が SSR のために外部化されるのを防ぎます。`true` の場合、どの依存関係も外部化されません。

## ssr.target

- **型:** `'node' | 'webworker'`
- **デフォルト:** `node`

SSR サーバのビルドターゲット。

## ssr.format

- **実験的機能**
- **非推奨** Vite 5 では ESM 出力のみがサポートされます
- **型:** `'esm' | 'cjs'`
- **デフォルト:** `esm`

SSR サーバのビルドフォーマット。Vite 3 以降の SSR ビルドはデフォルトで ESM を生成します。`'cjs'` を選択すると CJS が生成されますが、おすすめではありません。このオプションは、ユーザーが ESM にアップデートするまでの時間を設けるために、実験的機能のままにしています。CJS ビルドには、ESM フォーマットにはない複雑な外部化ヒューリスティックが必要です。
