# バックエンドとの統合

従来のバックエンド（例: Rails, Laravel）を使用して HTML を配信し、アセットの配信には Vite を使用したい場合は、[Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) の一覧を確認してみてください。

もしくは以下の手順で設定することも可能です:

1. Vite の設定ファイルで、エントリの指定とマニフェストのビルドの有効化を行ってください:

   ```js
   // vite.config.js
   export default defineConfig({
     build: {
       // outDir に manifest.json を出力
       manifest: true,
       rollupOptions: {
          // デフォルトの .html エントリを上書き
         input: '/path/to/main.js'
       }
     }
   })
   ```

2. 開発環境向けには以下をサーバーの HTML テンプレートに含めてください。（（`http://localhost:3000` を Vite が動作している URL に変更してください）:

   ```html
   <!-- 開発環境 -->
   <script type="module" src="http://localhost:3000/@vite/client"></script>
   <script type="module" src="http://localhost:3000/main.js"></script>
   ```

   また、サーバが Vite の作業ディレクトリにある静的アセットを配信するように設定されていることを確認してください。そうなっていない場合、画像などのアセットが適切に読み込まれません。

   React と `@vitejs/plugin-react-refresh` を使用している場合、プラグインは配信している HTML を変更することができないので、上記のスクリプトの前に以下のスクリプトを追加する必要があります。

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:3000/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. 本番環境向け: `vite build` を実行後、他のアセットファイルと共に `manifest.json` ファイルが生成されます。マニフェストファイルの内容は以下のようになります:

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
