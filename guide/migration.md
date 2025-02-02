# v5 からの移行

## Environment API

新しい実験的な [Environment API](/guide/api-environment.md) の一部として、大きな内部リファクタリングが必要でした。Vite 6 は、ほとんどのプロジェクトが新しいメジャーに素早くアップグレードできるように、破壊的変更を避けるように努めています。エコシステムの大部分が移行して安定し、新しい API の使用を推奨し始めるまで待ちます。いくつかのエッジケースはあるかもしれなれませんが、それはフレームワークやツールによる低レベルの使用にのみ影響するはずです。私たちはエコシステムのメンテナーと協力して、リリース前にこれらの差分を軽減しました。リグレッションを発見した場合は、[問題を報告](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml)してください。

Vite の実装変更に伴い、いくつかの内部 API が削除されました。これらの API に依存していた場合は、[機能のリクエスト](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml)を作成してください。

## Vite ランタイム API

実験的な Vite ランタイム API は、新しい実験的な [Environment API](/guide/api-environment) の一部として Vite 6 でリリースされたモジュールランナー API へと進化しました。この機能が実験的なものであったことを考えると、Vite 5.1 で導入された以前の API の削除は破壊的変更ではありませんが、ユーザーは Vite 6 への移行の一環として、モジュールランナー API と同等のものに更新する必要があります。

## 全般的な変更

### `resolve.conditions` のデフォルト値

この変更は、[`resolve.conditions`](/config/shared-options#resolve-conditions) / [`ssr.resolve.conditions`](/config/ssr-options#ssr-resolve-conditions) / [`ssr.resolve.externalConditions`](/config/ssr-options#ssr-resolve-externalconditions) を設定していなかったユーザーには影響しません。

Vite 5 では、`resolve.conditions` のデフォルト値は `[]` であり、いくつかの条件が内部的に追加されていました。`ssr.resolve.conditions` のデフォルト値は `resolve.conditions` の値でした。

Vite 6 からは、一部の条件が内部的に追加されなくなったため、設定の値に含める必要があります。
内部的に追加されなくなった条件は次のとおりです。

- `resolve.conditions` では `['module', 'browser', 'development|production']`
- `ssr.resolve.conditions` では `['module', 'node', 'development|production']`

これらのオプションに対するデフォルト値は対応する値に更新され、`ssr.resolve.conditions` は `resolve.conditions` をデフォルト値として使用しなくなりました。`development|production` は、`process.env.NODE_ENV` の値に応じて `production` または `development` に置換される特殊な値であることに注意してください。これらのデフォルト値は、`vite` から `defaultClientConditions` および `defaultServerConditions` としてエクスポートされます。

`resolve.conditions` または `ssr.resolve.conditions` にカスタムの値を指定していた場合は、それらを新しい条件に含むように更新する必要があります。
たとえば、これまで `resolve.conditions` に `['custom']` と指定していた場合は、代わりに `['custom', ...defaultClientConditions]` と指定する必要があります。

### JSON stringify

Vite 5 では、[`json.stringify: true`](/config/shared-options#json-stringify) が設定されている場合、[`json.namedExports`](/config/shared-options#json-namedexports) が無効になっていました。

Vite 6 からは、`json.stringify: true` が設定されていても、`json.namedExports` は無効化されず、その値が尊重されます。以前の動作にしたい場合は、`json.namedExports: false` を設定します。

Vite 6 では、`json.stringify` の新しいデフォルト値として `'auto'` が導入されました。これは、大きな JSON ファイルのみを文字列化します。この動作を無効にするには、`json.stringify: false` を設定します。

### HTML 要素におけるアセット参照の拡張サポート

Vite 5 では、サポートされている HTML 要素のうち、Vite によって処理およびバンドルされるアセットを参照できるものは、`<link href>`、`<img src>` など、ごく一部に限られていました。

Vite 6 では、さらに多くの HTML 要素がサポート対象に追加されています。 完全なリストは、[HTML 機能](/guide/features.html#html)のドキュメントでご覧いただけます。

特定の要素の HTML 処理をオプトアウトするには、その要素に `vite-ignore` 属性を追加します。

### postcss-load-config

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) が v4 から v6 に更新されました。TypeScript の postcss 設定ファイルを読み込むために、[`ts-node`](https://www.npmjs.com/package/ts-node) の代わりに [`tsx`](https://www.npmjs.com/package/tsx) か [`jiti`](https://www.npmjs.com/package/jiti) が必要になりました。また、YAML の postcss 設定ファイルを読み込むために [`yaml`](https://www.npmjs.com/package/yaml) が必要になりました。

### Sass はデフォルトでモダン API を使用するようになりました

Vite 5 では、Sass にはデフォルトでレガシーAPI が使用されていました。Vite 5.4 では、モダン API のサポートが追加されました。

Vite 6 以降では、モダン API がデフォルトで Sass に使用されます。レガシー API を引き続き使用したい場合は、[`css.preprocessorOptions.sass.api: 'legacy'` / `css.preprocessorOptions.scss.api: 'legacy'`](/config/shared-options#css-preprocessoroptions) を設定します。ただし、レガシー API のサポートは Vite 7 で削除される予定であることにご注意ください。

モダン API に移行するには、[Sass のドキュメント](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/)を参照してください。

### ライブラリーモードでの CSS 出力ファイル名のカスタマイズ

Vite 5 では、ライブラリーモードでの CSS 出力ファイル名は常に　`style.css`　であり、Vite の設定ファイルから簡単に変更することはできませんでした。

Vite 6 からは、デフォルトのファイル名は JS 出力ファイルと同様に `package.json` の `"name"` を使用するようになりました。[`build.lib.fileName`](/config/build-options.md#build-lib) が文字列で設定されている場合、その値は CSS 出力ファイル名にも使用されます。別の CSS ファイル名を明示的に設定するには、新しい [`build.lib.cssFileName`](/config/build-options.md#build-lib) を使用して設定できます。

移行するには、`style.css` ファイル名に依存していた場合は、そのファイル名への参照をパッケージ名に基づく新しい名前に更新する必要があります。例:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Vite 5 のように `style.css` を使い続けたい場合は、代わりに `build.lib.cssFileName: 'style'` を設定できます。

## 高度な内容

少数のユーザーにのみ影響するその他の重大な変更があります。

- [[#17922] fix(css)!: remove default import in ssr dev](https://github.com/vitejs/vite/pull/17922)
  - CSS ファイルのデフォルトインポートのサポートは [Vite 4 で非推奨になり](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string)、Vite 5 では削除されましたが、SSR 開発モードでは意図せずサポートされていました。このサポートは削除されました。
- [[#15637] fix!: default `build.cssMinify` to `'esbuild'` for SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/config/build-options#build-cssminify) は、SSR ビルドの場合でもデフォルトで有効になりました。
- [[#18070] feat!: proxy bypass with WebSocket](https://github.com/vitejs/vite/pull/18070)
  - WebSocket のアップグレードリクエストに対しては、`server.proxy[path].bypass` が呼び出されるようになりました。その場合、`res` パラメーターは `undefined` となります。
- [[#18209] refactor!: bump minimal terser version to 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - [`build.minify: 'terser'`](/config/build-options#build-minify) でサポートされる最小の terser のバージョンが 5.4.0 から 5.16.0 に引き上げられました。
- [[#18231] chore(deps): update dependency @rollup/plugin-commonjs to v28](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) がデフォルトで `true` になりました（以前は `'auto'`）。
    - これはバンドルサイズが大きくなる可能性がありますが、より決定論的なビルド結果をもたらします。
    - CommonJS ファイルをエントリーポイントとして指定する場合は、追加の手順が必要になる場合があります。詳細は、[commonjs プラグインのドキュメント](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points)を参照してください。
- [[#18243] chore(deps)!: migrate `fast-glob` to `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - 範囲指定の角括弧（`{01..03}` ⇒ `['01', '02', '03']`）および増分指定の角括弧（`{2..8..2}` ⇒ `['2', '4', '6', '8']`）は、glob 内でサポートされなくなりました。
- [[#18395] feat(resolve)!: allow removing conditions](https://github.com/vitejs/vite/pull/18395)
  - この PR では、上述の「`resolve.conditions` のデフォルト値」という破壊的変更が導入されているだけでなく、SSR における外部化されていない依存関係に対して `resolve.mainFields` を使用しないようにしています。もし `resolve.mainFields` を使用しており、SSR の外部化されていない依存関係に適用したい場合は、[`ssr.resolve.mainFields`](/config/ssr-options#ssr-resolve-mainfields) を使用できます。
- [[#18493] refactor!: remove fs.cachedChecks option](https://github.com/vitejs/vite/pull/18493)
  - キャッシュフォルダにファイルを書き込んですぐにインポートするといったエッジケースのために、このオプトイン最適化は削除されました。
- [[#18697] fix(deps)!: update dependency dotenv-expand to v12](https://github.com/vitejs/vite/pull/18697)
  - 補間に使用される変数は、補間の実行前に宣言する必要があるようになりました。詳しくは、[`dotenv-expand` の changelog](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16) を参照してください。
- [[#16471] feat: v6 - Environment API](https://github.com/vitejs/vite/pull/16471)

  - SSR 専用モジュールの更新がクライアント側でページ全体のリロードを引き起こすことはなくなりました。以前の動作に戻すには、カスタム Vite プラグインを使用できます:
    <details>
    <summary>クリックして例を表示</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## v4 からの移行

まず、Vite v5 ドキュメントの[v4 からの移行ガイド](https://v5.vite.dev/guide/migration.html)をチェックし、アプリを Vite 5 に移植するために必要な変更を確認してから、このページの変更を進めてください。
