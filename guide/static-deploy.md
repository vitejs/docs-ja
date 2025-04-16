# 静的サイトのデプロイ

以下のガイドは、いくつかの共通の前提に基づいています:

- デフォルトのビルド出力場所（`dist`）を使用します。この場所は [`build.outDir` で変更することができます](/config/build-options.md#build-outdir)ので、その場合はこれらのガイドを読み替えてください。
- npm を使用します。Yarn や他のパッケージマネージャーを使用している場合は、同等のコマンドを使用してスクリプトを実行できます。
- Vite はプロジェクト内のローカルな dev dependency としてインストールされており、以下の npm スクリプトを設定しています。

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`vite preview` は、ローカルでビルドをプレビューするためのもので、本番用のサーバーとしては使えないことに注意してください。

::: tip 注意
このガイドは、Vite で静的サイトをデプロイするための手順を提供します。Vite は、サーバーサイドレンダリング（SSR）もサポートしています。SSR とは、Node.js で同じアプリケーションを実行し、それを HTML にプリレンダリングし、最終的にクライアント上でハイドレートすることをサポートするフロントエンドフレームワークを指します。この機能については、[SSR ガイド](./ssr)をご覧ください。一方、従来のサーバーサイドフレームワークとの統合を探している場合は、代わりに[バックエンドとの統合ガイド](./backend-integration)をチェックしてください。
:::

## アプリのビルド

アプリをビルドするために、`npm run build` コマンドを実行します。

```bash
$ npm run build
```

デフォルトでは、ビルド結果は `dist` に置かれます。この `dist` フォルダーを、お好みのプラットフォームにデプロイします。

## アプリをローカルでテストする

アプリをビルドしたら、`npm run preview` コマンドを実行し、ローカルでテストします。

```bash
$ npm run preview
```

`vite preview` コマンドは、ローカルで静的なウェブサーバーを起動し、`dist` のファイルを `http://localhost:4173` で配信します。これは、プロダクションビルドが問題ないかどうかを自分のローカル環境で確認する簡単な方法です。

サーバーのポートを設定するには、引数に `--port` フラグを指定します。

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

これで、`preview` コマンドは `http://localhost:8080` でサーバーを起動します。

## GitHub Pages

1. `vite.config.js` で `base` を正しく設定してください。

   `https://<USERNAME>.github.io/` や、GitHub Pages 経由のカスタムドメイン（例 `www.example.com`）にデプロイする場合、`base` を `'/'` に設定します。デフォルトは `'/'` なので、設定から `base` を削除することもできます。

   `https://<USERNAME>.github.io/<REPO>/` にデプロイする場合（例: リポジトリーは `https://github.com/<USERNAME>/<REPO>`）、`base` を `'/<REPO>/'` と設定してください。

2. リポジトリー設定ページにある GitHub Pages の設定から、デプロイ元を "GitHub Actions" にすることで、プロジェクトをビルドしてデプロイするワークフローを作成できます。npm を使用して依存関係をインストールし、ビルドするサンプルワークフローが提供されています:

   ```yml
   # 静的コンテンツを GitHub Pages にデプロイするためのシンプルなワークフロー
   name: Deploy static content to Pages

   on:
     # デフォルトブランチを対象としたプッシュ時にで実行されます
     push:
       branches: ['main']

     # Actions タブから手動でワークフローを実行できるようにします
     workflow_dispatch:

   # GITHUB_TOKEN のパーミッションを設定し、GitHub Pages へのデプロイを許可します
   permissions:
     contents: read
     pages: write
     id-token: write

   # 1 つの同時デプロイメントを可能にする
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # デプロイするだけなので、単一のデプロイジョブ
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         - name: Set up Node
           uses: actions/setup-node@v4
           with:
             node-version: lts/*
             cache: 'npm'
         - name: Install dependencies
           run: npm ci
         - name: Build
           run: npm run build
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             # dist フォルダーのアップロード
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## GitLab Pages と GitLab CI

1. `vite.config.js` で `base` を正しく設定してください。

   `https://<USERNAME or GROUP>.gitlab.io/` にデプロイする場合、`base` はデフォルトで `'/'` となるのでこれを省略できます。

   `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` にデプロイする場合、例えばリポジトリーが `https://gitlab.com/<USERNAME>/<REPO>` にあるなら、`base` を `'/<REPO>/'` と設定してください。

2. プロジェクトルートに、`.gitlab-ci.yml` という名前でファイルを作成し、以下のように記述してください。これで、コンテンツを変更するたびにサイトのビルドとデプロイが行われます:

   ```yaml [.gitlab-ci.yml]
   image: node:lts
   pages:
     stage: deploy
     cache:
       key:
         files:
           - package-lock.json
         prefix: npm
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
       - cp -a dist/. public/
     artifacts:
       paths:
         - public
     rules:
       - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
   ```

## Netlify

### Netlify CLI

1. [Netlify CLI](https://cli.netlify.com/) をインストールします。
2. `ntl init` で新しいサイトを作成します。
3. `ntl deploy` でデプロイします。

```bash
# Netlify CLI をインストール
$ npm install -g netlify-cli

# Netlify に新しいサイトを作成
$ ntl init

# ユニークなプレビュー URL にデプロイ
$ ntl deploy
```

Netlify CLI は検査のためにプレビュー URL を共有します。本番環境への準備ができたら `prod` フラグを使用してください:

```bash
# サイトを本番環境へデプロイ
$ ntl deploy --prod
```

### Netlify with Git

1. コードを Git リポジトリー（GitHub, GitLab, Bitbucket, Azure DevOps）にプッシュします。
2. Netlify に[プロジェクトをインポート](https://app.netlify.com/start)します。
3. ブランチ、出力ディレクトリーを選び、必要に応じて環境変数を設定します。
4. **Deploy** をクリックします。
5. アプリケーションがデプロイされます！

プロジェクトがインポートされてデプロイされた後は、プルリクエストを伴ったプロダクションブランチ以外のブランチへのプッシュはすべて[プレビューデプロイメント](https://docs.netlify.com/site-deploys/deploy-previews/)を生成し、プロダクションブランチ（一般には main）に加えられたすべての変更は[プロダクションデプロイメント](https://docs.netlify.com/site-deploys/overview/#definitions)を生成することになります。

## Vercel

### Vercel CLI

1. [Vercel CLI](https://vercel.com/cli) をインストールし、`vercel` を実行してデプロイします。
2. Vercel はあなたが Vite を使用していることを検出し、あなたのデプロイメントのための正しい設定を有効にします。
3. アプリケーションがデプロイされます！（例: [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/)）

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel for Git

1. コードを Git リポジトリー（GitHub, GitLab, Bitbucket）にプッシュします。
2. Vercel に [Vite プロジェクトをインポート](https://vercel.com/new)します。
3. Vercel はあなたが Vite を使用していることを検出し、あなたのデプロイメントのための正しい設定を有効にします。
4. アプリケーションがデプロイされます！（例: [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/)）

プロジェクトがインポートされてデプロイされた後は、ブランチへのプッシュはすべて[プレビューデプロイメント](https://vercel.com/docs/concepts/deployments/environments#preview)を生成し、プロダクションブランチ（一般には main）に加えられたすべての変更は[プロダクションデプロイメント](https://vercel.com/docs/concepts/deployments/environments#production)を生成することになります。

詳細は Vercel の [Git 統合](https://vercel.com/docs/concepts/git)をご覧ください。

## Cloudflare Pages

### Cloudflare Pages via Wrangler

1. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) をインストールします。
2. `wrangler login` を使って、Cloudflare アカウントで Wrangler を認証します。
3. ビルドコマンドを実行します。
4. `npx wrangler pages deploy dist` を使ってデプロイします。

```bash
# Wrangler CLI をインストール
$ npm install -g wrangler

# CLI から Cloudflare アカウントへログイン
$ wrangler login

# ビルドコマンドの実行
$ npm run build

# 新しいデプロイの作成
$ npx wrangler pages deploy dist
```

生成物のアップロード後、Wrangler はサイトの確認のためのプレビュー URL を表示します。Cloudflare Pages ダッシュボートにログインすると、新しいプロジェクトが表示されます。

### Cloudflare Pages with Git

1. git リポジトリー（GitHub、GitLab）にコードをプッシュします。
2. Cloudflare ダッシュボードにログインし、**Account Home** &gt; **Pages** でアカウントを選択します。
3. **Create a new Project** と **Connect Git** オプションを選択します。
4. デプロイしたい git プロジェクトを選択し、**Begin setup** をクリックします。
5. 選択した Vite のフレームワークに基づいて、ビルド設定の対応するフレームワークプリセットを選択します。
6. セーブしてデプロイします！
7. アプリケーションがデプロイされます！（例: `https://<PROJECTNAME>.pages.dev/`）

プロジェクトのインポートとデプロイ後、以降のブランチへのプッシュは [branch build controls](https://developers.cloudflare.com/pages/platform/branch-build-controls/) で停止しない限り[プレビューデプロイ](https://developers.cloudflare.com/pages/platform/preview-deployments/)を生成します。本番ブランチ（一般的には「main」）への全ての変更は本番へデプロイされます。

Pages ではカスタムドメインの追加やカスタムビルドの設定が行えます。詳しくは  [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/get-started/#manage-your-site) をご覧ください。

## Google Firebase

1. [firebase-tools](https://www.npmjs.com/package/firebase-tools) をインストールしていることを確認してください。

2. プロジェクトルートに `firebase.json` と `.firebaserc` を作成し、以下のように記述してください:

   ```json [firebase.json]
   {
     "hosting": {
       "public": "dist",
       "ignore": [],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

   ```js [.firebaserc]
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

3. `npm run build` を実行した後、`firebase deploy` コマンドでデプロイしてください。

## Surge

1. まだインストールしていなければ、[surge](https://www.npmjs.com/package/surge) をインストールしてください。

2. `npm run build` を実行してください。

3. `surge dist` とタイプし、surge にデプロイしてください。

`surge dist yourdomain.com` とすることで、[カスタムドメイン](http://surge.sh/help/adding-a-custom-domain)にデプロイすることもできます。

## Azure Static Web Apps

Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps) サービスを使って、Vite アプリを素早くデプロイできます。必要なもの:

- Azure アカウントとサブスクリプションキー。[無料で Azure アカウント](https://azure.microsoft.com/free)を作成できます。
- [GitHub](https://github.com) にプッシュされたアプリのコード。
- [Visual Studio Code](https://code.visualstudio.com) の [SWA 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)。

VS Code に拡張機能をインストールし、アプリのルートに移動してください。Static Web Apps 拡張機能を開き、Azure にサインインし、'+' マークをクリックして新しい Static Web App を作成してください。使用するサブスクリプションキーを指定するプロンプトが表示されます。

拡張機能が起動するウィザードに従って、アプリの名前を決め、フレームワークのプリセットを選択し、アプリのルート（通常は `/`）とビルドファイルの場所 `/dist` を指定します。ウィザードが実行されると、リポジトリーの `.github` フォルダーに GitHub アクションが作成されます。

このアクションが実行されると、アプリがデプロイされます（進行状況はリポジトリーの Actions タブで確認できます）。正常に完了すると、GitHub アクション実行時に表示される 'Browse Website' ボタンをクリックすることで、拡張機能の進行状況ウィンドウで指定されたアドレスでアプリを見ることができます。

## Render

[Render](https://render.com/)に静的サイトとして Vite アプリをデプロイできます。

1. [Render アカウント](https://dashboard.render.com/register)を作成できます。

2. [ダッシュボート](https://dashboard.render.com/)で、**New** ボタンをクリックし **Static Site** を選択します。

3. GitHub/GitLab アカウントを連携するかパブリックリポジトリーを利用します。

4. プロジェクト名とブランチを指定します。

   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. **Create Static Site** をクリックします。

   アプリが `https://<PROJECTNAME>.onrender.com/` にデプロイされるはずです。

デフォルトでは、指定したブランチへコミットがプッシュされると自動的に新しいデプロイを開始します。[Auto-Deploy](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) はプロジェクト設定で変更できます。

プロジェクトに [custom domain](https://render.com/docs/custom-domains) も追加できます。

<!--
  NOTE: The sections below are reserved for more deployment platforms not listed above.
  Feel free to submit a PR that adds a new section with a link to your platform's
  deployment guide, as long as it meets these criteria:

  1. Users should be able to deploy their site for free.
  2. Free tier offerings should host the site indefinitely and are not time-bound.
     Offering a limited number of computation resource or site counts in exchange is fine.
  3. The linked guides should not contain any malicious content.

  The Vite team may change the criteria and audit the current list from time to time.
  If a section is removed, we will ping the original PR authors before doing so.
-->

## Flightcontrol

[Flightcontrol](https://www.flightcontrol.dev/?ref=docs-vite) を使用して静的サイトをデプロイする場合はこの[案内](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite)に従ってください。

## Kinsta 静的サイトホスティング

[Kinsta](https://kinsta.com/static-site-hosting/) を使用して静的サイトをデプロイする場合はこの[案内](https://kinsta.com/docs/react-vite-example/)に従ってください。

## xmit 静的サイトホスティング

[xmit](https://xmit.co) を使用して静的サイトをデプロイする場合はこの[ガイド](https://xmit.dev/posts/vite-quickstart/)に従ってください。
