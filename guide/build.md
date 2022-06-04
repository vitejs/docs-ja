# 本番環境用のビルド

作成したアプリケーションを本番環境にデプロイするには、`vite build` コマンドを実行するだけです。デフォルトでは、ビルドのエントリーポイントとして `<root>/index.html` を使用し、静的ホスティングサービスで提供するのに適したアプリケーションバンドルを生成します。一般的なサービスについてのガイドは [静的サイトのデプロイ](./static-deploy) をご覧ください。

## ブラウザの互換性

本番バンドルではモダンな JavaScript のサポートを前提としています。Vite はデフォルトでは [ネイティブ ES モジュール](https://caniuse.com/es6-module) と [ネイティブ ESM の動的インポート](https://caniuse.com/es6-module-dynamic-import) および [`import.meta`](https://caniuse.com/mdn-javascript_statements_import_meta) をサポートするブラウザを対象としています:

- Chrome >=87
- Firefox >=78
- Safari >=13
- Edge >=88

```
defaults and supports es6-module and supports es6-module-dynamic-import, not opera > 0, not samsung > 0, not and_qq > 0
```

[`build.target` 設定オプション](/config/#build-target) を介してカスタムターゲットを指定することができます。最も低いターゲットは `es2015` です。

Vite はデフォルトでは構文変換のみを扱い **デフォルトでは Polyfill をカバーしていない** ことに注意してください。ユーザのブラウザの UserAgent 文字列に基づいて Polyfill バンドルを自動生成するサービスの [Polyfill.io](https://polyfill.io/v3/) をチェックしてみてください。

レガシーブラウザは [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) を介してサポートすることができます。このプラグインはレガシーチャンクとそれに対応する ES 言語機能 Polyfill を自動的に生成します。レガシーチャンクは ESM をネイティブにサポートしていないブラウザでのみ条件付きで読み込まれます。

## Public Base Path

- 関連: [静的アセットの取り扱い](./assets)

ネストしたパブリックパスの下にプロジェクトをデプロイする場合は [`base` 設定オプション](/config/#base) を指定するだけでそれに伴いすべてのアセットパスが書き換えられます。このオプションは `vite build --base=/my/public/path/` のようにコマンドラインフラグとして指定することもできます。

JS でインポートされたアセット URL、CSS の `url()` 参照、`.html` ファイルのアセット参照はビルド時にこのオプションを考慮して自動的に調整されます。

例外はその場で動的に URL を連結する必要がある場合です。この場合は、グローバルに注入された `import.meta.env.BASE_URL` 変数を使用することができ、これがベースのパブリックパスになります。この変数はビルド時に静的に置き換えられるので、そのままの形で表示されなければならないことに注意してください（つまり、`import.meta.env['BASE_URL']` は動作しません）。

## ビルドのカスタマイズ

ビルドは様々な [build 設定オプション](/config/#ビルドオプション) でカスタマイズできます。特に、基礎となる [Rollup options](https://rollupjs.org/guide/en/#big-list-of-options) を `build.rollupOptions` で直接調整することができます:

```js
// vite.config.js
module.exports = defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
    }
  }
})
```

例えば、ビルド時にのみ適用されるプラグインを使って複数の Rollup 出力を指定することができます。

## チャンク戦略

チャンクの分割方法は `build.rollupOptions.output.manualChunks` で設定できます（[Rollup ドキュメント](https://rollupjs.org/guide/en/#outputmanualchunks)参照）。Vite 2.8 まではデフォルトのチャンク戦略は `index` と `vendor` にチャンクを分割していました。これは SPA にはよい戦略の場合もありますが、すべての Vite ターゲットのユースケースに対して一般的な解決策を提供するのは困難です。Vite 2.9 からは、`manualChunks` はデフォルトでは変更されなくなりました。設定ファイルに `splitVendorChunkPlugin` を追加すれば、vender を分割するチャンク戦略を引き続き使用できます:

```js
// vite.config.js
import { splitVendorChunkPlugin } from 'vite'
module.exports = defineConfig({
  plugins: [splitVendorChunkPlugin()]
})
```

カスタムロジックによる合成が必要な場合に備えて、この戦略は `splitVendorChunk({ cache: SplitVendorChunkCache })` ファクトリとしても提供されます。この場合、ビルドウォッチモードが正しく動作するように、`cache.reset()` は `buildStart` で呼び出す必要があります。

## ファイル変更時のリビルド

`vite build --watch` で rollup のウォッチャを有効にすることができます。 また、`build.watch` を介して基礎となる [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options) を直接調整することもできます:

```js
// vite.config.js
module.exports = defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    }
  }
})
```

`--watch` フラグを有効にすると、`vite.config.js` やバンドルするファイルを変更した際に、リビルドがトリガーされます。

## マルチページアプリ

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

開発時には、`/nested/` に移動またはリンクするだけで、通常の静的ファイルサーバと同じように期待通りに動作します。

ビルド時には、エントリーポイントとして複数の `.html` ファイルを指定するだけです:

```js
// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')
      }
    }
  }
})
```

別のルートを指定した場合でも、入力パスを解決する際には `__dirname` が vite.config.js ファイルのフォルダになることに注意してください。そのため、`resolve` の引数に自分の `root` エントリを追加する必要があります。

## ライブラリモード

ブラウザ向けのライブラリを開発していると、実際のライブラリをインポートしたテスト/デモページにほとんどの時間を費やすことになると思われます。Vite を使えば、`index.html` をその目的のために使うことができスムーズな開発を行うことができます。

配布のためにライブラリをバンドルするときには [`build.lib` 設定オプション](/config/#build-lib) を使用します。また、ライブラリにバンドルしたくない依存関係、例えば `vue` や `react` などは必ず外部化してください:

```js
// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // 適切な拡張子が追加されます
      fileName: 'my-lib'
    },
    rollupOptions: {
      // ライブラリにバンドルされるべきではない依存関係を
      // 外部化するようにします
      external: ['vue'],
      output: {
        // 外部化された依存関係のために UMD のビルドで使用する
        // グローバル変数を提供します
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

エントリーファイルには、パッケージのユーザがインポートできるエクスポートが含まれることになります:

```js
// lib/main.js
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

この設定で `vite build` を実行するとライブラリの出荷を目的とした Rollup プリセットが使用され 2 つのバンドルフォーマットが生成されます。`es` と `umd` (`build.lib` で設定可能):

```
$ vite build
building for production...
[write] my-lib.es.mjs 0.08kb, brotli: 0.07kb
[write] my-lib.umd.js 0.30kb, brotli: 0.16kb
```

ライブラリに推奨される `package.json`:

```json
{
  "name": "my-lib",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.es.mjs",
  "exports": {
    ".": {
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js"
    }
  }
}
```
