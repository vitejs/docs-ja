# SSR オプション

特に記載がない限り、このセクションのオプションは開発とビルドの両方に適用されます。

## ssr.external

- **型:** `string[] | true`
- **関連:** [外部 SSR](/guide/ssr#ssr-externals)

SSR 用の指定された依存関係と、その遷移的な（transitive）依存関係を外部化します。デフォルトでは、（HMR のために）リンクされた依存関係を除いて、すべての依存関係が外部化されます。リンクされた依存関係を外部化したい場合、その名前をこのオプションに渡せます。

`true` の場合、リンクされた依存関係を含むすべての依存関係が外部化されます。

`ssr.noExternal` に（任意の型を使用して）リストされた場合でも、（`string[]` 型を使用して）明示的にリストされた依存関係が常に優先されることに注意してください。

## ssr.noExternal

- **型:** `string | RegExp | (string | RegExp)[] | true`
- **関連:** [外部 SSR](/guide/ssr#ssr-externals)

指定した依存関係が SSR のために外部化されるのを防ぎます。もし外部化された場合、依存関係はビルドにバンドルされます。デフォルトでは、（HMR のために）リンクされた依存関係だけが外部化されません。リンクされた依存関係を外部化したい場合は、その名前を `ssr.external` オプションに渡せます。

`true` の場合、どの依存関係も外部化されません。ただし、（`string[]` 型を使用して）`ssr.external` に明示的にリストされた依存関係は優先され、依然として外部化されます。`ssr.target: 'node'` が設定された場合、Node.js のビルトインもデフォルトで外部化されます。

`ssr.noExternal: true` と `ssr.external: true` の両方が設定された場合、`ssr.noExternal` が優先され、どの依存関係も外部化されないことに注意してください。

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
