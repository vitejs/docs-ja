# プラグイン API

Vite プラグインは、Rollup の優れた設計のプラグインインターフェイスを Vite 特有のオプションで拡張しています。その結果、Vite プラグインを一度作成すれば、開発とビルドの両方で動作させることができます。

**以下のセクションを読む前に、まず [Rollup のプラグインドキュメント](https://rollupjs.org/plugin-development/)を読むことをお勧めします。**

<!-- TODO: update the link above to Rolldown's documentation -->

## プラグインの作成

Vite は、確立されたパターンをすぐに提供できるように努めているため、新しいプラグインを作成する前に、[機能ガイド](/guide/features)をチェックして、ニーズが満たされているかどうかを確認してください。また、[互換性のある Rollup プラグイン](https://github.com/rollup/awesome)と [Vite 固有のプラグイン](https://github.com/vitejs/awesome-vite#plugins)の両方の形式で、利用可能なコミュニティープラグインを確認してください。

プラグインを作成する際には、`vite.config.js` にインラインで記述できます。そのために新しいパッケージを作成する必要はありません。あるプラグインが自分のプロジェクトで役に立ったことがわかったら、[エコシステムにいる](https://chat.vite.dev)他の人を助けるために共有することを検討してください。

::: tip
プラグインを学んだり、デバッグしたり、作成したりする際には、 [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) をプロジェクトに含めることをお勧めします。これにより、Vite プラグインの中間状態を検査できます。インストール後、`localhost:5173/__inspect/` にアクセスして、プロジェクトのモジュールや変換スタックを検査できます。インストール方法については、[vite-plugin-inspect のドキュメント](https://github.com/antfu/vite-plugin-inspect)をご覧ください。
![vite-plugin-inspect](../images/vite-plugin-inspect.webp)
:::

## 規約

プラグインが Vite 特有のフックを使用せず、[Rollup 互換のプラグイン](#rollup-plugin-compatibility)として実装できる場合は、[Rollup プラグインの命名規則](https://rollupjs.org/plugin-development/#conventions)を使用することをお勧めします。

- Rollup プラグインは、`rollup-plugin-` のプレフィックスが付いた明確な名前を持つ必要があります。
- package.json に `rollup-plugin` および `vite-plugin` キーワードを含めます。

これにより、プラグインが公開され、純粋な Rollup または WMR ベースのプロジェクトでも使用できるようになります。

Vite 専用プラグインの場合

- Vite プラグインは、`vite-plugin-` のプレフィックスが付いた明確な名前を持つ必要があります。
- package.json に `vite-plugin` キーワードを含めます。
- プラグインのドキュメントに、Vite 専用プラグインになっている理由を詳しく説明するセクションを含める（例えば、Vite 特有のプラグインフックを使用するなど）。

プラグインが特定のフレームワークでしか動作しない場合は、その名前をプレフィックスの一部として含めるべきです。

- Vue プラグインには `vite-plugin-vue-` のプレフィックス
- React プラグインには `vite-plugin-react-` のプレフィックス
- Svelte プラグインには `vite-plugin-svelte-` のプレフィックス

[仮想モジュールの規約](#virtual-modules-convention)も参照してください。

## プラグインの設定

ユーザーはプロジェクトの `devDependencies` にプラグインを追加し、 `plugins` 配列のオプションを使って設定します。

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

偽値（falsy な値）のプラグインは無視され、プラグインを簡単にアクティブ化や非アクティブ化するのに使えます。

また `plugins` は、複数のプラグインを含むプリセットを 1 つの要素として受け入れることもできます。これは、複数のプラグインを使って実装した複雑な機能（フレームワークの統合など）に便利です。配列は内部的にフラット化されます。

```js
// framework-plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## シンプルな例

:::tip
Vite/Rollup プラグインは、実際のプラグインオブジェクトを返すファクトリー関数として作成するのが一般的です。この関数はユーザーがプラグインの動作をカスタマイズするためのオプションを受け付けます。
:::

### カスタムファイルタイプの変換

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // ソースマップがあれば提供する
        }
      }
    },
  }
}
```

### 仮想ファイルのインポート

[次のセクション](#virtual-modules-convention)の例を参照してください。

## 仮想モジュールの規約 {#virtual-modules-convention}

仮想モジュールは、通常の ESM インポート構文を使用して、ビルド時の情報をソースファイルに渡すことができる便利な機構です。

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // 必須、警告やエラーで表示されます
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

これにより、JavaScript でモジュールをインポートできます:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Vite（および Rollup）の仮想モジュールは慣例により、ユーザー向けのパスの先頭に `virtual:` を付けます。エコシステム内の他のプラグインとの衝突を避けるために、可能であればプラグイン名を名前空間として使用すべきです。例えば、`vite-plugin-posts` は、ビルド時間の情報を得るために `virtual:posts` や `virtual:posts/helpers` といった仮想モジュールをインポートするようユーザーに求めることができます。内部的には、Rollup エコシステムの慣例として、仮想モジュールを使用するプラグインは、ID を解決する際にモジュール ID の前に `\0` を付ける必要があります。これにより、他のプラグインが ID を処理しようとするのを防ぎ（ノード解決など）、ソースマップなどのコア機能がこの情報を使用して、仮想モジュールと通常のファイルを区別できます。`\0` はインポート URL で許可されていない文字なので、インポート分析中に置き換える必要があります。`\0{id}` の仮想 ID は、ブラウザーでの開発中に `/@id/__x00__{id}` としてエンコードされてしまいます。ID はプラグインパイプラインに入る前にデコードされて戻ってくるので、これはプラグインフックコードには表示されません。

なお、単一ファイルコンポーネント（.vue や .svelte など。SFC）のスクリプトモジュールのように、実際のファイルから直接派生したモジュールは、この規約に従う必要はありません。SFC では通常、処理時に一連のサブモジュールが生成されますが、これらのコードはファイルシステムにマップして戻せます。これらのサブモジュールに `\0` を使用すると、ソースマップが正しく機能しなくなります。

## 共通のフック

開発中、Vite 開発サーバーは、Rollup が行うのと同じ方法で [Rollup ビルドフック](https://rollupjs.org/plugin-development/#build-hooks)を呼び出すプラグインコンテナーを作成します。

以下のフックはサーバー起動時に一度だけ呼び出されます:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

以下のフックはモジュールのリクエストが来るたびに呼び出されます:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

また、これらのフックは Vite 固有のプロパティを追加した拡張 `options` パラメーターを持ちます。詳しくは [SSR ドキュメント](/guide/ssr#ssr-specific-plugin-logic)に書かれています。

Vite によるバンドルされていない開発サーバーパターンにより、実際のインポーターを導き出すことができない場合があるため、一部の `resolveId` 呼び出しの `importer` 値はルートにある一般的な `index.html` の絶対パスであるかもしれません。Vite の resolve pipeline 内で処理されるインポートについては、インポートの解析段階でインポーターを追跡して、正しい `importer` 値を提供することができます。

以下のフックはサーバーが閉じられる時に呼び出されます:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Vite はパフォーマンスを向上させるために完全な AST のパースを避けるので、[`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) フックは開発中には**呼び出されない**ことに注意してください。

[出力生成フック](https://rollupjs.org/plugin-development/#output-generation-hooks)（`closeBundle` を除く）は開発中には**呼び出されません**。Vite の開発サーバーは `bundle.generate()` を呼び出さず、`rollup.rollup()` だけを呼び出していると考えることができます。

## Vite 特有のフック

Vite プラグインは Vite 特有の目的を果たすフックを提供することもできます。これらのフックは Rollup には無視されます。

### `config`

- **型:** `(config: UserConfig, env: { mode: string, command: string }) => UserConfig | null | void`
- **種類:** `async`, `sequential`

  Vite の設定を解決される前に変更します。このフックは生のユーザー設定（CLI オプションが設定ファイルにマージされたもの）と使用されている `mode` と `command` を公開する現在の設定環境を受け取ります。既存の設定に深くマージされる部分的な設定オブジェクトを返したり、設定を直接変更できます（デフォルトのマージで目的の結果が得られない場合）。

  **例:**

  ```js
  // 部分的な設定を返す（推奨）
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // 設定を直接変更する（マージが動作しない場合のみ使用する）
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning 注意
  ユーザープラグインはこのフックを実行する前に解決されるので、`config` フックの中に他のプラグインを注入しても効果はありません。
  :::

### `configResolved`

- **型:** `(config: ResolvedConfig) => void | Promise<void>`
- **種類:** `async`, `parallel`

  Vite プラグインが解決された後に呼び出されます。このフックを使って、最終的に解決された設定を読み取って保存します。このフックはプラグインがコマンドの実行に基づいて何か別のことをする必要がある場合にも便利です。

  **例:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // 解決された設定を保存
        config = resolvedConfig
      },

      // 保存された設定を他のフックで使用
      transform(code, id) {
        if (config.command === 'serve') {
          // dev: 開発サーバーから呼び出されるプラグイン
        } else {
          // build: Rollup から呼び出されるプラグイン
        }
      },
    }
  }
  ```

  `command` の値は、開発時（CLI で `vite`、`vite dev`、`vite serve` がエイリアス）は `serve` であることに注意してください。

### `configureServer`

- **型:** `(server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>`
- **種類:** `async`, `sequential`
- **参照:** [ViteDevServer](./api-javascript#vitedevserver)

  開発サーバーを設定するためのフック。内部の [connect](https://github.com/senchalabs/connect) アプリにカスタムミドルウェアを追加するのが最も一般的な使用例です:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // カスタムハンドルリクエスト...
      })
    },
  })
  ```

  **ポストミドルウェアの注入**

  `configureServer` フックは内部ミドルウェアがインストールされる前に呼び出されるため、カスタムミドルウェアはデフォルトで内部ミドルウェアより先に実行されます。内部ミドルウェアの**後に**ミドルウェアを注入したい場合は `configureServer` から関数を返すと、内部ミドルウェアのインストール後に呼び出されます:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // 内部ミドルウェアがインストールされた後に呼び出される
      // ポストフックを返す
      return () => {
        server.middlewares.use((req, res, next) => {
          // カスタムハンドルリクエスト...
        })
      }
    },
  })
  ```

  **サーバーアクセスの保存**

  場合によっては、他のプラグインフックが開発サーバーのインスタンスへのアクセスを必要とすることがあります（たとえば、WebSocket サーバー、ファイルシステムウォッチャー、モジュールグラフへのアクセス）。このフックは他のフックでアクセスするためにサーバーインスタンスを保存するためにも使用できます:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // サーバーを使用...
        }
      },
    }
  }
  ```

  `configureServer` は本番ビルドの実行時には呼び出されないため、他のフックはこれがなくても動くようにしておく必要があります。

### `configurePreviewServer`

- **型:** `(server: PreviewServer) => (() => void) | void | Promise<(() => void) | void>`
- **種類:** `async`, `sequential`
- **参照:** [PreviewServer](./api-javascript#previewserver)

  [`configureServer`](/guide/api-plugin.html#configureserver) と同じですがプレビューサーバー用です。`configureServer` と同様に、`configurePreviewServer` フックは他のミドルウェアがインストールされる前に呼び出されます。他のミドルウェアをインストールした**後に**ミドルウェアをインジェクトしたい場合は、`configurePreviewServer` から関数を返すことで、内部のミドルウェアがインストールされた後に呼び出されるようにすることができます:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // 他のミドルウェアがインストールされた後に呼び出される
      // post フックを返却
      return () => {
        server.middlewares.use((req, res, next) => {
          // カスタムハンドルリクエスト...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **型:** `IndexHtmlTransformHook | { order?: 'pre' | 'post', handler: IndexHtmlTransformHook }`
- **種類:** `async`, `sequential`

  `index.html` などの HTML エントリーポイントファイルを変換するための専用フック。このフックは現在の HTML 文字列と変換コンテキストを受け取ります。コンテキストは開発時には [`ViteDevServer`](./api-javascript#vitedevserver) を公開し、ビルド時には Rollup の出力バンドルを公開します。

  このフックは非同期にすることも可能で、次のいずれかを返すことができます:
  - 変換された HTML 文字列
  - 既存の HTML に注入するタグ記述子オブジェクト（`{ tag, attrs, children }`）の配列。各タグは注入箇所を指定できます（デフォルトでは `<head>` の前）
  - 両方を含むオブジェクト `{ html, tags }`

  デフォルトでは `order` は `undefined` で、このフックは HTML が変換された後に適用されます。Vite プラグインのパイプラインを通るべきスクリプトを挿入するためには、`order： 'pre'` を指定すると HTML を処理する前にフックが適用されます。`order： 'post'` は、`order` が未定義であるフックがすべて適用された後にフックを適用します。

  **基本的な例:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **フックの完全なシグネチャー:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    /**
     * 属性の値は必要に応じて自動的にエスケープされます
     */
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * default: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

::: warning 注意
エントリーファイルのカスタム処理があるフレームワークを使用している場合、このフックは呼ばれません（たとえば、[SvelteKit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145)）。
:::

### `handleHotUpdate`

- **型:** `(ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>`
- **種類:** `async`、`sequential`
- **参照:** [HMR API](./api-hmr)

  カスタム HMR 更新処理を実行します。このフックは以下のシグネチャーのコンテキストオブジェクトを受け取ります:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` は変更されたファイルに影響を受けるモジュールの配列です。単一のファイルが複数の提供モジュールに対応している場合があるため（Vue の SFC など）、配列になっています。

  - `read` はファイルの内容を返す非同期の read 関数です。システムによってはファイル変更コールバックがエディタのファイル更新完了前に発生してしまい、`fs.readFile` が空の内容を返すため、この関数が提供されています。渡される read 関数は、この動作を正規化します。

  このフックは以下を選択できます:
  - 影響を受けるモジュールをフィルターして絞り込むことで、HMR がより正確になります。

  - 空の配列を返し、完全なリロードを実行します:

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // Invalidate modules manually
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - 空の配列を返し、クライアントにカスタムイベントを送信して、完全なカスタム HMR 処理を実行します:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    クライアントコードは [HMR API](./api-hmr) を使用して対応するハンドラーを登録する必要があります（これは同じプラグインの `transform` フックによって注入される可能性があります）:

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // カスタムアップデートの実行
      })
    }
    ```

## プラグインの順序 {#plugin-ordering}

Vite プラグインは、さらに（webpack loader と同様の）`enforce` プロパティを指定して、適用の順序を調整できます。`enforce` の値は `"pre"` か `"post"` のいずれかです。解決されたプラグインは、以下の順序になります:

- エイリアス
- `enforce: 'pre'` を指定したユーザープラグイン
- Vite のコアプラグイン
- enforce の値がないユーザープラグイン
- Vite のビルドプラグイン
- `enforce: 'post'` を指定したユーザープラグイン
- Vite ポストビルドプラグイン（minify, manifest, reporting）

これはフックの並び順とは別のものであることに注意してください。フックの並び順は [Rollup フックと同様](https://rollupjs.org/plugin-development/#build-hooks)、`order` 属性に従います。

## 条件付きの適用

デフォルトではプラグインは配信とビルドの両方で起動されます。配信時やビルド時のみに条件付きでプラグインを適用する必要がある場合は、 `apply` プロパティを使って `'build'` か `'serve'` の時にだけプラグインを呼び出します:

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // もしくは 'serve'
  }
}
```

また、関数を使用することで、より精密なコントロールが可能です:

```js
apply(config, { command }) {
  // ビルドにのみ適用するが、SSR には適用しない
  return command === 'build' && !config.build.ssr
}
```

## Rollup プラグインの互換性 {#rollup-plugin-compatibility}

かなりの数の Rollup プラグインが Vite プラグインとして直接動作します（例: `@rollup/plugin-alias` や `@rollup/plugin-json` など）が、すべてではありません。一部のプラグインフックは、バンドルされていない開発サーバーのコンテキストでは意味をなさないためです。

一般的に、Rollup プラグインが以下の基準に適合する限り、Vite プラグインとして動作するでしょう:

- [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) フックを使用していない。
- bundle-phase フックと output-phase フックの間に強い結合がない。

Rollup プラグインがビルドフェーズでのみ意味を持つ場合は、代わりに `build.rollupOptions.plugins` で指定できます。これは `enforce: 'post'` と `apply: 'build'` を設定した Vite プラグインと同じように動作します。

Vite のみのプロパティで既存の Rollup プラグインを拡張することもできます:

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## パスの正規化

Vite は、Windows ではボリュームを維持しつつ、POSIX セパレーター（/）を使用して ID を解決しながらパスを正規化します。一方で、Rollup はデフォルトでは解決されたパスをそのままにするので、Windows では解決された ID は win32 セパレーター（\\）を持つことになります。ただし、Rollup プラグインは `@rollup/pluginutils` の [`normalizePath` ユーティリティー関数](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath)を内部で使用しており、比較を行う前にセパレーターを POSIX に変換しています。これは、これらのプラグインが Vite で使用されている場合、解決された ID の比較に対する `include` と `exclude` の設定パターンやその他の同様のパスが正しく動作することを意味します。

したがって、Vite プラグインでは、解決された ID に対するパスを比較する際、最初に POSIX セパレーターを使用するようにパスを正規化することが重要です。同等の `normalizePath` ユーティリティー関数が `vite` モジュールからエクスポートされます。

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## include/exclude パターンのフィルタリング

Vite は [`@rollup/pluginutils` の `createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) 関数を公開し、Vite 固有のプラグインやインテグレーションが標準の include/exclude フィルタリングのパターンを使用できるようにします。これは Vite コア自体でも使用されています。

### フックフィルター {#hook-filters}

Rolldown は[フックフィルター機能](https://rolldown.rs/plugins/hook-filters)を導入して、Rust と JavaScript のランタイムの間の通信オーバーヘッドを削減しました。この機能により、プラグインはフックを呼び出すタイミングを決定するパターンを指定でき、不要なフック呼び出しを回避することでパフォーマンスを向上させます。

これは Rollup 4.38.0+ および Vite 6.3.0+ でもサポートされています。プラグインを古いバージョンとの後方互換性を持たせるには、フックハンドラー内でもフィルターを実行するようにしてください。

```js
export default function myPlugin() {
  const jsFileRegex = /\.js$/

  return {
    name: 'my-plugin',
    // 例: .js ファイルに対してのみ transform を呼び出す
    transform: {
      filter: {
        id: jsFileRegex,
      },
      handler(code, id) {
        // 後方互換性のための追加チェック
        if (!jsFileRegex.test(id)) return null

        return {
          code: transformCode(code),
          map: null,
        }
      },
    },
  }
}
```

::: tip
[`@rolldown/pluginutils`](https://www.npmjs.com/package/@rolldown/pluginutils) は、`exactRegex` や `prefixRegex` のようなフックフィルター用のいくつかのユーティリティーをエクスポートしています。
:::

## クライアントサーバーとの通信 {#client-server-communication}

Vite の 2.9 から、プラグインによりクライアントとの通信に役立つ機能をいくつか提供しています。

### サーバーからクライアントへ

プラグイン側からは `server.ws.send` を使うことでクライアントへイベントを配信できます:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip 注意
イベント名には**常にプレフィックスを付けて**他のプラグインとの衝突を避けることを推奨します。
:::

クライアント側では、[`hot.on`](/guide/api-hmr.html#hot-on-event-cb) を使用してイベントをリッスンします:

```ts twoslash
import 'vite/client'
// ---cut---
// クライアント側
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // hello
  })
}
```

### クライアントからサーバーへ

クライアントからサーバーへイベント送信する時 [`hot.send`](/guide/api-hmr.html#hot-send-event-data) を使うことができます:

```ts
// クライアント側
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

この時、サーバー側では `server.ws.on` を使ってイベントをリッスンします:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // Hey!
          // クライアントへの返信のみ（必要であれば）
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### カスタムイベント用の TypeScript {#typescript-for-custom-events}

内部では、Vite はペイロードの型を `CustomEventMap` インターフェイスから推論しますが、インターフェイスを拡張することでカスタムイベントを型付けすることも可能です。

:::tip 注意
TypeScript の型宣言ファイルを指定する際は `.d.ts` 拡張子を含めてください。そうしなければ、TypeScript はモジュールがどのファイルを拡張しようとしているのかを認識できない可能性があります。
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 'event-key': payload
  }
}
```

このインターフェイス拡張は、イベント `T` に対するペイロードの型を推論するために `InferCustomEventPayload<T>` により使用されます。このインターフェイスの使用に関する詳しい情報については、[HMR API のドキュメント](./api-hmr#hmr-api)を参照してください。

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---cut---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // ペイロードの型は { msg: string } になります
})
import.meta.hot?.on('unknown:event', (payload) => {
  // ペイロードの型は any になります
})
```
