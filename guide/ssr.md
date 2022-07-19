# サーバサイドレンダリング

:::warning 実験的な機能
SSR のサポートはまだ実験段階で、バグやサポートされていないユースケースが発生する可能性があります。ご自身の責任で進んでください。
:::

:::tip 注意
SSR は特に、Node.js で同じアプリケーションを実行し、HTML を先読みレンダリングし、最後にクライアントでハイドレートすることをサポートするフロントエンドフレームワーク（React、Preact、Vue、Svelte など）を指します。 従来のサーバサイドフレームワークとの統合をお探しの場合は、代わりに [バックエンド統合ガイド](./backend-integration) を確認してください。

次のガイドは、選択したフレームワークで SSR を使用した経験があることも前提としており、Vite 固有の統合の詳細のみに焦点を当てています。
:::

:::warning 低レベル API
これは、ライブラリやフレームワーク製作者のための低レベル API です。アプリケーションを作成することが目的ならば、まず [Awesome Vite の SSR セクション](https://github.com/vitejs/awesome-vite#ssr)にある高レベルの SSR プラグインとツールを確認してください。とはいえ、多くのアプリケーションは、Vite のネイティブの低レベル API 上に直接構築されています。
:::

:::tip ヘルプ
質問がある場合は、[Vite Discord の #ssr チャンネル](https://discord.gg/PkbxgzPhJv)でコミュニティがいつでも助けてくれます。
:::

## プロジェクトの例

Vite はサーバサイドレンダリング ( SSR ) の組み込みサポートを提供します。Vite プレイグラウンドには、Vue 3 および React の SSR セットアップの例が含まれています。これらは、このガイドのリファレンスとして使用できます。:

- [Vue 3](https://github.com/vitejs/vite/tree/main/playground/ssr-vue)
- [React](https://github.com/vitejs/vite/tree/main/playground/ssr-react)

## ソースファイルの構成

一般的な SSR アプリケーションは、次のようなソースファイル構造になります。:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html` は `entry-client.js` を参照し、サーバサイドでレンダリングされたマークアップを挿入するためにプレースホルダを含める必要があります。:

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

正確に置き換えることができる限り、`<!--ssr-outlet-->` の代わりに任意のプレースホルダを使用することができます。

## 条件付きロジック

SSR とクライアントに基づいて条件付きロジックを実行する場合は次を使用できます。

```js
if (import.meta.env.SSR) {
  // ... サーバのロジック
}
```

これはビルド中に静的に置き換えられるため、未使用のブランチのツリーシェイクが可能になります。

## 開発サーバのセットアップ

SSR をビルドする際、メインサーバを完全に制御し、Vite を本番環境から切り離したいと思うでしょう。したがってミドルウェアモードで Vite を使用することをお勧めします。これは [express](https://expressjs.com/) での例です:

**server.js**

```js{17-19}
const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // ミドルウェアモードで Vite サーバを作成し、app type を 'custom' に指定します。
  // これにより、Vite 自体の HTML 配信ロジックが無効になり、親サーバが
  // 制御できるようになります。
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })
  // Vite の接続インスタンスをミドルウェアとして使用します。
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // index.html を提供します - 次にこれに取り組みます。
  })

  app.listen(5173)
}

createServer()
```

ここで `vite` は [ViteDevServer](./api-javascript#vitedevserver) のインスタンスです。 `vite.middlewares` は、connect 互換の Node.js フレームワークでミドルウェアとして使用できる [Connect](https://github.com/senchalabs/connect) インスタンスです。

次のステップはサーバサイドでレンダリングされた HTML を提供するための `*` ハンドラの実装です:

```js
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. index.html を読み込む
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    )

    // 2. Vite の HTML の変換を適用します。これにより Vite の HMR クライアントが定義され
    //    Vite プラグインからの HTML 変換も適用します。 e.g. global preambles
    //    from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. サーバサイドのエントリポイントを読み込みます。 vite.ssrLoadModule は自動的に
    //    ESM を Node.js で使用できるコードに変換します! ここではバンドルは必要ありません
    //    さらに HMR と同様な効率的な無効化を提供します。
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. アプリケーションの HTML をレンダリングします。これは entry-server.js からエクスポートされた `render` を使用しています。
    //    `render` 関数はフレームワークの適切な SSR API を呼び出すことを想定しています。
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. アプリケーションのレンダリングされた HTML をテンプレートに挿入します。
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. レンダリングされた HTML をクライアントに送ります。
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // エラーが検出された場合は、Vite に stracktrace を修正させて、次のようにマップします。
    // 実際のソースコード
    vite.ssrFixStacktrace(e)
    next(e)
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
2. SSR ビルドを作成します、これは `require()` を介して直接ロードできるので、Vite の `ssrLoadModule` を経由する必要はありません。

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

これは SSR ビルドだということを示す `--ssr` フラグに注意してください。 また、SSR エントリを指定する必要があります。

次に `server.js` で `process.env.`<wbr>`NODE_ENV` をチェックして本番固有のロジックを追加する必要があります:

- ルートの `index.html` を読み取る代わりに `dist/client/index.html` を使用します。これはクライアントビルドへの正しいアセットリンクが含まれているためです。

- `await vite.ssrLoadModule('/src/entry-server.js')` の代わりに `require('./dist/server/entry-server.js')` を使用します（このファイルは SSR ビルドした結果のファイルです）。

- `vite` 開発サーバの作成とすべての使用を開発専用サーバかどうかの条件分岐の後ろに移動します。次に静的ファイルを提供するミドルウェアを追加し、`dist/client` からファイルを提供します。

詳しくは [Vue](https://github.com/vitejs/vite/tree/main/playground/ssr-vue) と [React](https://github.com/vitejs/vite/tree/main/playground/ssr-react) のデモを参照してください。

## Preload Directives の作成

`vite build` はビルド出力ディレクトリに `ssr-manifest.json` を生成する `--ssrManifest` フラグをサポートしています:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

上記のスクリプトはクライアントビルドの際に `dist/client/ssr-manifest.json` を生成します（モジュール ID をクライアントファイルにマップするため、SSR マニフェストはクライアントビルドから生成されます）。マニフェストには、モジュール ID の関連するチャンクおよびアセットファイルへのマッピングが含まれています。

マニフェストを活用するには、フレームワークはサーバのレンダリング呼び出し中に使用されたコンポーネントのモジュール ID を収集する方法を提供する必要があります。

`@vitejs/plugin-vue` は自動で使用されたコンポーネントモジュール ID を関連する VueSSR コンテキストに登録することを標準でサポートしています:

```js
// src/entry-server.js
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules はレンダリング中にしようされたモジュール ID をセットします。
```

本番ブランチの `server.js` では、マニフェストを読み取って、`src/entry-server.js` によってエクスポートされた `render` 関数に渡す必要があります。これにより、非同期ルートで使用されるファイルのプリロードディレクティブをレンダリングするのに十分な情報が得られます！詳しくは [demo source](https://github.com/vitejs/vite/blob/main/playground/ssr-vue/src/entry-server.js) をご覧ください。

## Pre-Rendering / SSG

ルートと特定のルートに必要なデータが事前にわかっている場合は、本番 SSR と同じロジックを使用して、これらのルートを静的 HTML に先読みでレンダリングすることができます。これは、SSG の形式と見なすこともできます。 詳しくは [demo pre-render script](https://github.com/vitejs/vite/blob/main/playground/ssr-vue/prerender.js) をご覧ください。

## 外部 SSR

多くの依存関係は、ESM ファイルと CommonJS ファイルの両方を出荷します。SSR を実行する場合、CommonJS ビルドを提供する依存関係を Vite の SSR トランスフォーム/モジュールシステムから外部化することで、開発とビルドの両方を高速化できます。例えば、あらかじめバンドルされている ESM バージョンの React を用いて、それから変換してそれを Node.js 互換に戻す代わりに、単純に `require('react')` を使用する方が効率的です。また、SSR バンドルビルドの速度も大幅に向上します。

Vite は、次のヒューリスティックに基づいて自動化された SSR 外部化を実行します:

- 依存関係の解決された ESM エントリポイントとそのデフォルトの Node エントリポイントが異なる場合、そのデフォルトの Node エントリはおそらく外部化できる CommonJS ビルドです。例えば、`vue` は ESM ビルドと CommonJS ビルドの両方を出荷するため、自動的に外部化されます。

- それ以外の場合、Vite はパッケージのエントリポイントに有効な ESM 構文が含まれているかどうかを確認します。含まれていない場合、パッケージは CommonJS の可能性が高く、外部化されます。例として、`react-dom` は、CommonJS 形式の単一のエントリのみを指定するため、自動的に外部化されます。

このヒューリスティックがエラーにつながる場合は、`ssr.external` および `ssr.noExternal` のオプションを使用して SSR の外部化を手動で調整することができます。

将来的には、このヒューリスティックは、プロジェクトで `type: "module"` が有効になっているかどうかを検出するように改善される可能性があります。これにより、Vite は、SSR 中に動的な `import()` を介してインポートすることにより、Node 互換の ESM ビルドを出荷する依存関係を外部化することもできます。

:::warning エイリアスの操作
あるパッケージを別のパッケージにリダイレクトするエイリアスを設定した場合は、SSR の外部化された依存関係で機能するように、代わりに実際の `node_modules` パッケージにエイリアスを設定することをお勧めします。[Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) と [pnpm](https://pnpm.js.org/en/aliases) の両方で `npm:` のエイリアスをサポートします。
:::

## SSR 固有のプラグインロジック

Vue や Svelte などの一部のフレームワークは、クライアントと SSR に基づいてコンポーネントをさまざまな形式にコンパイルします。条件付き変換をサポートするために、Vite は次のプラグインフックの `options` オブジェクトに、追加の `ssr` プロパティをに渡します:

- `resolveId`
- `load`
- `transform`

**例:**

```js
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // SSR 固有の transform を実行する...
      }
    }
  }
}
```

`load` と `transform` の options オブジェクトは省略可能であり、rollup は現在このオブジェクトを使用していませんが、将来的に追加のメタデータでこれらのフックを拡張する可能性があります。

:::tip 注意
Vite 2.7 以前では、`options` オブジェクトを使うのではなく、固定の `ssr` 引数を使ってプラグインフックに通知されていました。すべての主要なフレームワークとプラグインは更新されていますが、以前の API を使っている古い記事が見つかる場合があります。
:::

## SSR ターゲット

SSR ビルドのデフォルトターゲットは Node 環境ですが、Web Worker でサーバを実行することもできます。パッケージのエントリの解決方法はプラットフォームごとに異なります。ターゲットを Web Worker に設定するには、`ssr.target` を `'webworker'` に設定します。

## SSR バンドル

`webworker` のランタイムなどの場合、SSR のビルドを 1 つの JavaScript ファイルにバンドルしたい場合があります。`ssr.noExternal` を `true` に設定することで、この動作を有効にできます。これは 2 つのことを行います:

- すべての依存関係を `noExternal` として扱う
- Node.js のビルドインがインポートされた場合、エラーを投げる

## Vite CLI

コマンドラインコマンドの `$ vite dev` と `$ vite preview` は SSR アプリでも使用することができます。開発サーバには `configureServer`](/guide/api-plugin#configureserver) 、プレビューサーバには [`configurePreviewServer`](/guide/api-plugin#configurepreviewserver) で SSR ミドルウェアを追加できます。

:::tip 注意
ポストフックを使用して、SSR ミドルウェアが Vite のミドルウェアの後に実行されるようにしてください。
:::
