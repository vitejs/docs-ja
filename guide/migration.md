# v5 からの移行

## Environment API

新しい実験的な [Environment API](/guide/api-environment.md) の一部として、大きな内部リファクタリングが必要でした。Vite 6 は、ほとんどのプロジェクトが新しいメジャーに素早くアップグレードできるように、破壊的変更を避けるように努めています。エコシステムの大部分が移行して安定し、新しい API の使用を推奨し始めるまで待ちます。いくつかのエッジケースはあるかもしれなれませんが、それはフレームワークやツールによる低レベルの使用にのみ影響するはずです。私たちはエコシステムのメンテナーと協力して、リリース前にこれらの差分を軽減しました。リグレッションを発見した場合は、[問題を報告](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml)してください。

Vite の実装変更に伴い、いくつかの内部 API が削除されました。これらの API に依存していた場合は、[機能のリクエスト](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml)を作成してください。

## Vite ランタイム API

実験的な Vite ランタイム API は、新しい実験的な [Environment API](/guide/api-environment) の一部として Vite 6 でリリースされたモジュールランナー API へと進化しました。この機能が実験的なものであったことを考えると、Vite 5.1 で導入された以前の API の削除は破壊的変更ではありませんが、ユーザーは Vite 6 への移行の一環として、モジュールランナー API と同等のものに更新する必要があります。

## 全般的な変更

### JSON stringify

Vite 5 では、[`json.stringify: true`](/config/shared-options#json-stringify) が設定されている場合、[`json.namedExports`](/config/shared-options#json-namedexports) が無効になっていました。

Vite 6 からは、`json.stringify: true` が設定されていても、`json.namedExports` は無効化されず、その値が尊重されます。以前の動作にしたい場合は、`json.namedExports: false` を設定します。

Vite 6 では、`json.stringify` の新しいデフォルト値として `'auto'` が導入されました。これは、大きな JSON ファイルのみを文字列化します。この動作を無効にするには、`json.stringify: false` を設定します。

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

- [[#15637] fix!: default `build.cssMinify` to `'esbuild'` for SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/config/build-options#build-cssminify) は、SSR ビルドの場合でもデフォルトで有効になりました。
- [[#18070] feat!: proxy bypass with WebSocket](https://github.com/vitejs/vite/pull/18070)
  - WebSocket のアップグレードリクエストに対しては、`server.proxy[path].bypass` が呼び出されるようになりました。その場合、`res` パラメーターは `undefined` となります。
- [[#18209] refactor!: bump minimal terser version to 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - [`build.minify: 'terser'`](/config/build-options#build-minify) でサポートされる最小の terser のバージョンが 5.4.0 から 5.16.0 に引き上げられました。
- [[#18231] chore(deps): update dependency @rollup/plugin-commonjs to v28](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) がデフォルトで `true` になりました（以前は `'auto'`）。
- [[#18243] chore(deps)!: migrate `fast-glob` to `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - 範囲指定の角括弧（`{01..03}` ⇒ `['01', '02', '03']`）および増分指定の角括弧（`{2..8..2}` ⇒ `['2', '4', '6', '8']`）は、glob 内でサポートされなくなりました。

## v4 からの移行

まず、Vite v5 ドキュメントの[v4 からの移行ガイド](https://v5.vite.dev/guide/migration.html)をチェックし、アプリを Vite 5 に移植するために必要な変更を確認してから、このページの変更を進めてください。
