# パフォーマンス

Vite はデフォルトで高速ですが、プロジェクトの要件が増えるにつれてパフォーマンスの問題が発生することがあります。このガイドでは、以下のような一般的なパフォーマンスの問題を特定し、修正するのに役立ちます。

- サーバーの起動が遅い
- ページの読み込みが遅い
- ビルドが遅い

## 設定された Vite プラグインの監査

Vite の内部および公式プラグインは、幅広いエコシステムとの互換性を提供しながら、できるだけ最小限の作業で済むように最適化されています。たとえば、コードの変換は開発時には正規表現を使用しますが、ビルド時には完全な解析をして正確性を確保します。

ただし、コミュニティプラグインのパフォーマンスは Vite のコントロール範囲外であり、これが開発者体験に影響を与える可能性があります。追加の Vite プラグインを使用する際に注意すべきポイントがいくつかあります。

1. 特定のケースでのみ使用される大きな依存関係は、Node.js の起動時間を短縮するために動的にインポートする必要があります。リファクタリングの例: [vite-plugin-react#212](https://github.com/vitejs/vite-plugin-react/pull/212) および [vite-plugin-pwa#224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244)。

2. `buildStart`、`config`、`configResolved` フックは、長時間かかるような大規模な操作をすべきではありません。これらのフックは開発サーバーの起動中に待機されるので、ブラウザーでサイトにアクセスできるまでに時間がかかります。

3. `resolveId`、`load`、`transform` フックは、一部のファイルでは他よりも読み込みが遅くなることがあります。避けられない場合もありますが、最適化できる部分がないか確認する価値はあります。たとえば、完全な変換をする前に `code` に特定のキーワードが含まれているか、`id` が特定の拡張子に一致するかを確認することなどです。

   ファイルを変換するのにかかる時間が長いほど、ブラウザーでサイトを読み込む際のリクエストウォーターフォールがより顕著になります。

   `DEBUG="vite:plugin-transform" vite` または [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) を使用してファイルの変換にかかる時間を調査できます。非同期操作はタイミングが不正確になる傾向があるため、これらの数字はおおよその推定値として扱うべきですが、よりコストのかかる操作を明らかにするのには十分です。

::: tip プロファイリング
`vite --profile` を実行してサイトにアクセスし、ターミナルで `p + enter` を押して `.cpuprofile` を記録できます。[speedscope](https://www.speedscope.app) のようなツールを使用してプロファイルを検査し、ボトルネックを特定できます。また、[プロファイルを共有](https://chat.vitejs.dev) して Vite チームがパフォーマンスの問題を特定するのに役立てることもできます。
:::

## 解決操作の削減

インポートパスの解決は、最悪のケースが頻繁に発生するとコストがかかる操作になる可能性があります。たとえば、Vite は [`resolve.extensions`](/config/shared-options.md#resolve-extensions) オプションを使用してインポートパスを「推測」することをサポートしており、デフォルトでは `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` に設定されています。

`./Component` を `import './Component'` としてインポートしようとすると、Vite は次の手順で解決します。

1. `./Component` が存在するかどうかを確認、存在しない。
2. `./Component.mjs` が存在するかどうかを確認、存在しない。
3. `./Component.js` が存在するかどうかを確認、存在しない。
4. `./Component.mts` が存在するかどうかを確認、存在しない。
5. `./Component.ts` が存在するかどうかを確認、存在しない。
6. `./Component.jsx` が存在するかどうかを確認、存在する！

上記のように、1 つのインポートパスを解決するためには合計で 6 つのファイルシステムのチェックが必要です。暗黙のインポートが増えるほど、パスを解決するためにかかる時間も増えます。

したがって、通常はインポートパスを明示的に指定する方が良いです。例: `import './Component.jsx'`。また、`resolve.extensions` のリストを狭めて一般的なファイルシステムのチェックを減らすこともできますが、これが `node_modules` 内のファイルにも適用されることを知っておく必要があります。

プラグインの作者の場合は上記のチェックの回数を減らすために、必要な時にのみ [`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve) を呼び出すようにしてください。

::: tip TypeScript
TypeScript を使用している場合は、`tsconfig.json` の `compilerOptions` で `"moduleResolution": "bundler"` および `"allowImportingTsExtensions": true` を有効にして、コード内で直接 `.ts` および `.tsx` 拡張子を使用できるようにしてください。
:::

## バレルファイルを避ける

バレルファイルは同じディレクトリー内の他のファイルの API を再エクスポートするファイルです。例:

```js
// src/utils/index.js
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

`import { slash } from './utils'` のように単一の API だけをインポートする場合でも、バレルファイル内のすべてのファイルを取得して変換する必要があります。これらのファイルに `slash` API が含まれていたり、初期化時に実行される副作用が含まれている可能性があるためです。これにより、最初のページ読み込み時に必要以上のファイルがロードされ、ページの読み込みが遅くなります。

可能であれば、バレルファイルを避けて個々の API を直接インポートする方が良いです。例: `import { slash } from './utils/slash.js'`。詳細については [issue #8237](https://github.com/vitejs/vite/issues/8237) を参照してください。

## よく使うファイルのウォームアップ {#warm-up-frequently-used-files}

Vite の開発サーバーはブラウザーからのリクエストに応じてファイルを変換するので迅速に起動し、使用されたファイルにのみ変換を適用できます。また、特定のファイルがまもなくリクエストされると予測される場合は、事前にファイルを変換することもできます。ただし、一部のファイルが他よりも変換に時間がかかる場合、リクエストウォーターフォールが発生する可能性があります。たとえば:

左のファイルが右のファイルをインポートするインポートグラフがあるとします:

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

インポートの関係はファイルが変換された後にしか分かりません。もし `BigComponent.vue` の変換に時間がかかる場合、`big-utils.js` は順番を待たなければならず、事前変換が組み込まれている場合でも内部ウォーターフォールが発生します。

Vite では [`server.warmup`](/config/server-options.md#server-warmup) オプションを使用して、`big-utils.js` のような頻繁に使用されることが分かっているファイルをウォームアップできます。これにより、`big-utils.js` はリクエストされたときにすぐに配信されるよう準備+キャッシュされます。

`DEBUG="vite:transform" vite` を実行してログを調べれば、頻繁に使用されるファイルを見つけることができます:

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

起動時に Vite 開発サーバーに過負荷をかけないように、頻繁に使用するファイルのみをウォームアップすることに注意してください。詳しくは [`server.warmup`](/config/server-options.md#server-warmup) オプションを確認してください。

また、[`--open` または `server.open`](/config/server-options.html#server-open) を使用すると、Vite がアプリのエントリーポイントまたは指定された URL を開くために自動的にウォームアップするため、パフォーマンスが向上します。

## 使うツールを減らす、あるいはネイティブツールを使う

増え続けるコードベースに対して Vite を高速に保つには、ソースファイル（JS/TS/CSS）の作業量を減らすことです。

作業量を減らす例:

- 可能な限り、Sass/Less/Stylus の代わりに CSS を使用する（ネストは PostCSS で処理できます）。
- SVG を UI フレームワークのコンポーネント（React、Vue など）に変換しないでください。代わりに文字列または URL としてインポートしてください。
- `vitejs/plugin-react` を使用する場合は Babel オプションの設定を避けると、ビルド時の変換をスキップします（esbuild のみが使用されます）。

ネイティブツールの使用例:

ネイティブツールを使用すると、インストールサイズが大きくなることが多いため、新しい Vite プロジェクトを開始する際のデフォルトではありません。しかし、大規模なアプリケーションではコストをかける価値があるかもしれません。

- [LightningCSS](https://github.com/vitejs/vite/discussions/13835) の実験的サポートを試す。
- `vitejs/plugin-react` の代わりに [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) を使用する。
