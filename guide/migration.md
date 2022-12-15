# v3 からの移行

## Rollup 3

Vite は現在、[Rollup 3](https://github.com/vitejs/vite/issues/9870)を使用しており、Vite 内部のアセット処理を簡素化でき、多くの改良が施されています。[Rollup 3 のリリースノートはこちら](https://github.com/rollup/rollup/releases) を参照してください。

Rollup 3 は Rollup 2 とほぼ互換性があります。プロジェクトでカスタム [`rollupOptions`](../config/build-options.md#rollup-options) を使用していて問題が発生した場合、[Rollup migration guide](https://rollupjs.org/guide/en/#migration) を参照して設定を更新してください。

## モダンブラウザのベースラインの変更

最新のブラウザ ビルドは、ES2020 との互換性を高めるために、デフォルトで `safari14` をターゲットにしました（`safari13` からバンプされました）。これは、モダンビルドで [`BigInt`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/BigInt) が使えるようになったことと、[Null 合体演算子](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) がトランスパイルされなくなったことを意味します。古いブラウザをサポートする必要がある場合は、通常通り [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を追加すればよいでしょう。

## 一般的な変更点

### エンコーディング

ビルドのデフォルトの文字セットが utf8 になりました（詳しくは [#10753](https://github.com/vitejs/vite/issues/10753) を参照）。

### CSS を文字列としてインポートする

Vite 3 では、`.css` ファイルのデフォルトエクスポートをインポートすると、CSS の二重読み込みが発生することがありました。

```ts
import cssString from './global.css'
```

この二重読み込みは、`.css` ファイルが出力され、その CSS 文字列がアプリケーションコードでも使用される可能性があるためです（たとえば、フレームワークのランタイムによって注入されます）。Vite 4 からは、`.css` のデフォルトエクスポートは [非推奨](https://github.com/vitejs/vite/issues/11094) になっています。この場合、インポートされた `.css` スタイルを出力しないので、`?inline` クエリーサフィックス修飾子を使用する必要があります。

```ts
import stuff from './global.css?inline'
```

### デフォルトは本番環境用ビルド

`vite build` は、渡された `--mode` に関係なく、常に本番環境用にビルドするようになりました。以前は、`mode` を `production` 以外に変更すると、開発用にビルドされていました。もし、開発用にビルドしたい場合は、`.env.{mode}` ファイルで `NODE_ENV=development` を設定します。

この変更の一部として、`vite dev` と `vite build` は `process.env.`<wbr>`NODE_ENV` が既に定義されている場合は上書きしないようになりました。そのため、ビルド前に `process.env.`<wbr>`NODE_ENV = 'development'`' を設定した場合、開発用のビルドも行われるようになります。これにより、複数のビルドや開発用サーバを並行して動作させる際に、よりコントロールしやすくなります。

詳しくは、更新された [`mode` のドキュメント](/guide/env-and-mode.html#modes)を参照してください。

### 環境変数

Vite では `dotenv` 16 と `dotenv-expand` 9 を使うようになりました（以前は `dotenv` 14 と `dotenv-expand` 5）。`#` や `` `` を含む値がある場合は、それらを引用符で囲む必要があります。

```diff
-VITE_APP=ab#cd`ef
+VITE_APP="ab#cd`ef"
```

詳しくは [`dotenv`](https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md) と [`dotenv-expand` 変更履歴](https://github.com/motdotla/dotenv-expand/blob/master/CHANGELOG.md)を参照してください。

## 高度な内容

プラグインやツールの作成者にのみ影響する変更点があります。

- [[#11036] feat(client)!: remove never implemented hot.decline](https://github.com/vitejs/vite/issues/11036)
  - 代わりに `hot.invalidate` を使ってください
- [[#9669] feat: align object interface for `transformIndexHtml` hook](https://github.com/vitejs/vite/issues/9669)
  - `enforce` の代わりに `order` を使ってください

また、少数のユーザーにのみ影響する破壊的変更が他にもあります。

- [[#11101] feat(ssr)!: remove dedupe and mode support for CJS](https://github.com/vitejs/vite/pull/11101)
  - SSR のデフォルトの ESM モードに移行する必要があります。CJS の SSR サポートは次の Vite メジャーで削除される可能性があります。
- [[#10475] feat: handle static assets in case-sensitive manner](https://github.com/vitejs/vite/pull/10475)
  - ファイル名の大文字小文字を無視する OS に依存しないようにしましょう。
- [[#10996] fix!: make `NODE_ENV` more predictable](https://github.com/vitejs/vite/pull/10996)
  - この変更に関する説明は PR を参照してください。
- [[#10903] refactor(types)!: remove facade type files](https://github.com/vitejs/vite/pull/10903)

## v2 からの移行

Vite v3 ドキュメントの [Migration from v2 Guide](https://v3.vitejs.dev/guide/migration.html) をまず確認し、アプリを Vite v3 に移植するための必要な変更を調べてから、このページの変更点を進めてください。
