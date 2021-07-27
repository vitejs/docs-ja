# はじめに

## 概要

Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）は、現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。2 つの主要な部分で構成されています:

- 非常に高速な [Hot Module Replacement (HMR)](./features#hot-module-replacement) など、[ネイティブ ES モジュール](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)を利用した[豊富な機能拡張](./features)を提供する開発サーバー。

- [Rollup](https://rollupjs.org) でコードをバンドルするビルドコマンド。プロダクション用に高度に最適化された静的アセットを出力するように事前に設定されています。

Vite はすぐに使える実用的なデフォルトが付属していて、プロジェクト生成された構成のままで使えるように設計されていますが、完全な型サポートのある [Plugin API](./api-plugin) と [JavaScript API](./api-javascript) によって高い拡張性もあります。

プロジェクトの背景にある基本原理について、[Why Vite](./why) セクションで詳しく知ることができます。

## ブラウザ対応

- デフォルトのビルドは [script タグでのネイティブ ESM 読込](https://caniuse.com/es6-module)と[ネイティブ ESM のダイナミックインポート](https://caniuse.com/es6-module-dynamic-import)の両方に対応しているブラウザが対象です。レガシーブラウザは公式の [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) でサポートされています。詳細は [Building for Production](./build) セクションをご覧ください。

## 最初の Vite プロジェクトを生成する

::: tip 互換性について
Vite は [Node.js](https://nodejs.org/en/) >=12.0.0 のバージョンが必要です。
:::

NPM を使う場合:

```bash
$ npm init vite@latest
```

Yarn を使う場合:

```bash
$ yarn create vite
```

PNPM を使う場合:

```bash
$ pnpx create-vite
```

あとは画面表示に従ってください！

プロジェクト名や使用するテンプレートは、追加のコマンドラインオプションによって直接指定することもできます。例えば Vite + Vue のプロジェクトを生成するには以下のコマンドを実行します:

```bash
# npm 6.x
npm init vite@latest my-vue-app --template vue

# npm 7+ は追加で 2 つのダッシュが必要:
npm init vite@latest my-vue-app -- --template vue

# yarn
yarn create vite my-vue-app --template vue
```

サポートされているテンプレートプリセットは以下のとおりです:

- `vanilla`
- `vanilla-ts`
- `vue`
- `vue-ts`
- `react`
- `react-ts`
- `preact`
- `preact-ts`
- `lit-element`
- `lit-element-ts`
- `svelte`
- `svelte-ts`

各テンプレートの詳細は [@vitejs/create-app](https://github.com/vitejs/vite/tree/main/packages/create-app) を参照してください。

## コミュニティのテンプレート

@vitejs/create-app はよく使われているフレームワークの基本的なテンプレートを元に、プロジェクトをすばやく開始するためのツールです。他のツールを含んでいたり、別のフレームワークを対象としている、[コミュニティが管理しているテンプレート](https://github.com/vitejs/awesome-vite#templates)については Awesome Vite をチェックしてみてください。[degit](https://github.com/Rich-Harris/degit) のようなツールを使って、これらのテンプレートからプロジェクトを生成できます。

```bash
npx degit user/project my-project
cd my-project

npm install
npm run dev
```

テンプレートのプロジェクトがデフォルトブランチとして `main` を使っている場合は、プロジェクトリポジトリの末尾に `#main` をつけてください。

```bash
npx degit user/project#main my-project
```

## `index.html` とプロジェクトルート

お気づきかもしれませんが、Vite プロジェクトでは `index.html` は `public` 内に隠れているのではなく、最も目立つ場所にあります。これは意図的なものです。開発中、Vite はサーバーで、`index.html` はアプリケーションのエントリーポイントです。

Vite は `index.html` をソースコードとして、またモジュールグラフの一部として扱います。JavaScript のソースコードを参照している `<script type="module" src="...">` を解決します。インラインの `<script type="module">` や `<link href>` で参照される CSS も Vite 固有の機能を利用できます。さらに、`index.html` 内の URL は自動的にリベースされるため、特別な `%PUBLIC_URL%` プレースホルダは必要ありません。

静的な http サーバーと同様に、Vite には、ファイルの提供元となる「ルートディレクトリ」の概念があります。ドキュメントの残りの部分では `<root>` として示されています。ソースコード内の絶対 URL は、プロジェクトルートをベースとして使って解決されるため、通常の静的ファイルサーバーを使用しているかのようにコードを記述できます（より強力な方法を除く）。Vite はルート外のファイルシステムの場所に解決される依存関係を処理することもできるため、モノレポベースの構成でも使用できます。

Vite は複数の `.html` エントリーポイントを持つ[マルチページアプリ](./build#multi-page-app)にも対応しています。

#### 代替ルートの指定

`vite` を実行すると、現在の作業ディレクトリをルートとして使用する開発サーバーが起動します。`vite serve some/sub/dir` で代替ルートを指定できます。

## コマンドラインインタフェース

Vite がインストールされているプロジェクトでは npm スクリプトで `vite` バイナリを使用したり、`npx vite` で直接実行できます。生成された Vite プロジェクトのデフォルトの npm スクリプトは次のとおりです:

```json
{
  "scripts": {
    "dev": "vite", // 開発サーバーを起動
    "build": "vite build", // プロダクション用にビルド
    "serve": "vite preview" // プロダクション用ビルドをローカルでプレビュー
  }
}
```

`--port` や `--https` のような追加の CLI オプションを指定できます。すべての CLI オプションのリストは、プロジェクト内で `npx vite --help` を実行してください。

## 未リリースのコミットの使用

最新機能を試すために新しいリリースを待つことができない場合は、ローカルマシンに [vite repo](https://github.com/vitejs/vite) をクローンしてから自分でビルドとリンクをする必要があります（[Yarn 1.x](https://classic.yarnpkg.com/lang/en/) が必要）:

```bash
git clone https://github.com/vitejs/vite.git
cd vite
yarn
cd packages/vite
yarn build
yarn link
```

その後 vite ベースのプロジェクトに移動し、`yarn link vite` を実行してください。そして開発サーバーを再起動（`yarn dev`）して最先端の技術に乗っていきましょう！

## コミュニティ

質問がある場合やサポートが必要な場合は、[Discord](https://discord.gg/4cmKdMfpU5) や [GitHub Discussions](https://github.com/vitejs/vite/discussions) でコミュニティに連絡してください。
