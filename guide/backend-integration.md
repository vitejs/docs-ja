# バックエンドとの統合

:::tip 注意
従来のバックエンド（例: Rails, Laravel）を使用して HTML を配信し、アセットの配信には Vite を使用したい場合は、[Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) の一覧を確認してみてください。

カスタム統合が必要な場合は、このガイドの手順に従って手順で設定することも可能です
:::

1. Vite の設定ファイルで、エントリーの指定とマニフェストのビルドの有効化を行ってください:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---cut---
   export default defineConfig({
     build: {
       // outDir に .vite/manifest.json を出力
       manifest: true,
       rollupOptions: {
         // デフォルトの .html エントリーを上書き
         input: '/path/to/main.js',
       },
     },
   })
   ```

   [module preload polyfill](/config/build-options.md#build-polyfillmodulepreload) を無効にしていない場合は、エントリーで Polyfill をインポートする必要があります。

   ```js
   // アプリのエントリーの先頭に追加
   import 'vite/modulepreload-polyfill'
   ```

2. 開発環境向けには以下をサーバーの HTML テンプレートに含めてください。（`http://localhost:5173` を Vite が動作している URL に変更してください）:

   ```html
   <!-- 開発環境 -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   アセットを適切に処理するには、2 つの選択肢があります。

   - サーバーが静的アセットのリクエストを Vite サーバーにプロキシするよう設定されていることを確認する
   - 生成されるアセット URL が相対パスではなく、バックエンドサーバーの URL を使って解決されるよう [`server.origin`](/config/server-options.md#server-origin) を設定する

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

   ```json [.vite/manifest.json]
   {
     "_shared-!~{003}~.js": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-!~{003}~.js"
     },
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   - マニフェストは `Record<name, chunk>` 構造になっています。
   - エントリーまたはダイナミックエントリーのチャンクの場合、プロジェクトルートからの相対パスがキーとなります。
   - エントリー以外のチャンクでは、生成されたファイル名の前に `_` を付けたものがキーとなります。
   - チャンクには、静的インポートと動的インポートの情報（どちらもマニフェスト内の対応するチャンクをマップするキー）と、それらと対応する CSS とアセットファイルが含まれます（あれば）。

4. このファイルを使用してハッシュを付加されたファイル名でリンクや preload directives をレンダリングすることができます。

   以下は、適切なリンクをレンダリングする HTML テンプレートの例です。ここでの構文は説明用なので、使用しているサーバーのテンプレート言語に替えてください。`importedChunks` 関数は説明用であり、Vite により提供されているわけではありません。



   ```html
   <!-- 本番環境 -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   具体的には、マニフェストファイルとエントリーポイントが指定された場合、HTML を生成するバックエンドは以下のタグを含める必要があります。


   - エントリーポイントのチャンクの `css` リストのファイルごとに `<link rel="stylesheet">` タグ
   - エントリーポイントの `imports` リスト内のすべてのチャンクを再帰的にたどり、インポートされた各チャンクの CSS ファイルごとに
     `<link rel="stylesheet">` タグを含める。
   - エントリーポイントのチャンクの `file` キーに対するタグ（JavaScript に対する `<script type="module">`
     または CSS に対する `<link rel="stylesheet">`）
   - オプションとして、インポートされた JavaScript ごとの `file` に対する `<link rel="modulepreload">` タグ。
     再度、エントリーポイントのチャンクから imports を再帰的にたどる。

   上記のマニフェスト例に従うと、本番環境では、エントリーポイント `views/foo.js` に対して以下のタグが含まれるはずです。

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- オプション -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   一方、エントリーポイント `views/bar.js` に対しては、以下が含まれるはずです。

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- オプション -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details `importedChunks` の疑似実装
   TypeScript での `importedChunks` の疑似実装の例（これは、プログラミング言語とテンプレート言語に合わせて調整する必要があります）:

   ```ts
   import type { Manifest, ManifestChunk } from 'vite'

   export default function importedChunks(
     manifest: Manifest,
     name: string,
   ): ManifestChunk[] {
     const seen = new Set<string>()

     function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
       const chunks: ManifestChunk[] = []
       for (const file of chunk.imports ?? []) {
         const importee = manifest[file]
         if (seen.has(file)) {
           continue
         }
         seen.add(file)

         chunks.push(...getImportedChunks(importee))
         chunks.push(importee)
       }

       return chunks
     }

     return getImportedChunks(manifest[name])
   }
   ```

   :::
