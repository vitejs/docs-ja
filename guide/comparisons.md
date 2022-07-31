# 比較

## WMR

Preact チームが開発した [WMR](https://github.com/preactjs/wmr) にも似たような機能群があり、Vite 2.0 の Rollup プラグインインタフェイスのサポートは、これに影響を受けています。

WMR は主に [Preact](https://preactjs.com/) プロジェクトのために開発されていて、プリレンダリングなどのより統合された機能を提供しています。スコープの点では、Preact meta framework に近いものです。Preact を使用しているなら、WMR はより洗練された経験をもたらしてくれるでしょう。

## @web/dev-server

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/)（旧称 `es-dev-server`）は素晴らしいプロジェクトです。Vite 1.0 の Koa ベースのサーバのセットアップはこのプロジェクトに影響を受けたものです。

`@web/dev-server` はスコープの点では少し低レベルです。公式のフレームワークとの統合を提供しておらず、本番ビルドのためには Rollup の設定を手動でセットアップする必要があります。

全体として、Vite はより out-of-the-box なワークフローを提供することを目的とした opinionated で高レベルのツールです。しかし、`@web` アンブレラプロジェクト内には、その他にも Vite ユーザにも役に立つ優れたツールが存在します。

## Snowpack

[Snowpack](https://www.snowpack.dev/) も no-bundle ネイティブな ESM の開発サーバで、Vite と非常に近い目的を持っています。このプロジェクトは今ではメンテナンスされていません。現在、Snowpack チームは Vite を利用した静的サイトビルダーである [Astro](https://astro.build/) の開発に取り組んでいます。Astro チームは現在、エコシステムでの活発なプレイヤーであり、Vite の改良に貢献しています。

実装の詳細が異なる点を除き、2 つのプロジェクトは伝統的なツールより技術的に優れている点で非常に多くの共通点があります。Vite の依存関係の事前ビルドの機能は、Snowpack v1（現在の[`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall)）にも影響を受けています。2 つのプロジェクト間の大きな違いは、[v2の比較ガイド](https://v2.vitejs.dev/guide/comparisons) に列挙されています。
