# バックエンドとの統合

:::tip 注意
従来のバックエンド（例: Rails, Laravel）を使用して HTML を配信し、アセットの配信には Vite を使用したい場合は、[Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) の一覧を確認してみてください。

カスタム統合が必要な場合は、このガイドの手順に従って手動で設定することも可能です。
:::

1. Vite の設定ファイルで、エントリーの指定とマニフェストのビルドの有効化を行ってください:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---cut---
   export default defineConfig({
     server: {
       cors: {
         // ブラウザ経由でアクセスするオリジン
         origin: 'http://my-backend.example.com',
       },
     },
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

3. 本番環境向けには、`vite build` を実行後、他のアセットファイルと共に `.vite/manifest.json` ファイルが生成されます。マニフェストファイルの内容は以下のようになります:

   ```json [.vite/manifest.json] style:max-height:400px
   {
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "_shared-ChJ_j-JJ.css": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-ChJ_j-JJ.css"
     },
     "logo.svg": {
       "file": "assets/logo-BuPIv-2h.svg",
       "src": "logo.svg"
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

   マニフェストは `Record<name, chunk>` 構造になっており、各チャンクは `ManifestChunk` インターフェースに従います:

   ```ts style:max-height:400px
   interface ManifestChunk {
     /**
      * このチャンク / アセットの入力ファイル名（既知の場合）
      */
     src?: string
     /**
      * このチャンク / アセットの出力ファイル名
      */
     file: string
     /**
      * このチャンクによってインポートされる CSS ファイルのリスト
      *
      * このフィールドは JS チャンクにのみ存在します。
      */
     css?: string[]
     /**
      * このチャンクによってインポートされる CSS ファイルを除くアセットファイルのリスト
      *
      * このフィールドは JS チャンクにのみ存在します。
      */
     assets?: string[]
     /**
      * このチャンクまたはアセットがエントリーポイントかどうか
      */
     isEntry?: boolean
     /**
      * このチャンク / アセットの名前（既知の場合）
      */
     name?: string
     /**
      * このチャンクが動的エントリーポイントかどうか
      *
      * このフィールドは JS チャンクにのみ存在します。
      */
     isDynamicEntry?: boolean
     /**
      * このチャンクによって静的にインポートされるチャンクのリスト
      *
      * 値はマニフェストのキーです。このフィールドは JS チャンクにのみ存在します。
      */
     imports?: string[]
     /**
      * このチャンクによって動的にインポートされるチャンクのリスト
      *
      * 値はマニフェストのキーです。このフィールドは JS チャンクにのみ存在します。
      */
     dynamicImports?: string[]
   }
   ```

   マニフェスト内の各エントリーは、以下のいずれかを表します:
   - **エントリーチャンク**: [`build.rollupOptions.input`](https://rollupjs.org/configuration-options/#input) で指定されたファイルから生成されます。これらのチャンクには `isEntry: true` があり、キーはプロジェクトルートからの相対パスです。
   - **ダイナミックエントリーチャンク**: 動的インポートから生成されます。これらのチャンクには `isDynamicEntry: true` があり、キーはプロジェクトルートからの相対パスです。
   - **非エントリーチャンク**: キーは生成されたファイル名の前に `_` を付けたものです。
   - **アセットチャンク**: 画像やフォントなどのインポートされたアセットから生成されます。キーはプロジェクトルートからの相対パスです。
   - **CSS ファイル**: [`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) が `false` の場合、キー `style.css` で単一の CSS ファイルが生成されます。`build.cssCodeSplit` が `false` でない場合、キーは JS チャンクと同様に生成されます（つまり、エントリーチャンクは `_` プレフィックスなし、非エントリーチャンクは `_` プレフィックスあり）。

   JS チャンク（アセットまたは CSS 以外のチャンク）には、静的インポートと動的インポートの情報（どちらもマニフェスト内の対応するチャンクをマップするキー）と、それらと対応する CSS とアセットファイルが含まれます（あれば）。

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

   具体的には、マニフェストファイルとエントリーポイントが指定された場合、HTML を生成するバックエンドは以下のタグを含める必要があります。最適なパフォーマンスのために、この順序に従うことが推奨されます:

   1. エントリーポイントのチャンクの `css` リストのファイルごとに `<link rel="stylesheet">` タグ（存在する場合）
   2. エントリーポイントの `imports` リスト内のすべてのチャンクを再帰的にたどり、インポートされた各チャンクの `css` リストのファイルごとに
      `<link rel="stylesheet">` タグを含める（存在する場合）。
   3. エントリーポイントのチャンクの `file` キーに対するタグ。これは JavaScript に対する `<script type="module">`、CSS に対する `<link rel="stylesheet">` になります。
   4. オプションとして、インポートされた JavaScript チャンクごとの `file` に対する `<link rel="modulepreload">` タグを追加し、エントリーポイントのチャンクから imports を再帰的にたどる。


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
