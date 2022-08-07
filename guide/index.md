# はじめに

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## 概要

Vite（フランス語で「素早い」という意味の単語で `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button> ヴィートのように発音）は、現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。2 つの主要な部分で構成されています:

- 非常に高速な [Hot Module Replacement (HMR)](./features#hot-module-replacement) など、[ネイティブ ES モジュール](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)を利用した[豊富な機能拡張](./features)を提供する開発サーバ。

- [Rollup](https://rollupjs.org) でコードをバンドルするビルドコマンド。プロダクション用に高度に最適化された静的アセットを出力するように事前に設定されています。

Vite はすぐに使える実用的なデフォルトが付属していて、プロジェクト生成された構成のままで使えるように設計されていますが、完全な型サポートのある [Plugin API](./api-plugin) と [JavaScript API](./api-javascript) によって高い拡張性もあります。

プロジェクトの背景にある基本原理について、[なぜ Vite なのか](./why) セクションで詳しく知ることができます。

## ブラウザ対応

デフォルトのビルドは [ネイティブ ES モジュール](https://caniuse.com/es6-module)、[ネイティブ ESM のダイナミックインポート](https://caniuse.com/es6-module-dynamic-import)、[`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta)に対応しているブラウザが対象です。レガシーブラウザは公式の [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) でサポートされています。詳細は [本番環境用のビルド](./build) セクションをご覧ください。

## Vite をオンラインで試す

[StackBlitz](https://vite.new/) で Vite をオンラインで試すことができます。Vite ベースのビルドセットアップをブラウザ上で直接実行するので、ローカルセットアップとほぼ同じですが、マシンに何もインストールする必要がありません。`vite.new/{template}` に移動して、使用するフレームワークを選択できます。

サポートされているテンプレートのプリセットは次のとおりです:

|             JavaScript              |                TypeScript                 |
| :---------------------------------: | :---------------------------------------: |
| [vanilla](https://vite.new/vanilla) | [vanilla-ts](https://vite.new/vanilla-ts) |
|     [vue](https://vite.new/vue)     |     [vue-ts](https://vite.new/vue-ts)     |
|   [react](https://vite.new/react)   |   [react-ts](https://vite.new/react-ts)   |
|  [preact](https://vite.new/preact)  |  [preact-ts](https://vite.new/preact-ts)  |
|     [lit](https://vite.new/lit)     |     [lit-ts](https://vite.new/lit-ts)     |
|  [svelte](https://vite.new/svelte)  |  [svelte-ts](https://vite.new/svelte-ts)  |

## 最初の Vite プロジェクトを生成する

::: tip 互換性について
Vite は [Node.js](https://nodejs.org/en/) 14.18+、16+ のバージョンが必要です。ただし、一部のテンプレートではそれ以上のバージョンの Node.js を必要としますので、パッケージマネージャが警告を出した場合はアップグレードしてください。
:::

NPM を使う場合:

```bash
$ npm create vite@latest
```

Yarn を使う場合:

```bash
$ yarn create vite
```

PNPM を使う場合:

```bash
$ pnpm create vite
```

あとは画面表示に従ってください！

プロジェクト名や使用するテンプレートは、追加のコマンドラインオプションによって直接指定することもできます。例えば Vite + Vue のプロジェクトを生成するには以下のコマンドを実行します:

```bash
# npm 6.x
npm create vite@latest my-vue-app --template vue

# npm 7+ は追加で 2 つのダッシュが必要:
npm create vite@latest my-vue-app -- --template vue

# yarn
yarn create vite my-vue-app --template vue

# pnpm
pnpm create vite my-vue-app --template vue
```

サポートされている各テンプレートの詳細は [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) を参照してください: `vanilla`, `vanilla-ts`, `vue`, `vue-ts`, `react`, `react-ts`, `preact`, `preact-ts`, `lit`, `lit-ts`, `svelte`, `svelte-ts`.

## コミュニティのテンプレート

create-vite はよく使われているフレームワークの基本的なテンプレートを元に、プロジェクトをすばやく開始するためのツールです。他のツールを含んでいたり、別のフレームワークを対象としている、[コミュニティが管理しているテンプレート](https://github.com/vitejs/awesome-vite#templates)については Awesome Vite をチェックしてみてください。[degit](https://github.com/Rich-Harris/degit) のようなツールを使って、これらのテンプレートからプロジェクトを生成できます。

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

お気づきかもしれませんが、Vite プロジェクトでは `index.html` は `public` 内に隠れているのではなく、最も目立つ場所にあります。これは意図的なものです。開発中、Vite はサーバで、`index.html` はアプリケーションのエントリポイントです。

Vite は `index.html` をソースコードとして、またモジュールグラフの一部として扱います。JavaScript のソースコードを参照している `<script type="module" src="...">` を解決します。インラインの `<script type="module">` や `<link href>` で参照される CSS も Vite 固有の機能を利用できます。さらに、`index.html` 内の URL は自動的にリベースされるため、特別な `%PUBLIC_URL%` プレースホルダは必要ありません。

静的な http サーバと同様に、Vite には、ファイルの提供元となる「ルートディレクトリ」の概念があります。ドキュメントの残りの部分では `<root>` として示されています。ソースコード内の絶対 URL は、プロジェクトルートをベースとして使って解決されるため、通常の静的ファイルサーバを使用しているかのようにコードを記述できます（遥かに強力であることを除いては！）。Vite はルート外のファイルシステムの場所に解決される依存関係を処理することもできるため、モノレポベースの構成でも使用できます。

Vite は複数の `.html` エントリポイントを持つ[マルチページアプリ](./build#マルチページアプリ)にも対応しています。

#### 代替ルートの指定

`vite` を実行すると、現在の作業ディレクトリをルートとして使用する開発サーバが起動します。`vite serve some/sub/dir` で代替ルートを指定できます。

## コマンドラインインタフェイス

Vite がインストールされているプロジェクトでは npm スクリプトで `vite` バイナリを使用したり、`npx vite` で直接実行できます。生成された Vite プロジェクトのデフォルトの npm スクリプトは次のとおりです:

<!-- prettier-ignore -->
```json
{
  "scripts": {
    "dev": "vite", // 開発サーバを起動。エイリアス: `vite dev`, `vite serve`
    "build": "vite build", // プロダクション用にビルド
    "preview": "vite preview" // プロダクション用ビルドをローカルでプレビュー
  }
}
```

`--port` や `--https` のような追加の CLI オプションを指定できます。すべての CLI オプションのリストは、プロジェクト内で `npx vite --help` を実行してください。

## 未リリースのコミットの使用

最新機能を試すために新しいリリースを待つことができない場合は、ローカルマシンに [vite repo](https://github.com/vitejs/vite) をクローンしてから自分でビルドとリンクをする必要があります（[pnpm](https://pnpm.io/) が必要）:

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # このステップでは好きなパッケージマネージャを使用できます
```

その後 Vite ベースのプロジェクトに移動し、`pnpm link --global vite`（または、`vite` をグローバルにリンクするために使用したパッケージマネージャ）を実行してください。そして開発サーバを再起動して最先端の技術に乗っていきましょう！

## コミュニティ

質問がある場合やサポートが必要な場合は、[Discord](https://chat.vitejs.dev) や [GitHub Discussions](https://github.com/vitejs/vite/discussions) でコミュニティに連絡してください。
