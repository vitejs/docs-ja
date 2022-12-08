# プラグイン

:::tip NOTE
Vite は、一般的な Web 開発パターンをすぐに使えるようにサポートすることを目的としています。Vite や互換性のある Rollup プラグインを探す前に、 [特徴ガイド](../guide/features.md) を確認してください。 Rollup プロジェクトでプラグインが必要になる多くのケースは、 Vite ですでにカバーされています。
:::

プラグインの使い方については[プラグインの使用](../guide/using-plugins)を参照ください。

## 公式プラグイン

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Vue 3 の単一ファイルコンポーネントのサポートを提供します。

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Vue 3 の JSX（[専用の Babel transform](https://github.com/vuejs/jsx-next) を介して）のサポートを提供します。

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- オールインワンの React サポートを提供します。

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- 本番環境向けにレガシーブラウザのサポートを提供します。

## コミュニティプラグイン

[awesome-vite](https://github.com/vitejs/awesome-vite#plugins) を確認してみてください - あなたのプラグインを掲載するために PR を出すこともできます。

## Rollup プラグイン

[Vite プラグイン](../guide/api-plugin) は、Rollup プラグインのインタフェイスを拡張したものです。 [Rollup プラグインとの互換性セクション](../guide/api-plugin#rollup-プラグインの互換性) に詳しい情報があります。
