# 他の No-Bundler ツールとの比較

## Snowpack

[Snowpack](https://www.snowpack.dev/) も no-bundle ネイティブな ESM の開発サーバーで、Vite と非常に近い目的を持っています。実装の詳細が異なる点を除き、2つのプロジェクトは伝統的なツールより技術的に優れている点で非常に多くの共通点があります。Vite の依存関係の先読みビルドの機能は、Snowpack v1（現在の[`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall)）にも影響を受けています。2つのプロジェクト間の大きな違いは、以下のような点にあります。

**本番ビルド**

Snowpack のデフォルトのビルド出力は unbundled です。unbundled では、各ファイルを別々のビルドモジュールに変換し、それらを異なる「オプティマイザー」に入力することで、実際のバンドルを実行できます。この方法の利点は、特定の要求に合う異なる end-bundler（例：webpack、Rollup、あるいは esbuild も）を選択できるという点です。欠点は、開発者経験が多少異なるものとなってしまうことです。たとえば、esbuild オプティマイザーはまだ不安定で、Rollup オプティマイザーは公式にはメンテナンスされておらず、オプティマイザーごとに出力と設定が変わってしまいます。

Vite では、単一のバンドラー（Rollup）と深く結合することを選択することで、より効率的な経験が得られるようにしています。また、Vite は [Universal Plugin API](./api-plugin) をサポートしているため、開発時とビルド時の両方で動作します。

より統合されたビルドプロセスを実現するために、Vite では以下のような Snowpack のビルドオプティマイザーでは利用できないような幅広い機能をサポートしています。

- [Multi-Page のサポート](./build#multi-page-app)
- [ライブラリモード](./build#library-mode)
- [自動的な CSS コードの分割](./features#css-code-splitting)
- [最適化された非同期のチャンク読み込み](./features#async-chunk-loading-optimization)
- [自動的な dynamic import の polyfill](./features#dynamic-import-polyfill)
- 公式の [legacy モードプラグイン](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)。このプラグインは、modern/legacy のデュアルバンドルを生成し、ブラウザの対応状況をもとに正しいバンドルを自動的に配信します。

**より高速な依存関係の先読みビルド**

Vite は、依存関係の先読みビルドのために、[esbuild](https://esbuild.github.io/) ではなく Rollup を使用しています。その結果、コールドサーバーの起動と依存関係の無効化に伴う再バンドルに関して、極めて大きな性能向上が得られました。

**Monorepo のサポート**

Vite は monorepo のセットアップを意図して設計されており、Yarn、Yarn 2、PNPM ベースの monorepo を上手く使用しているユーザーが存在します。

**CSS プリプロセッサのサポート**

Vite は Sass および Less のより洗練されたサポートを提供しています。これには、優れた `@import` の解決（エイリアスおよび npm 依存関係）や、[インラインファイルに対する自動的な `url()` のリベース](./features#import-inlining-and-rebasing)などがあります。

**第1級の Vue サポート**

もともと Vite は、[Vue.js](https://vuejs.org/) のツールの将来の基礎を担う目的で開発されました。現在の2.0の Vite は完全にフレームワークに依存したものとなりましたが、公式の Vue プラグインは依然として Vue のシングルファイルコンポーネントのフォーマットに対して第1級のサポートを提供しています。テンプレートアセットリファレンス、`<script setup>`、`<style module>`、カスタムブロックを始めとした、あらゆる発展的な機能をカバーしています。さらに、Vite は Vue の SFC に対する細粒度の HMR を提供しています。たとえば、SFC の `<template>` や `<style>` を更新したとき、ステートをリセットせずにホットアップデートが実行可能です。

## WMR

Preact チームが開発した [WMR](https://github.com/preactjs/wmr) にも似たような機能群があり、Vite 2.0 の Rollup プラグインインターフェイスのサポートは、これに影響を受けています。

WMR は主に [Preact](https://preactjs.com/) プロジェクトのために開発されていて、プリレンダリングなどのより統合された機能を提供しています。スコープの点では、Preact meta framework に近いものです。Preact を使用しているなら、WMR はより洗練された経験をもたらしてくれるでしょう。

## @web/dev-server

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/)（旧称 `es-dev-server`）は素晴らしいプロジェクトです。Vite 1.0 の Koa ベースのサーバーのセットアップはこのプロジェクトに影響を受けたものです。

`@web/dev-server`はスコープの点では少し低レベルです。公式のフレームワークとの統合を提供しておらず、本番ビルドのためには Rollup の設定を手動でセットアップする必要があります。

全体として、Vite はより out-of-the-box なワークフローを提供することを目的とした opinionated で高レベルのツールです。しかし、`@web` アンブレラプロジェクト内には、その他にも Vite ユーザーにも役に立つ優れたツールが存在します。
