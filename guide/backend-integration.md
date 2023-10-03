# バックエンドとの統合

:::tip 注意
従来のバックエンド（例: Rails, Laravel）を使用して HTML を配信し、アセットの配信には Vite を使用したい場合は、[Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) の一覧を確認してみてください。

カスタム統合が必要な場合は、このガイドの手順に従って手順で設定することも可能です
:::

1. Vite の設定ファイルで、エントリの指定とマニフェストのビルドの有効化を行ってください:

   ```js
   // vite.config.js
   export default defineConfig({
     build: {
       // outDir に .vite/manifest.json を出力
       manifest: true,
       rollupOptions: {
         // デフォルトの .html エントリを上書き
         input: '/path/to/main.js',
       },
     },
   })
   ```

   [module preload polyfill](/config/build-options.md#build-polyfillmodulepreload) を無効にしていない場合は、エントリで Polyfill をインポートする必要があります。

   ```js
   // アプリのエントリの先頭に追加
   import 'vite/modulepreload-polyfill'
   ```

2. 開発環境向けには以下をサーバの HTML テンプレートに含めてください。（`http://localhost:5173` を Vite が動作している URL に変更してください）:

   ```html
   <!-- 開発環境 -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   アセットを適切に処理するには、2 つの選択肢があります。

   - サーバが静的アセットのリクエストを Vite サーバにプロキシするよう設定されていることを確認する
   - 生成されるアセット URL が相対パスではなく、バックエンドサーバの URL を使って解決されるよう [`server.origin`](/config/server-options.md#server-origin) を設定する

   これは、画像などのアセットを正しく読み込むために必要です。

   React と `@vitejs/plugin-react` を使用している場合、プラグインは配信している HTML を変更することができないので、上記のスクリプトの前に以下のスクリプトを追加する必要があります（`http://localhost:5173` を Vite が動作しているローカル URL に置き換えます）：

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. 本番環境向け: `vite build` を実行後、他のアセットファイルと共に `.vite/manifest.json` ファイルが生成されます。マニフェストファイルの内容は以下のようになります:

   ```json
   {
     "main.js": {
       "file": "assets/main.4889e940.js",
       "src": "main.js",
       "isEntry": true,
       "dynamicImports": ["views/foo.js"],
       "css": ["assets/main.b82dbe22.css"],
       "assets": ["assets/asset.0ab0f9cd.png"]
     },
     "views/foo.js": {
       "file": "assets/foo.869aea0d.js",
       "src": "views/foo.js",
       "isDynamicEntry": true,
       "imports": ["_shared.83069a53.js"]
     },
     "_shared.83069a53.js": {
       "file": "assets/shared.83069a53.js"
     }
   }
   ```

   - マニフェストは `Record<name, chunk>` 構造になっています。
   - エントリまたはダイナミックエントリのチャンクの場合、プロジェクトルートからの相対パスがキーとなります。
   - エントリ以外のチャンクでは、生成されたファイル名の前に `_` を付けたものがキーとなります。
   - チャンクには、静的インポートと動的インポートの情報（どちらもマニフェスト内の対応するチャンクをマップするキー）と、それらと対応する CSS とアセットファイルが含まれます（あれば）。

   このファイルを使用してハッシュを付加されたファイル名でリンクや preload directives をレンダリングすることができます（注意: ここでの構文は説明用なので、使用しているサーバのテンプレート言語に替えてください）:

   ```html
   <!-- 本番環境 -->
   <link rel="stylesheet" href="/assets/{{ manifest['main.js'].css }}" />
   <script type="module" src="/assets/{{ manifest['main.js'].file }}"></script>
   ```
