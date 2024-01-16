# v4 からの移行

## Node.js サポート

Vite は EOL となった Node.js 14 / 16 / 17 / 19 をサポートしなくなりました。今後は、Node.js 18 / 20+ が必要です。

## Rollup 4

Vite は現在、Rollup 4 を使用しており、その破壊的変更を含んでいます。具体的には：

- Import assertions（`assertions` プロパティ）は import attributes（`attributes` プロパティ）にリネームされました
- Acorn プラグインはサポートされなくなりました
- Vite プラグインにおいて、`this.resolve` `skipSelf` オプションはデフォルトが `true` になりました
- Vite プラグインにおいて、`this.parse` は今のところ `allowReturnOutsideFunction` オプションのみをサポートします

[`build.rollupOptions`](/config/build-options.md#build-rollupoptions) でのビルド関連の変更については、[Rollup のリリースノート](https://github.com/rollup/rollup/releases/tag/v4.0.0)の全ての破壊的変更をお読みください。

TypeScript を使用している場合は `moduleResolution: 'bundler'`（または `node16`/`nodenext`）を必ず設定してください。Rollup 4 に必要なためです。もしくは、そのかわりに `skipLibCheck: true` を設定することもできます。

## CJS Node API の非推奨化

Vite の CJS Node API は非推奨になりました。今後、`require('vite')` を呼ぶときは、非推奨の警告メッセージが出力されます。ファイルやフレームワークを更新して、代わりに Vite の ESM ビルドをインポートするとよいでしょう。

基本的な Vite のプロジェクトでは、以下のようになっていることを確認してください：

1. `vite.config.js` ファイルの内容が ESM 構文を使っていること
2. 最も近い `package.json` ファイルが `"type": "module"` を含むか、`.mjs`/`.mts` 拡張子を利用すること（例：`vite.config.mjs` か `vite.config.mts`）

その他のプロジェクトでは、いくつかの一般的な方法があります：

- **ESM をデフォルトとして設定し、必要に応じて CJS をオプトインする：** プロジェクトの `package.json` に `"type": "module"` を追加します。これにより、すべての `*.js` ファイルは ESM として解釈され、ESM の構文を使用する必要があります。ファイルの拡張子を `.cjs` に変更することで、CJS を引き続き使用できます。
- **CJS をデフォルトとして設定し、必要に応じて ESM をオプトインする：** プロジェクトの `package.json` に `"type": "module"` が含まれていない場合、すべての `*.js` ファイルは CJS として解釈されます。ファイルの拡張子を `.mjs` に変更して、ESM を使用できます。
- **Vite を動的にインポートする：** CJS を引き続き使用する必要がある場合、`import('vite')` を使用して Vite を動的にインポートできます。これにはコードが `async` コンテキストで記述されている必要がありますが、Vite の API はほとんど非同期であるため、十分対処できるでしょう。

より詳しい情報は、[トラブルシューティングガイド](/guide/troubleshooting.html#vite-cjs-node-api-deprecated)を参照してください。

## `define` および `import.meta.env.*` の置換方法の再設計

Vite 4 では、[`define`](/config/shared-options.md#define) および [`import.meta.env.*`](/guide/env-and-mode.md#env-variables) の機能は開発中とビルドにおいて異なる置換方法を使用していました：

- 開発中では、両機能は `globalThis` および `import.meta` にグローバル変数として挿入されます
- ビルドでは、両機能は正規表現によって静的に置換されます。

この結果、変数へのアクセスにおいて、開発中とビルドでの整合性に欠け、時折ビルドが失敗することさえありました。例えば：

```js
// vite.config.js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
})
```

```js
const data = { __APP_VERSION__ }
// 開発中: { __APP_VERSION__: "1.0.0" } ✅
// ビルド: { "1.0.0" } ❌

const docs = 'I like import.meta.env.MODE'
// 開発中: "I like import.meta.env.MODE" ✅
// ビルド: "I like "production"" ❌
```

Vite 5 では、`esbuild` を使用してビルドでの置換を処理することで、開発中の挙動との整合性が取れるようになりました。

すでに `define` の値は esbuild の構文に従うべきことが明文化されているため、この変更はほとんどのセットアップに影響を与えないはずです：

> [esbuild の動作](https://esbuild.github.io/api/#define)と矛盾しないように、式は JSON オブジェクト（null, boolean, number, string, array, object）か単一の識別子でなければなりません。

しかし、引き続き、値を直接静的に置換し続けたい場合は、[`@rollup/plugin-replace`](https://github.com/rollup/plugins/tree/master/packages/replace) を使用できます。

## 一般的な変更点

### 外部化された SSR モジュールの値が本番環境のものと一致するように

Vite 4 では、外部化された SSR モジュールは、相互運用性の向上のために `.default` および `.__esModule` の取り扱い処理でラップされていますが、ランタイム環境（例：Node.js）によって読み込まれた際の本番環境の挙動と一致しないため、捉えにくい不整合が発生します。デフォルトで、プロジェクトのすべての直接依存関係は SSR 外部化されています。

Vite 5 は、本番環境の挙動に一致させるために `.default` および `.__esModule` の取り扱い処理を削除しました。実際には、適切にパッケージ化された依存関係には影響を与えないはずですが、新しいモジュールの読み込みに関する問題が発生した場合、次のようなリファクタリングを試すとよいでしょう：

```js
// 変更前：
import { foo } from 'bar'

// 変更後：
import _bar from 'bar'
const { foo } = _bar
```

```js
// 変更前：
import foo from 'bar'

// 変更後：
import * as _foo from 'bar'
const foo = _foo.default
```

これらの変更は Node.js の挙動に一致していることから、Node.js でインポートすることでもテストできます。以前の挙動を維持したい場合は、`legacy.proxySsrExternalModules` を `true` に設定できます。

### `worker.plugins` は関数に変更されました

Vite 4 では、[`worker.plugins`](/config/worker-options.md#worker-plugins) はプラグインの配列（`(Plugin | Plugin[])[]`）を受け入れていました。Vite 5 からは、プラグインの配列を返す関数（`() => (Plugin | Plugin[])[]`）を設定する必要があります。この変更は、並行に実行されるワーカーのビルドが、より一貫して予測可能に実行されるようにするために必要でした。

### `.` を含むパスが index.html にフォールバックできるように

Vite 4 では、[`appType`](/config/shared-options.md#apptype) が `'spa'`（デフォルト）に設定されている場合でも、開発中に `.` を含むパスにアクセスした際に、index.html　にフォールバックしませんでした。Vite 5 からは、index.html にフォールバックします。

なお、画像のパスが存在しないファイルを指していても（例：`<img src="./file-does-not-exist.png">`）、今後ブラウザーはコンソールに 404 エラーメッセージを表示しなくなるので注意してください。

### 開発時とプレビュー時の HTML 配信動作の一致するように

Vite 4 では、開発およびプレビューサーバーはディレクトリー構造と末尾のスラッシュに基づいて異なるアルゴリズムで HTML を配信してしました。これにより、ビルドされたアプリをテストする際に整合性の問題が発生していました。Vite 5 は、単一の動作にリファクタリングされ、次のファイル構造では、以下のような動作をします：

```
├── index.html
├── file.html
└── dir
    └── index.html
```

| Request           | 変更前 (開発)                      | 変更前 (プレビュー) | 変更後 (開発 & プレビュー)         |
| ----------------- | ---------------------------------- | ------------------- | ---------------------------------- |
| `/dir/index.html` | `/dir/index.html`                  | `/dir/index.html`   | `/dir/index.html`                  |
| `/dir`            | `/index.html` (SPA フォールバック) | `/dir/index.html`   | `/index.html` (SPA フォールバック) |
| `/dir/`           | `/dir/index.html`                  | `/dir/index.html`   | `/dir/index.html`                  |
| `/file.html`      | `/file.html`                       | `/file.html`        | `/file.html`                       |
| `/file`           | `/index.html` (SPA フォールバック) | `/file.html`        | `/file.html`                       |
| `/file/`          | `/index.html` (SPA フォールバック) | `/file.html`        | `/index.html` (SPA フォールバック) |

### デフォルトではマニフェストファイルは `.vite` ディレクトリーに生成されるように

Vite 4 では、マニフェストファイル（[`build.manifest`](/config/build-options.md#build-manifest) および [`build.ssrManifest`](/config/build-options.md#build-ssrmanifest)）はデフォルトでは [`build.outDir`](/config/build-options.md#build-outdir) の直下に生成されていました。

Vite 5 からは、これらのファイルはデフォルトでは `build.outDir` 内の `.vite` ディレクトリーに生成されます。この変更により、`build.outDir` にコピーされるときに同じファイル名を持つ `public` ディレクトリーのマニフェストファイルとの競合を回避できます。

### 対応する CSS ファイルは manifest.json ファイルのトップレベル項目としてリストされない

Vite 4 では、JavaScript エントリーポイントに対応する CSS ファイルもマニフェストファイル ([`build.manifest`](/config/build-options.md#build-manifest)) のトップレベルエントリーとしてリストされていました。これらのエントリーは意図せずに追加されたもので、単純な場合にのみ機能しました。

Vite 5 では、対応する CSS ファイルは JavaScript エントリーファイルのセクション内にしかありません。
JS ファイルを注入する場合、対応する CSS ファイルを[注入する必要があります](/guide/backend-integration.md#:~:text=%3C!%2D%2D%20if%20production%20%2D%2D%3E%0A%3Clink%20rel%3D%22stylesheet%22%20href%3D%22/assets/%7B%7B%20manifest%5B%27main.js%27%5D.css%20%7D%7D%22%20/%3E%0A%3Cscript%20type%3D%22module%22%20src%3D%22/assets/%7B%7B%20manifest%5B%27main.js%27%5D.file%20%7D%7D%22%3E%3C/script%3E)。
CSS を個別に挿入する必要がある場合は、別のエントリーポイントとして追加する必要があります。

### CLI ショートカットには追加の `Enter` キーが必要に

CLI ショートカット、例えば開発サーバーを再起動するための `r` は、ショートカットをトリガーするために追加の `Enter` キーの押下が必要になりました。例えば、開発サーバーを再起動するには `r + Enter` が必要です。

この変更により、Vite が OS 固有のショートカットまでもを制御するのを防ぎ、他のプロセスと Vite 開発サーバーを組み合わせた際の互換性が向上し、[以前の問題](https://github.com/vitejs/vite/pull/14342)を回避できます。

### TypeScript の `experimentalDecorators` と `useDefineForClassFields` の挙動の更新

Vite 5 では、esbuild 0.19 を使用し、esbuild 0.18 の互換性レイヤーを削除しており、[`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators) と [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields) の処理が変更されました。

- **`experimentalDecorators` はデフォルトで無効になりました**

  デコレータを使用するには、`tsconfig.json` で `compilerOptions.experimentalDecorators` を `true` に設定する必要があります。

- **`useDefineForClassFields` のデフォルトは TypeScript の `target` 値に依存します**

  `target` が `ESNext` または `ES2022` またはそれ以降でない場合、または `tsconfig.json` ファイルが存在しない場合、`useDefineForClassFields` はデフォルトで `false` に設定され、これは `esbuild.target` のデフォルトが `esnext` であることで問題が発生する可能性があります。これは[静的初期化ブロック](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)にトランスパイルされ、ブラウザーでサポートされていない可能性があります。

  したがって、`tsconfig.json` を設定する際に `target` を `ESNext` または `ES2022` またはそれ以降に設定するか、明示的に `useDefineForClassFields` を `true` に設定することが推奨されています。

```jsonc
{
  "compilerOptions": {
    // デコレータを使用する場合、trueにします
    "experimentalDecorators": true,
    // ブラウザーでパースエラーに遭遇した場合、trueにします
    "useDefineForClassFields": true
  }
}
```

### `--https` フラグおよび `https: true` の削除

`--https` フラグは、内部で `server.https: true` および `preview.https: true` を設定します。この設定は、[Vite 3 で削除された自動的な https 証明書生成機能](https://v3.vitejs.dev/guide/migration.html#automatic-https-certificate-generation)と一緒に使用されることを意図していました。したがって、この設定は証明書のない Vite の HTTPS サーバーを開始するため、もはや有用ではありません。

[`@vitejs/plugin-basic-ssl`](https://github.com/vitejs/vite-plugin-basic-ssl) または [`vite-plugin-mkcert`](https://github.com/liuweiGL/vite-plugin-mkcert) を使用している場合、これらはすでに `https` 設定を内部で行っているため、設定から `--https`、`server.https: true`、および `preview.https: true` を削除できます。

### `resolvePackageEntry` および `resolvePackageData` の API の削除

`resolvePackageEntry` および `resolvePackageData` の API は削除されました。これらの API は Vite の内部実装を公開し、過去に Vite 4.3 での最適化を妨げたためです。これらの API はサードパーティのパッケージで置き換えることができます。例えば：

- `resolvePackageEntry`: [`import.meta.resolve`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/import.meta/resolve) または [`import-meta-resolve`](https://github.com/wooorm/import-meta-resolve) パッケージを使用できます。
- `resolvePackageData`: 上記と同じで、パッケージディレクトリーを遡ってルートの `package.json` を取得するか、コミュニティーの [`vitefu`](https://github.com/svitejs/vitefu) パッケージを使用できます。

```js
import { resolve } from 'import-meta-env'
import { findDepPkgJsonPath } from 'vitefu'
import fs from 'node:fs'

const pkg = 'my-lib'
const basedir = process.cwd()

// `resolvePackageEntry`:
const packageEntry = resolve(pkg, basedir)

// `resolvePackageData`:
const packageJsonPath = findDepPkgJsonPath(pkg, basedir)
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
```

## 非推奨な API の削除

- CSS ファイルのデフォルトエクスポート（例： `import style from './foo.css'`）: 代わりに `?inline` クエリーを使用してください
- `import.meta.globEager`: 代わりに `import.meta.glob('*', { eager: true })` を使用してください
- `ssr.format: 'cjs'` と `legacy.buildSsrCjsExternalHeuristics` ([#13816](https://github.com/vitejs/vite/discussions/13816))
- `server.middlewareMode: 'ssr'` と `server.middlewareMode: 'html'`: 代わりに [`appType`](/config/shared-options.md#apptype) + [`server.middlewareMode: true`](/config/server-options.md#server-middlewaremode) を使用してください ([#8452](https://github.com/vitejs/vite/pull/8452))

## 高度な内容

プラグインやツールの作成者にのみ影響する変更点があります。

- [[#14119] refactor!: merge `PreviewServerForHook` into `PreviewServer` type](https://github.com/vitejs/vite/pull/14119)
  - `configurePreviewServer` フックは `PreviewServerForHook` 型の代わりに　`PreviewServer` 型を受け入れるようになりました。
- [[#14818] refactor(preview)!: use base middleware](https://github.com/vitejs/vite/pull/14818)
  - `configurePreviewServer` から返された関数で追加されたミドルウェアは、`req.url` の値を比較する際に `base` の値を持たなくなりました。これにより、開発サーバーと整合性を取るようになりました。必要であれば、`configResolved` フックから `base` を確認できます。
- [[#14834] fix(types)!: expose httpServer with Http2SecureServer union](https://github.com/vitejs/vite/pull/14834)
  - `http.Server | http2.Http2SecureServer` は、適切な場合には `http.Server` の代わりに使用されるようになりました。

また、少数のユーザーにのみ影響する破壊的変更が他にもあります。

- [[#14098] fix!: avoid rewriting this (reverts #5312)](https://github.com/vitejs/vite/pull/14098)
  - デフォルトではビルド時にトップレベルの `this` は `globalThis` に書き換えられていました。この挙動は削除されました。
- [[#14231] feat!: add extension to internal virtual modules](https://github.com/vitejs/vite/pull/14231)
  - 内部のバーチャルモジュールの ID に拡張子 (`.js`) が追加されました。
- [[#14583] refactor!: remove exporting internal APIs](https://github.com/vitejs/vite/pull/14583)
  - 意図せず露出されていた内部用 API が削除されました：`isDepsOptimizerEnabled` and `getDepOptimizationConfig`
  - エクスポートされていた内部用の型が削除されました：`DepOptimizationResult`, `DepOptimizationProcessing`, and `DepsOptimizer`
  - `ResolveWorkerOptions` 型が `ResolvedWorkerOptions` 型にリネームされました
- [[#5657] fix: return 404 for resources requests outside the base path](https://github.com/vitejs/vite/pull/5657)
  - 今まで Vite は `Accept: text/html` なしでのベースパス外のリクエストに応答し、それらがベースパス付きでリクエストされたかのように処理していました。Vite はそのような処理を行わずに、代わりに 404 を返すようになりました。
- [[#14723] fix(resolve)!: remove special .mjs handling](https://github.com/vitejs/vite/pull/14723)
  - 今まで、ライブラリーの `"exports"` フィールドが `.mjs` ファイルにマップされている場合では、Vite は依然として一部のライブラリーとの互換性を修正するために `"browser"` および `"module"` フィールドを利用しようとしました。この動作は削除され、exports 解決アルゴリズムに整合するようになりました。
- [[#14733] feat(resolve)!: remove `resolve.browserField`](https://github.com/vitejs/vite/pull/14733)
  - [`resolve.mainFields`](/config/shared-options.md#resolve-mainfields) の更新されたデフォルト値の `['browser', 'module', 'jsnext:main', 'jsnext']` により、 `resolve.browserField` は Vite 3 から非推奨化されました
- [[#14855] feat!: add isPreview to ConfigEnv and resolveConfig](https://github.com/vitejs/vite/pull/14855)
  - `ConfigEnv` オブジェクトの `ssrBuild` を `isSsrBuild` にリネームしました
- [[#14945] fix(css): correctly set manifest source name and emit CSS file](https://github.com/vitejs/vite/pull/14945)
  - CSS ファイル名はチャンクの名前に基づいて生成されるようになりました。

## v3 からの移行

Vite v4 ドキュメントの [Migration from v3 Guide](https://v4.vitejs.dev/guide/migration.html) をまず確認し、アプリを Vite v3 に移植するための必要な変更を調べてから、このページの変更点を進めてください。
