# サーバサイドレンダリング

:::warning 実験的な機能
SSR のサポートはまだ実験段階であり、バグやサポートされていないユースケースが発生する可能性があります。ご自身の責任で進めてください。
:::

:::tip 注意
SSR は特に、Node.js で同じアプリケーションを実行し、HTML を先読みレンダリングし、最後にクライアントでハイドレートすることをサポートするフロントエンドフレームワーク（ React、Preact、Vue、Svelte など ）を指します。 従来のサーバーサイドフレームワークとの統合をお探しの場合は、代わりに [バックエンド統合ガイド](./backend-integration) を確認してください。

次のガイドは、選択したフレームワークで SSR を使用した経験があることも前提としており、Vite 固有の統合の詳細のみに焦点を当てています。
:::

## プロジェクトの例

:::tip Help
If you have questions, the community is usually helpful at [Vite Discord's #ssr channel](https://discord.gg/PkbxgzPhJv).
:::

Vite はサーバサイドレンダリング ( SSR ) の組み込みサポートを提供します。Vite プレイグラウンドには、Vue 3 および React の SSR セットアップの例が含まれています。これらは、このガイドのリファレンスとして使用できます。:

- [Vue 3](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-vue)
- [React](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-react)

## ソースファイルの構成

一般的な SSR アプリケーションは、次のようなソースファイル構造になります。:

```
- index.html
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html` は `entry-client.js` を参照し、サーバサイドでレンダリングされたマークアップを挿入するためにプレースホルダーを含める必要があります。:

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

正確に置き換えることができる限り、`<!--ssr-outlet-->` の代わりに任意のプレースホルダーを使用することができます。

## 条件付きロジック

SSR とクライアントに基づいて条件付きロジックを実行する場合は次を使用できます。

```js
if (import.meta.env.SSR) {
  // ... サーバのロジック
}
```

これはビルド中に静的に置き換えられるため、未使用のブランチのツリーシェイクが可能になります。

## 開発サーバのセットアップ

SSR をビルドする際、メインサーバを完全に制御し、Vite を本番環境から切り離したいと思うでしょう。 したがってミドルウェアモードで Vite を使用することをお勧めします。これは [express](https://expressjs.com/) の例です: 

**server.js**

```js{17-19}
const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // ミドルウェアモードで Vite サーバを作成します。これにより、Vite 自体のHTMLが無効になります。
  // ロジックを提供し、親サーバに制御を任せます。
  const vite = await createViteServer({
    server: { middlewareMode: true }
  })
  // Vite の接続インスタンスをミドルウェアとして使用します。
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // index.html を提供します - 次にこれに取り組みます。
  })

  app.listen(3000)
}

createServer()
```

ここで `vite` は [ViteDevServer](./api-javascript#vitedevserver) のインスタンスです。 `vite.middlewares` は、connect 互換 の Node.js フレームワークでミドルウェアとして使用できる [Connect](https://github.com/senchalabs/connect) インスタンスです。

次のステップはサーバサイドでレンダリングされた HTML を提供するための `*` ハンドラの実装です:

```js
app.use('*', async (req, res) => {
  const url = req.originalUrl

  try {
    // 1. index.html を読み込む
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    )

    // 2. Vite を使用して HTML への変換を適用します。これにより Vite の HMR クライアントが定義され
    //    Vite プラグインからの HTML 変換も適用します。 e.g. global preambles
    //    from @vitejs/plugin-react-refresh
    template = await vite.transformIndexHtml(url, template)

    // 3. サーバサイドのエントリポイントを読み込みます。 vite.ssrLoadModule は自動的に
    //    ESM を Node.js で使用できるコードに変換します! ここではバンドルは必要ありません
    //    さらに HMR と同様に効率的な無効化を提供します。
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. アプリケーションで HTML をレンダリングします。これは entry-server.js からエクスポートされた `render` を使用しています。
    //    関数は適切なフレームワーク SSR API を呼び出します。
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. アプリケーションでレンダリングされた HTML をテンプレートに挿入します。
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. レンダリングされた HTML をクライアントに送ります。
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // エラーが検出された場合は、vite に stracktrace を修正させて、次のようにマップします。
    // 実際のソースコード
    vite.ssrFixStacktrace(e)
    console.error(e)
    res.status(500).end(e.message)
  }
})
```

`package.json` の `dev` スクリプトも代わりにサーバスクリプトを使用するように変更する必要があります:

```diff
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## プロダクションビルド

SSR プロジェクトを本番環境に適用するには次の作業を行う必要があります:

1. 通常通りクライアントビルドします。
2. SSR ビルドを作成します、これは `require()` を介して直接ロードできるためであり、Vite の `ssrLoadModule` を経由する必要はありません。

`package.json` は次のようになります:

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js "
  }
}
```

これは SSR ビルドであることを示す `--ssr` フラグであることに注意してください。 また、SSR エントリを指定する必要があります。

次に `server.js` で `process.env.NODE_ENV` をチェックして本番固有のロジックを追加する必要があります:

- ルートの `index.html` を読み取る代わりに `dist/client/index.html` を使用します。これはクライアントビルドへの正しいアセットリンクが含まれているためです。

- `await vite.ssrLoadModule('/src/entry-server.js')` の代わりに `require('./dist/server/entry-server.js')` を使用します (このファイルは SSR ビルドした結果のファイルです)。

- `vite` 開発サーバーの作成とすべての使用を開発専用サーバかどうかの条件分岐の後ろに移動します。次に静的ファイルを提供するミドルウェアを追加し、`dist/client` からファイルを提供します。

詳しくは [Vue](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-vue) と [React](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-react) のデモを参照してください。

## Preload Directives の作成

`vite build` はビルド出力ディレクトリに `ssr-manifest.json` を生成する `--ssrManifest` フラグをサポートしています:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

上記のスクリプトはクライアントビルドの際に `dist/client/ssr-manifest.json` を生成します (モジュール ID をクライアントファイルにマップするため、SSRマニフェストはクライアントビルドから生成されます)。マニフェストには、モジュール ID の関連するチャンクおよびアセットファイルへのマッピングが含まれています。

マニフェストを活用するには、フレームワークはサーバーのレンダリング呼び出し中に使用されたコンポーネントのモジュール ID を収集する方法を提供する必要があります。

`@vitejs/plugin-vue` は自動で使用されたコンポーネントモジュール IDを 関連する VueSSR コンテキストに登録することを標準でサポートしています:

```js
// src/entry-server.js
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules はレンダリング中にしようされたモジュール ID をセットします。
```

本番ブランチの `server.js` では、マニフェストを読み取って、`src/entry-server.js` によってエクスポートされた `render` 関数に渡す必要があります。これにより、非同期ルートで使用されるファイルのプリロードディレクティブをレンダリングするのに十分な情報が得られます! 詳しくは [demo source](https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/src/entry-server.js) をご覧ください。

## Pre-Rendering / SSG

ルートと特定のルートに必要なデータが事前にわかっている場合は、本番 SSR と同じロジックを使用して、これらのルートを静的 HTML に先読みでレンダリングすることができます。これは、SSG の形式と見なすこともできます。 詳しくは [demo pre-render script](https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/prerender.js) をご覧ください。

## 外部 SSR

多くの依存関係は、ESM ファイルと CommonJS ファイルの両方を出荷します。SSR を実行する場合、CommonJS ビルドを提供する依存関係を Vite の SSR トランスフォーム/モジュールシステムから外部化することで、開発とビルドの両方を高速化できます。 例えば、あらかじめバンドルされている ESM バージョンの React を用いて、それから変換してそれを Node.js 互換に戻す代わりに、単純に `require('react')` を使用する方が効率的です。また、SSRバンドルビルドの速度も大幅に向上します。

Vite は、次のヒューリスティックに基づいて自動化された SSR 外部化を実行します:

- 依存関係の解決された ESM エントリポイントとそのデフォルトの Node エントリポイントが異なる場合、そのデフォルトの Node エントリはおそらく外部化できる CommonJS ビルドです。例えば、`vue` は ESM ビルドと CommonJS ビルドの両方を出荷するため、自動的に外部化されます。

- それ以外の場合、Vite はパッケージのエントリポイントに有効な ESM 構文が含まれているかどうかを確認します。含まれていない場合、パッケージは CommonJS である可能性が高く、外部化されます。例として、`react-dom`は、CommonJS 形式の単一のエントリのみを指定するため、自動的に外部化されます。

このヒューリスティックがエラーにつながる場合は、`ssr.external` および `ssr.noExternal` のオプションを使用して SSR の外部化を手動で調整することができます。

将来的には、このヒューリスティックは、プロジェクトで `type: "module"` が有効になっているかどうかを検出するように改善される可能性があります。これにより、Vite は、SSR 中に動的な `import()` を介してインポートすることにより、Node 互換の ESM ビルドを出荷する依存関係を外部化することもできます。

:::warning エイリアスの操作
あるパッケージを別のパッケージにリダイレクトするエイリアスを設定した場合は、SSR の外部化された依存関係で機能するように、代わりに実際の `node_modules` パッケージにエイリアスを設定することをお勧めします。[Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) と [pnpm](https://pnpm.js.org/en/aliases) の両方で `npm:` のエイリアスをサポートします。
:::

## SSR 固有のプラグインロジック

Vue や Svelte などの一部のフレームワークは、クライアントと SSR に基づいてコンポーネントをさまざまな形式にコンパイルします。条件付き変換をサポートするために、Vite は追加の `ssr` 引数を次のプラグインフックに渡します。

- `resolveId`
- `load`
- `transform`

**例:**

```js
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, ssr) {
      if (ssr) {
        // SSR 固有の transform を実行する...
      }
    }
  }
}
```
