# Deploying a Static Site
# 静的サイトのデプロイ

The following guides are based on some shared assumptions:  
以下のガイドは、いくつかの共通の前提に基づいています:

- You are using the default build output location (`dist`). This location [can be changed using `build.outDir`](https://vitejs.dev/config/#build-outdir), and you can extrapolate instructions from these guides in that case.
- デフォルトのビルド出力場所（`dist`）を使用します。この場所は [`build.outDir` で変更することができます](https://vitejs.dev/config/#build-outdir)ので、その場合はこれらのガイドを読み替えてください。
- You are using npm. You can use equivalent commands to run the scripts if you are using Yarn or other package managers.
- npm を使用します。Yarn や他のパッケージマネージャーを使用している場合は、同等のコマンドを使用してスクリプトを実行できます。
- Vite is installed as a local dev dependency in your project, and you have setup the following npm scripts:
- Vite はプロジェクト内のローカルな dev dependency としてインストールされており、以下の npm スクリプトを設定しています。

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

It is important to note that `vite preview` is intended for previewing the build locally and not meant as a production server.  
`vite preview` は、ローカルでビルドをプレビューするためのものであり、本番用のサーバーとしては使えないことに注意してください。

::: tip NOTE
These guides provide instructions for performing a static deployment of your Vite site. Vite also has experimental support for Server Side Rendering. SSR refers to front-end frameworks that support running the same application in Node.js, pre-rendering it to HTML, and finally hydrating it on the client. Check out the [SSR Guide](./ssr) to learn about this feature. On the other hand, if you are looking for integration with traditional server-side frameworks, check out the [Backend Integration guide](./backend-integration) instead.  
これらのガイドは、Vite で静的サイトをデプロイするための手順を提供します。Vite は、サーバーサイドレンダリング (SSR) も試験的にサポートしています。SSR とは、Node.js で同じアプリケーションを実行し、それを HTML にプリレンダリングし、最終的にクライアント上でハイドレートすることをサポートするフロントエンドフレームワークを指します。この機能については、[SSR ガイド](./ssr)をご覧ください。一方、従来のサーバーサイドフレームワークとの統合を探している場合は、代わりに[バックエンドとの統合ガイド](./backend-integration)をチェックしてください。
:::

## Building The App
## アプリのビルド

You may run `npm run build` command to build the app.  
アプリをビルドするために、`npm run build` コマンドを実行します。 

```bash
$ npm run build
```

By default, the build output will be placed at `dist`. You may deploy this `dist` folder to any of your preferred platforms.  
デフォルトでは、ビルド結果は `dist` に置かれます。この `dist` フォルダーを、お好みのプラットフォームにデプロイします。

### Testing The App Locally
## アプリをローカルでテストする

Once you've built the app, you may test it locally by running `npm run preview` command.  
アプリをビルドしたら、`npm run preview` コマンドを実行し、ローカルでテストします。

```bash
$ npm run build
$ npm run preview
```

The `preview` command will boot up local static web server that serves the files from `dist` at http://localhost:5000. It's an easy way to check if the production build looks OK in your local environment.  
`preview` コマンドは、ローカルでウェブサーバーを起動し、`dist` のファイルを http://localhost:5000 で提供します。これは、プロダクションビルドが問題ないかどうかを自分のローカル環境で確認する簡単な方法です。

You may configure the port of the server py passing `--port` flag as an argument.  
サーバのポートを設定するには、引数に `--port` フラグを指定します。

```json
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Now the `preview` method will launch the server at http://localhost:8080.  
これで、`preview` は http://localhost:8080 でサーバーを起動します。

## GitHub Pages

1. Set the correct `base` in `vite.config.js`.  
  `vite.config.js` で `base` を正しく設定してください。

   If you are deploying to `https://<USERNAME>.github.io/`, you can omit `base` as it defaults to `'/'`.  
   `https://<USERNAME>.github.io/` にデプロイする場合、`base` はデフォルトで `'/'` となるのでこれを省略できます。

   If you are deploying to `https://<USERNAME>.github.io/<REPO>/`, for example your repository is at `https://github.com/<USERNAME>/<REPO>`, then set `base` to `'/<REPO>/'`.  
   `https://<USERNAME>.github.io/<REPO>/` にデプロイする場合、例えばリポジトリが `https://github.com/<USERNAME>/<REPO>` にあるなら、`base` を `'/<REPO>/'` と設定してください。

2. Inside your project, create `deploy.sh` with the following content (with highlighted lines uncommented appropriately), and run it to deploy:  
  プロジェクト内で、以下の内容の `deploy.sh` を作成し（ハイライトされた行はコメントアウトされています）、これを実行してデプロイしてください。

   ```bash{13,20,23}
   #!/usr/bin/env sh

   # abort on errors
   # エラー時は停止
   set -e

   # build
   # ビルド
   npm run build

   # navigate into the build output directory
   # ビルド出力ディレクトリに移動
   cd dist

   # if you are deploying to a custom domain
   # カスタムドメインにデプロイする場合
   # echo 'www.example.com' > CNAME

   git init
   git add -A
   git commit -m 'deploy'

   # if you are deploying to https://<USERNAME>.github.io
   # https://<USERNAME>.github.io にデプロイする場合
   # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

   # if you are deploying to https://<USERNAME>.github.io/<REPO>
   # https://<USERNAME>.github.io/<REPO> にデプロイする場合
   # git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

   cd -
   ```

::: tip
You can also run the above script in your CI setup to enable automatic deployment on each push.  
また、CIの設定で上記のスクリプトを実行することで、プッシュごとの自動デプロイを有効にすることができます。
:::

### GitHub Pages and Travis CI
### GitHub Pages と Travis CI

1. Set the correct `base` in `vite.config.js`.  
  `vite.config.js` で `base` を正しく設定してください。

   If you are deploying to `https://<USERNAME or GROUP>.github.io/`, you can omit `base` as it defaults to `'/'`.  
   `https://<USERNAME or GROUP>.github.io/` にデプロイする場合、`base` はデフォルトで `'/'` となるのでこれを省略できます。

   If you are deploying to `https://<USERNAME or GROUP>.github.io/<REPO>/`, for example your repository is at `https://github.com/<USERNAME>/<REPO>`, then set `base` to `'/<REPO>/'`.  
   `https://<USERNAME or GROUP>.github.io/<REPO>/` にデプロイする場合、例えばリポジトリが `https://github.com/<USERNAME>/<REPO>` にあるなら、`base` を `'/<REPO>/'` と設定してください。

2. Create a file named `.travis.yml` in the root of your project.  
   プロジェクトルートに `.travis.yml` という名前でファイルを作成してください。

3. Run `npm install` locally and commit the generated lockfile (`package-lock.json`).  
   ローカルで `npm install` を実行し、生成された lockfile (`package-lock.json`) をコミットしてください。

4. Use the GitHub Pages deploy provider template, and follow the [Travis CI documentation](https://docs.travis-ci.com/user/deployment/pages/).  
   GitHub Pages のデプロイプロバイダーテンプレートを使用し、[Travis CI マニュアル](https://docs.travis-ci.com/user/deployment/pages/)に従ってください。

   ```yaml
   language: node_js
   node_js:
     - lts/*
   install:
     - npm ci
   script:
     - npm run build
   deploy:
     provider: pages
     skip_cleanup: true
     local_dir: dist
     # A token generated on GitHub allowing Travis to push code on you repository.
     # Set in the Travis settings page of your repository, as a secure variable.
     # GitHub で生成されるトークンで、Travis があなたのリポジトリにコードをプッシュすることを許可します。
     # リポジトリの Travis 設定ページで、セキュア変数として設定します。
     github_token: $GITHUB_TOKEN
     keep_history: true
     on:
       branch: master
   ```

## GitLab Pages and GitLab CI
## GitLab Pages と GitLab CI

1. Set the correct `base` in `vite.config.js`.  
  `vite.config.js` で `base` を正しく設定してください。

   If you are deploying to `https://<USERNAME or GROUP>.gitlab.io/`, you can omit `base` as it defaults to `'/'`.  
   `https://<USERNAME or GROUP>.gitlab.io/` にデプロイする場合、`base` はデフォルトで `'/'` となるのでこれを省略できます。

   If you are deploying to `https://<USERNAME or GROUP>.gitlab.io/<REPO>/`, for example your repository is at `https://gitlab.com/<USERNAME>/<REPO>`, then set `base` to `'/<REPO>/'`.  
   `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` にデプロイする場合、例えばリポジトリが `https://gitlab.com/<USERNAME>/<REPO>` にあるなら、`base` を `'/<REPO>/'` と設定してください。

2. Set `build.outDir` in `vite.config.js` to `public`.  
   `vite.config.js` で `build.outDir` を `public` と設定してください。

3. Create a file called `.gitlab-ci.yml` in the root of your project with the content below. This will build and deploy your site whenever you make changes to your content:  
   プロジェクトルートに、`.gitlab-ci.yml` という名前でファイルを作成し、以下のように記述してください。これで、コンテンツを変更するたびにサイトのビルドとデプロイが行われます。

   ```yaml
   image: node:10.22.0
   pages:
     cache:
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
     artifacts:
       paths:
         - public
     only:
       - master
   ```

## Netlify

1. On [Netlify](https://netlify.com), setup up a new project from GitHub with the following settings:
   [Netlify](https://netlify.com) で、GitHub から新規プロジェクトを以下の設定で立ち上げます。

   - **Build Command:** `vite build` or `npm run build`
   - **Publish directory:** `dist`

2. Hit the deploy button.  
   デプロイボタンを押します。

## Google Firebase

1. Make sure you have [firebase-tools](https://www.npmjs.com/package/firebase-tools) installed.
   [firebase-tools](https://www.npmjs.com/package/firebase-tools) をインストールしていることを確認してください。

2. Create `firebase.json` and `.firebaserc` at the root of your project with the following content:
   プロジェクトルートに `firebase.json` と `.firebaserc` を作成し、以下のように記述してください。

   `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": []
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

3. After running `npm run build`, deploy using the command `firebase deploy`.  
   `npm run build` を実行した後、`firebase deploy` コマンドでデプロイしてください。

## Surge

1. First install [surge](https://www.npmjs.com/package/surge), if you haven’t already.  
   まだであれば、[surge](https://www.npmjs.com/package/surge) をインストールしてください。

2. Run `npm run build`.  
   `npm run build` を実行してください。

3. Deploy to surge by typing `surge dist`.  
   `surge dist` とタイプし、surge にデプロイしてください。

You can also deploy to a [custom domain](http://surge.sh/help/adding-a-custom-domain) by adding `surge dist yourdomain.com`.  
`surge dist yourdomain.com` とすることで、[カスタムドメイン](http://surge.sh/help/adding-a-custom-domain)にデプロイすることもできます。

## Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).  
   [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) をインストールしてください。

2. Create a Heroku account by [signing up](https://signup.heroku.com).  
   [サインアップ](https://signup.heroku.com)して Heroku アカウントを作成してください。

3. Run `heroku login` and fill in your Heroku credentials:  
   `heroku login` を実行し、Heroku の認証情報を入力してください。

   ```bash
   $ heroku login
   ```

4. Create a file called `static.json` in the root of your project with the below content:  
   プロジェクトルートに `static.json` という名前でファイルを作成し、以下のように記述してください。

   `static.json`:

   ```json
   {
     "root": "./dist"
   }
   ```

   This is the configuration of your site; read more at [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static).  
   これはあなたのサイトの設定です。詳しくは [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static) をご覧ください。

5. Set up your Heroku git remote:  
   Heroku の Git リモートを設定してください。

   ```bash
   # version change
   # バージョン更新
   $ git init
   $ git add .
   $ git commit -m "My site ready for deployment."

   # creates a new app with a specified name
   # 名前を指定して新しいアプリを作成
   $ heroku apps:create example

   # set buildpack for static sites
   # 静的サイト用に buildpack を設定
   $ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
   ```

6. Deploy your site:  
   サイトをデプロイしてください。

   ```bash
   # publish site
   # サイトを公開
   $ git push heroku master

   # opens a browser to view the Dashboard version of Heroku CI
   # ブラウザを開いて Heroku CI ダッシュボードを見る
   $ heroku open
   ```

## Vercel

To deploy your Vite app with a [Vercel for Git](https://vercel.com/docs/git), make sure it has been pushed to a Git repository.  
Vite アプリを [Vercel for Git](https://vercel.com/docs/git) でデプロイするために、Git リポジトリにコードがプッシュされていることを確認してください。

Go to https://vercel.com/import/git and import the project into Vercel using your Git of choice (GitHub, GitLab or BitBucket). Follow the wizard to select the project root with the project's `package.json` and override the build step using `npm run build` and the output dir to be `./dist`  
https://vercel.com/import/git から、お好みの Git（GitHub、GitLab または BitBucket）を使ってプロジェクトを Vercel にインポートしてください。

![Override Vercel Configuration](../images/vercel-configuration.png)
![Vercel の設定を上書きする](../images/vercel-configuration.png)

After your project has been imported, all subsequent pushes to branches will generate Preview Deployments, and all changes made to the Production Branch (commonly "main") will result in a Production Deployment.  
プロジェクがトインポートされると、その後のブランチへの全てのプッシュでプレビューデプロイメントが生成され、プロダクションブランチ（通常は "main"）での変更はプロダクションデプロイメントが生成されます。

Once deployed, you will get a URL to see your app live, such as the following: https://vite.vercel.app
デプロイされると、アプリのライブを見るためのURLが得られます。例えば https://vite.vercel.app のようなものです。

## Azure Static Web Apps

You can quickly deploy your Vite app with Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps) service. You need:  
Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps) サービスを使って、Vite アプリを素早くデプロイすることができます。必要なもの:

- An Azure account and a subscription key. You can create a [free Azure account here](https://azure.microsoft.com/free).
- Azure アカウントとサブスクリプションキー。[無料で Azure アカウント](https://azure.microsoft.com/free)を作成できます。
- Your app code pushed to [GitHub](https://github.com).
- [GitHub](https://github.com) にプッシュされたアプリのコード。
- The [SWA Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) in [Visual Studio Code](https://code.visualstudio.com).
- [Visual Studio Code](https://code.visualstudio.com) の [SWA 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)。

Install the extension in VS Code and navigate to your app root. Open the Static Web Apps extension, sign in to Azure, and click the '+' sign to create a new Static Web App. You will be prompted to designate which subscription key to use.  
VS Code に拡張機能をインストールし、アプリのルートに移動してください。Static Web Apps 拡張機能を開き、Azure にサインインし、'+' マークをクリックして新しい Static Web App を作成してください。使用するサブスクリプションキーを指定するプロンプトが表示されます。

Follow the wizard started by the extension to give your app a name, choose a framework preset, and designate the app root (usually `/`) and built file location `/dist`. The wizard will run and will create a GitHub action in your repo in a `.github` folder.  
拡張機能が起動するウィザードに従って、アプリの名前を決め、フレームワークのプリセットを選択し、アプリのルート（通常は `/`）とビルドファイルの場所 `/dist` を指定します。ウィザードが実行されると、リポジトリの `.github` フォルダに GitHub アクションが作成されます。

The action will work to deploy your app (watch its progress in your repo's Actions tab) and, when successfully completed, you can view your app in the address provided in the extension's progress window by clicking the 'Browse Website' button that appears when the GitHub action has run.  
このアクションが実行されると、アプリがデプロイされます（進行状況はリポジトリの Actions タブで確認できます）。正常に完了すると、GitHub アクション実行時に表示される 'Browse Website' ボタンをクリックすることで、拡張機能の進行状況ウィンドウで指定されたアドレスでアプリを見ることができます。