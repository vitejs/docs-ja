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

SSR サーバーのビルドターゲット。

## ssr.resolve.conditions

- **型:** `string[]`
- **関連:** [Resolve Conditions](./shared-options.md#resolve-conditions)

デフォルトはルートの [`resolve.conditions`](./shared-options.md#resolve-conditions) です。

これらの条件はプラグインパイプラインで使用され、SSR ビルド時に外部化されていない依存関係にのみ影響します。外部化されたインポートに影響を与えるには `ssr.resolve.externalConditions` を使用してください。

## ssr.resolve.externalConditions

- **型:** `string[]`
- **デフォルト:** `[]`

外部化された依存関係の SSR インポート（`ssrLoadModule` を含む）の際に使用される条件。
