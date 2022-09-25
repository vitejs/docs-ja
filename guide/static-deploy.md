# 静的サイトのデプロイ

以下のガイドは、いくつかの共通の前提に基づいています:

- デフォルトのビルド出力場所（`dist`）を使用します。この場所は [`build.outDir` で変更することができます](/config/build-options.md#build-outdir)ので、その場合はこれらのガイドを読み替えてください。
- npm を使用します。Yarn や他のパッケージマネージャを使用している場合は、同等のコマンドを使用してスクリプトを実行できます。
- Vite はプロジェクト内のローカルな dev dependency としてインストールされており、以下の npm スクリプトを設定しています。

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`vite preview` は、ローカルでビルドをプレビューするためのもので、本番用のサーバとしては使えないことに注意してください。

::: tip 注意
このガイドは、Vite で静的サイトをデプロイするための手順を提供します。Vite は、サーバサイドレンダリング（SSR）もサポートしています。SSR とは、Node.js で同じアプリケーションを実行し、それを HTML にプリレンダリングし、最終的にクライアント上でハイドレートすることをサポートするフロントエンドフレームワークを指します。この機能については、[SSR ガイド](./ssr)をご覧ください。一方、従来のサーバサイドフレームワークとの統合を探している場合は、代わりに[バックエンドとの統合ガイド](./backend-integration)をチェックしてください。
:::

## アプリのビルド

アプリをビルドするために、`npm run build` コマンドを実行します。

```bash
$ npm run build
```

デフォルトでは、ビルド結果は `dist` に置かれます。この `dist` フォルダを、お好みのプラットフォームにデプロイします。

## アプリをローカルでテストする

アプリをビルドしたら、`npm run preview` コマンドを実行し、ローカルでテストします。

```bash
$ npm run build
$ npm run preview
```

`vite preview` コマンドは、ローカルで静的なウェブサーバを起動し、`dist` のファイルを `http://localhost:4173` で配信します。これは、プロダクションビルドが問題ないかどうかを自分のローカル環境で確認する簡単な方法です。

サーバのポートを設定するには、引数に `--port` フラグを指定します。

```json
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

これで、`preview` コマンドは `http://localhost:8080` でサーバを起動します。

## GitHub Pages

1. `vite.config.js` で `base` を正しく設定してください。

   `https://<USERNAME>.github.io/` にデプロイする場合、`base` はデフォルトで `'/'` となるのでこれを省略できます。

   `https://<USERNAME>.github.io/<REPO>/` にデプロイする場合、例えばリポジトリが `https://github.com/<USERNAME>/<REPO>` にあるなら、`base` を `'/<REPO>/'` と設定してください。

2. プロジェクト内で以下の内容の `deploy.sh` を作成し（ハイライトされた行はコメントアウトされています）、これを実行してデプロイしてください:

   ```bash{13,21,24}
   #!/usr/bin/env sh

   # エラー時は停止
   set -e

   # ビルド
   npm run build

   # ビルド出力ディレクトリに移動
   cd dist

   # カスタムドメインにデプロイする場合
   # echo 'www.example.com' > CNAME

   git init
   git checkout -b main
   git add -A
   git commit -m 'deploy'

   # https://<USERNAME>.github.io にデプロイする場合
   # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

   # https://<USERNAME>.github.io/<REPO> にデプロイする場合
   # git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

   cd -
   ```

::: tip
また、CI の設定で上記のスクリプトを実行することで、プッシュごとの自動デプロイを有効にすることができます。
:::

## GitLab Pages と GitLab CI

1. `vite.config.js` で `base` を正しく設定してください。

   `https://<USERNAME or GROUP>.gitlab.io/` にデプロイする場合、`base` はデフォルトで `'/'` となるのでこれを省略できます。

   `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` にデプロイする場合、例えばリポジトリが `https://gitlab.com/<USERNAME>/<REPO>` にあるなら、`base` を `'/<REPO>/'` と設定してください。

2. プロジェクトルートに、`.gitlab-ci.yml` という名前でファイルを作成し、以下のように記述してください。これで、コンテンツを変更するたびにサイトのビルドとデプロイが行われます:

   ```yaml
   image: node:16.5.0
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

1. コードを Git リポジトリ（GitHub, GitLab, Bitbucket）にプッシュします。
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
4. `npx wrangler pages publish dist` を使ってデプロイします。

```bash
# Wrangler CLI をインストール
$ npm install -g wrangler

# CLI から Cloudflare アカウントへログイン
$ wrangler login

# ビルドコマンドの実行
$ npm run build

# 新しいデプロイの作成
$ npx wrangler pages publish dist
```

生成物のアップロード後、Wrangler はサイトの確認のためのプレビュー URL を表示します。Cloudflare Pages ダッシュボートにログインすると、新しいプロジェクトが表示されます。

### Cloudflare Pages with Git

1. git リポジトリ (GitHub、GitLab) にコードをプッシュします。
2. Cloudflare ダッシュボードにログインし、**Account Home** &gt; **Pages** でアカウントを選択します。
3. **Create a new Project** と **Connect Git** オプションを選択します。
4. デプロイしたい git プロジェクトを選択し、**Begin setup** をクリックします。
5. 選択した Vite のフレームワークに基づいて、ビルド設定の対応するフレームワークプリセットを選択します。
6. セーブしてデプロイします！
7. アプリケーションがデプロイされます！　(例: `https://<PROJECTNAME>.pages.dev/`)

プロジェクトのインポートとデプロイ後、以降のブランチへのプッシュは [branch build controls](https://developers.cloudflare.com/pages/platform/branch-build-controls/) で停止しない限り[プレビューデプロイ](https://developers.cloudflare.com/pages/platform/preview-deployments/)を生成します。本番ブランチ (一般的には「main」) への全ての変更は本番へデプロイされます。

Pages ではカスタムドメインの追加やカスタムビルドの設定が行えます。詳しくは  [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/get-started/#manage-your-site) をご覧ください。

## Google Firebase

1. [firebase-tools](https://www.npmjs.com/package/firebase-tools) をインストールしていることを確認してください。

2. プロジェクトルートに `firebase.json` と `.firebaserc` を作成し、以下のように記述してください:

   `firebase.json`:

   ```json
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

   `.firebaserc`:

   ```js
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

## Heroku

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) をインストールしてください。

2. [サインアップ](https://signup.heroku.com)して Heroku アカウントを作成してください。

3. `heroku login` を実行し、Heroku の認証情報を入力してください:

   ```bash
   $ heroku login
   ```

4. プロジェクトルートに `static.json` という名前でファイルを作成し、以下のように記述してください:

   `static.json`:

   ```json
   {
     "root": "./dist"
   }
   ```

   これはあなたのサイトの設定です。詳しくは [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static) をご覧ください。

5. Heroku の Git リモートを設定してください:

   ```bash
   # バージョン更新
   $ git init
   $ git add .
   $ git commit -m "My site ready for deployment."

   # 名前を指定して新しいアプリを作成
   $ heroku apps:create example
   ```

6. buildpacks の設定。`heroku/nodejs` でプロジェクトをビルドし、それを `heroku-buildpack-static` で配信します。

   ```bash
   # buildpacks を設定
   $ heroku buildpacks:set heroku/nodejs
   $ heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

7. サイトをデプロイしてください:

   ```bash
   # サイトを公開
   $ git push heroku main

   # ブラウザを開いて Heroku CI ダッシュボードを見る
   $ heroku open
   ```

## Azure Static Web Apps

Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps) サービスを使って、Vite アプリを素早くデプロイすることができます。必要なもの:

- Azure アカウントとサブスクリプションキー。[無料で Azure アカウント](https://azure.microsoft.com/free)を作成できます。
- [GitHub](https://github.com) にプッシュされたアプリのコード。
- [Visual Studio Code](https://code.visualstudio.com) の [SWA 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)。

VS Code に拡張機能をインストールし、アプリのルートに移動してください。Static Web Apps 拡張機能を開き、Azure にサインインし、'+' マークをクリックして新しい Static Web App を作成してください。使用するサブスクリプションキーを指定するプロンプトが表示されます。

拡張機能が起動するウィザードに従って、アプリの名前を決め、フレームワークのプリセットを選択し、アプリのルート（通常は `/`）とビルドファイルの場所 `/dist` を指定します。ウィザードが実行されると、リポジトリの `.github` フォルダに GitHub アクションが作成されます。

このアクションが実行されると、アプリがデプロイされます（進行状況はリポジトリの Actions タブで確認できます）。正常に完了すると、GitHub アクション実行時に表示される 'Browse Website' ボタンをクリックすることで、拡張機能の進行状況ウィンドウで指定されたアドレスでアプリを見ることができます。

## Render

[Render](https://render.com/)に静的サイトとして Vite アプリをデプロイできます。

1. [Render アカウント](https://dashboard.render.com/register)を作成できます。

2. [ダッシュボート](https://dashboard.render.com/)で、**New** ボタンをクリックし **Static Site** を選択します。

3. GitHub/GitLab アカウントを連携するかパブリックリポジトリを利用します。

4. プロジェクト名とブランチを指定します。

   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

5. **Create Static Site** をクリックします。

   アプリが `https://<PROJECTNAME>.onrender.com/` にデプロイされるはずです。

デフォルトでは、指定したブランチへコミットがプッシュされると自動的に新しいデプロイを開始します。[Auto-Deploy](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) はプロジェクト設定で変更できます。

プロジェクトに [custom domain](https://render.com/docs/custom-domains) も追加できます。
