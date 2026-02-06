# プラグイン

:::tip NOTE
Vite は、一般的な Web 開発パターンをすぐに使えるようにサポートすることを目的としています。Vite や互換性のある Rollup プラグインを探す前に、 [特徴ガイド](../guide/features.md) を確認してください。 Rollup プロジェクトでプラグインが必要になる多くのケースは、 Vite ですでにカバーされています。
:::

プラグインの使い方については[プラグインの使用](../guide/using-plugins)を参照ください。

## 公式プラグイン

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

Vue 3 の単一ファイルコンポーネントのサポートを提供します。

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

Vue 3 の JSX（[専用の Babel transform](https://github.com/vuejs/babel-plugin-jsx) を介して）のサポートを提供します。

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

[Oxc Transformer](https://oxc.rs/docs/guide/usage/transformer) と [Babel](https://babeljs.io/) を使用し、小さなパッケージフットプリントで高速な HMR や、Babel 変換パイプラインを使用できる柔軟性を実現します。Babel プラグインを追加しない場合は、Oxc Transformer のみが使用されます。

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc)

開発中は Babel を [SWC](https://swc.rs/) に置き換えます。プロダクションビルド時には、プラグインを使用する場合は SWC+Oxc Transformer、それ以外は Oxc Transformer のみを使用します。カスタムプラグインが必要な大きなプロジェクトでは、そのプラグインが SWC でも利用可能な場合、コールドスタートやホットモジュールリプレースメント（HMR）が大幅に高速化されます。

### [@vitejs/plugin-rsc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc)

Vite はこのプラグインを通して [React サーバーコンポーネント（RSC）](https://react.dev/reference/rsc/server-components)をサポートしています。このプラグインは、React フレームワークが RSC 機能を統合するために使用できる低レベルのプリミティブを提供する [Environment API](/guide/api-environment) を利用しています。以下を実行してミニマルなスタンドアロン RSC アプリケーションを試すことができます:

```bash
npm create vite@latest -- --template rsc
```

詳しくは [プラグインドキュメント](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc) をお読みください。

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

本番環境向けにレガシーブラウザーのサポートを提供します。

## コミュニティープラグイン

npm に公開されているプラグインの一覧は [Vite Plugin Registry](https://registry.vite.dev/plugins) を確認してみてください。

## Rolldown 組み込みプラグイン

Vite は内部で [Rolldown](https://rolldown.rs/) を使用しており、一般的なユースケースのために組み込みプラグインをいくつか提供しています。

詳細については [Rolldown 組み込みプラグインのセクション](https://rolldown.rs/builtin-plugins/)をお読みください。

## Rolldown / Rollup プラグイン

[Vite プラグイン](../guide/api-plugin)は、Rollup プラグインのインターフェイスを拡張したものです。[Rollup プラグインとの互換性セクション](../guide/api-plugin#rolldown-plugin-compatibility)に詳しい情報があります。
