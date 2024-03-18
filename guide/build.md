# 本番環境用のビルド

作成したアプリケーションを本番環境にデプロイするには、`vite build` コマンドを実行するだけです。デフォルトでは、ビルドのエントリーポイントとして `<root>/index.html` を使用し、静的ホスティングサービスで提供するのに適したアプリケーションバンドルを生成します。一般的なサービスについてのガイドは [静的サイトのデプロイ](./static-deploy) をご覧ください。

## ブラウザーの互換性 {#browser-compatibility}

本番バンドルではモダンな JavaScript のサポートを前提としています。Vite はデフォルトでは [ネイティブ ES モジュール](https://caniuse.com/es6-module)、 [ネイティブ ESM の動的インポート](https://caniuse.com/es6-module-dynamic-import)、 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) をサポートするブラウザーを対象としています:

- Chrome >=87
- Firefox >=78
- Safari >=14
- Edge >=88

[`build.target` 設定オプション](/config/build-options.md#build-target) を介してカスタムターゲットを指定することができます。最も低いターゲットは `es2015` です。

Vite はデフォルトでは構文変換のみを扱い **Polyfill をカバーしていない** ことに注意してください。ユーザーのブラウザーの UserAgent 文字列に基づいて Polyfill バンドルを自動生成するサービスの [Polyfill.io](https://polyfill.io/) をチェックしてみてください。

レガシーブラウザーは [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を介してサポートすることができます。このプラグインはレガシーチャンクとそれに対応する ES 言語機能 Polyfill を自動的に生成します。レガシーチャンクは ESM をネイティブにサポートしていないブラウザーでのみ条件付きで読み込まれます。

## Public Base Path

- 関連: [静的アセットの取り扱い](./assets)

ネストしたパブリックパスの下にプロジェクトをデプロイする場合は [`base` 設定オプション](/config/shared-options.md#base) を指定するだけでそれに伴いすべてのアセットパスが書き換えられます。このオプションは `vite build --base=/my/public/path/` のようにコマンドラインフラグとして指定することもできます。

JS でインポートされたアセット URL、CSS の `url()` 参照、`.html` ファイルのアセット参照はビルド時にこのオプションを考慮して自動的に調整されます。

例外はその場で動的に URL を連結する必要がある場合です。この場合は、グローバルに注入された `import.meta.env.BASE_URL` 変数を使用することができ、これがベースのパブリックパスになります。この変数はビルド時に静的に置き換えられるので、そのままの形で表示されなければならないことに注意してください（つまり、`import.meta.env['BASE_URL']` は動作しません）。

ベースパスの高度な制御については、[高度なベースパスの設定](#advanced-base-options)を参照してください。

## ビルドのカスタマイズ

ビルドは様々な [build 設定オプション](/config/build-options.md) でカスタマイズできます。特に、基礎となる [Rollup options](https://rollupjs.org/configuration-options/) を `build.rollupOptions` で直接調整することができます:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

例えば、ビルド時にのみ適用されるプラグインを使って複数の Rollup 出力を指定することができます。

## チャンク戦略

チャンクの分割方法は `build.rollupOptions.output.manualChunks` で設定できます（[Rollup ドキュメント](https://rollupjs.org/configuration-options/#output-manualchunks)参照）。Vite 2.8 まではデフォルトのチャンク戦略は `index` と `vendor` にチャンクを分割していました。これは SPA にはよい戦略の場合もありますが、すべての Vite ターゲットのユースケースに対して一般的な解決策を提供するのは困難です。Vite 2.9 からは、`manualChunks` はデフォルトでは変更されなくなりました。設定ファイルに `splitVendorChunkPlugin` を追加すれば、vendor を分割するチャンク戦略を引き続き使用できます:

```js
// vite.config.js
import { splitVendorChunkPlugin } from 'vite'
export default defineConfig({
  plugins: [splitVendorChunkPlugin()],
})
```

カスタムロジックによる合成が必要な場合に備えて、この戦略は `splitVendorChunk({ cache: SplitVendorChunkCache })` ファクトリーとしても提供されます。この場合、ビルドウォッチモードが正しく動作するように、`cache.reset()` は `buildStart` で呼び出す必要があります。

::: warning
このプラグインを使用する場合は、 `build.rollupOptions.output.manualChunks` を関数形式で使用する必要があります。オブジェクト形式を使用すると、プラグインは何の効果も持ちません。
:::

## 読み込みエラーのハンドリング

Vite は動的インポートの読み込みに失敗したときに `vite:preloadError` イベントを出力します。`event.payload` には元のインポートエラーが含まれます。`event.preventDefault()` を呼んだ場合、エラーはスローされません。

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // たとえば、ページをリロードする
})
```

新しいデプロイが行われると、ホスティングサービスは前回のデプロイからアセットを削除することがあります。その結果、新しいデプロイメントの前にあなたのサイトを訪れたユーザーがインポートエラーに遭遇してしまう可能性があります。このエラーが起こるのは、そのユーザーのデバイス上で実行されているアセットが古くなり、対応する削除された古いチャンクをインポートしようとしてしまうためです。このイベントは、このような状況に対処するのに便利です。

## ファイル変更時のリビルド

`vite build --watch` で rollup のウォッチャーを有効にすることができます。 また、`build.watch` を介して基礎となる [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) を直接調整することもできます:

```js
// vite.config.js
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

`--watch` フラグを有効にすると、`vite.config.js` やバンドルするファイルを変更した際に、リビルドがトリガーされます。

## マルチページアプリ {#multi-page-app}

以下のようなソースコード構造があるとします:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

開発時には、`/nested/` に移動またはリンクするだけで、通常の静的ファイルサーバーと同じように期待通りに動作します。

ビルド時には、エントリーポイントとして複数の `.html` ファイルを指定するだけです:

```js twoslash
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

別のルートを指定した場合でも、入力パスを解決する際には `__dirname` が vite.config.js ファイルのフォルダーになることに注意してください。そのため、`resolve` の引数に自分の `root` エントリーを追加する必要があります。

HTML ファイルの場合、Vite は `rollupOptions.input` オブジェクトのエントリーに指定された名前を無視し、代わりに dist フォルダーに HTML アセットを生成する際にファイルの解決済み ID を尊重することに注意してください。これにより、開発サーバーの動作方法と一貫した構造が保証されます。

## ライブラリーモード {#library-mode}

ブラウザー向けのライブラリーを開発していると、実際のライブラリーをインポートしたテスト/デモページにほとんどの時間を費やすことになると思われます。Vite を使えば、`index.html` をその目的のために使うことができスムーズな開発を行うことができます。

配布のためにライブラリーをバンドルするときには [`build.lib` 設定オプション](/config/build-options.md#build-lib) を使用します。また、ライブラリーにバンドルしたくない依存関係、例えば `vue` や `react` などは必ず外部化してください:

```js twoslash
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // 複数のエントリーポイントのディクショナリや配列にもできます
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // 適切な拡張子が追加されます
      fileName: 'my-lib'
    },
    rollupOptions: {
      // ライブラリーにバンドルされるべきではない依存関係を
      // 外部化するようにします
      external: ['vue'],
      output: {
        // 外部化された依存関係のために UMD のビルドで使用する
        // グローバル変数を提供します
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

エントリーファイルには、パッケージのユーザーがインポートできるエクスポートが含まれることになります:

```js
// lib/main.js
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

この設定で `vite build` を実行するとライブラリーの出荷を目的とした Rollup プリセットが使用され 2 つのバンドルフォーマットが生成されます。`es` と `umd`（`build.lib` で設定可能）:

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

ライブラリーに推奨される `package.json`:

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

あるいは、複数のエントリーポイントを公開する場合:

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

::: tip ファイル拡張子
`package.json` が `"type": "module"` を含まない場合、Vite は Node.js の互換性のため異なるファイル拡張子を生成します。`.js` は `.mjs` に、`.cjs` は `.js` になります。
:::

::: tip 環境変数
ライブラリーモードでは、すべての [`import.meta.env.*`](./env-and-mode.md) の使用箇所はプロダクション用にビルドする際、静的に置き換えられます。ただし、`process.env.*` の使用箇所はそうではないので、ライブラリーの利用者は動的にそれを変更できます。これが望ましくない場合は、例えば `define: { 'process.env.NODE_ENV': '"production"' }` を使用して静的に置き換えたり、[`esm-env`](https://github.com/benmccann/esm-env) を使用してバンドラーやランタイムとの互換性を高めることができます。
:::

::: warning 高度な使い方
ライブラリーモードには、ブラウザー向けのライブラリーや JS フレームワークライブラリーのためのシンプルで opinionated な設定が含まれています。非ブラウザーライブラリーをビルドする場合、または高度なビルドフローを必要とする場合は、[Rollup](https://rollupjs.org) または [esbuild](https://esbuild.github.io) を直接使用できます。
:::

## 高度なベースパスの設定 {#advanced-base-options}

::: warning
この機能は実験的です。[フィードバックをしてください](https://github.com/vitejs/vite/discussions/13834)。
:::

高度なユースケースでは、異なるキャッシュ戦略を利用する場合を例として、デプロイされたアセットファイルとパブリックファイルが別々のパスに存在することがあります。
ユーザーは 3 つの異なるパスにデプロイすることを選択することがあります:

- 生成されたエントリー HTML ファイル（SSR により処理されることがある）
- 生成されたハッシュ付きのアセット（JS や CSS や画像などのほかのファイル）
- コピーされた[パブリックファイル](assets.md#the-public-directory)

このような事例では単一の静的な [base](#public-base-path) だけでは不十分です。Vite は `experimental.renderBuiltUrl` により、高度なベースパスの設定に対する実験的なサポートを提供します。

<!-- prettier-ignore-start -->
```ts twoslash
import type { UserConfig } from 'vite'
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostType }) {
    if (hostType === 'js') {
      return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    } else {
      return { relative: true }
    }
  },
},
// ---cut-after---
}
```
<!-- prettier-ignore-end -->

ハッシュ付きのアセットファイルとパブリックファイルが一緒にデプロイされていない場合は、関数に渡される 2 つ目の `context` パラメーターに含まれるアセット `type` を使って、それぞれのグループに対する設定を独立して定義できます。

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
const config: UserConfig = {
  // ---cut-before---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // ---cut-after---
}
```

渡される `filename` はデコードされた URL であり、関数が URL 文字列を返す場合には、その文字列もデコードする必要があるということに注意してください。Vite は URL をレンダリングする時にエンコーディングを自動的に処理します。ランタイムコードはそのままレンダリングされるため、`runtime` を持つオブジェクトが返される場合には、必要な場所で自分自身でエンコーディングを処理する必要があります。
