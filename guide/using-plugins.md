# プラグインの使用

Vite はプラグインを使っての拡張が可能で、Rollup の優れた設計のプラグインインターフェイスに基づいて、 Vite 固有のオプションがいくつか追加されています。つまり、 Vite ユーザーは Rollup プラグインの成熟したエコシステムを利用しながら、必要に応じて開発サーバーや SSR 機能を拡張することができます。

## プラグインの追加

プラグインを使うには、プロジェクトの `devDependencies` に追加し、 `vite.config.js` 設定ファイルの `plugins` 配列に含める必要があります。例えば、レガシーブラウザーのサポートを提供するには、公式の [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) が使えます:

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

また `plugins` は、複数のプラグインを含むプリセットを 1 つの要素として受け入れることもできます。これは、複数のプラグインを使って実装した複雑な機能（フレームワークの統合など）に便利です。配列は内部的にフラット化されます。

偽値（falsy な値）のプラグインは無視され、プラグインを簡単にアクティブ化や非アクティブ化するのに使えます。

## プラグインの検索

:::tip NOTE
Vite は、一般的な Web 開発パターンをすぐに使えるようにサポートすることを目的としています。Vite や互換性のある Rollup プラグインを探す前に、 [特徴ガイド](../guide/features.md) を確認してください。 Rollup プロジェクトでプラグインが必要になる多くのケースは、 Vite ですでにカバーされています。
:::

公式プラグインの情報は、 [プラグインのセクション](../plugins/) をご覧ください。コミュニティーのプラグインは [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) に一覧があります。

[推奨される規約](./api-plugin.md#規約) に従ったプラグインは次の方法でも見つけることができます。 Vite プラグインは [npm search for vite-plugin](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity)、 Rollup プラグインは [npm search for rollup-plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) です。

## プラグインの順番を強制

一部の Rollup プラグインとの互換性のために、プラグインの順序を強制したり、ビルド時にだけ適用したりする必要があるかもしれません。これは Vite プラグインの実装の詳細でなければなりません。プラグインの位置を強制するには、 `enforce` 修飾子を使います:

- `pre`: Vite コアプラグインの前にプラグインを起動する
- デフォルト: Vite コアプラグインの後にプラグインを起動する
- `post`: Vite ビルドプラグインの後にプラグインを起動する

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

詳しくは [プラグイン API ガイド](./api-plugin.md#plugin-ordering) を参照してください。

## 条件付きの適用

デフォルトでは、プラグインは配信とビルドの両方で起動されます。配信時やビルド時のみに条件付きでプラグインを適用する必要がある場合は、 `apply` プロパティを使って `'build'` か `'serve'` の時にだけプラグインを呼び出します:

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## プラグインのビルド

プラグインの作成に関するドキュメントは、 [プラグイン API ガイド](./api-plugin.md) をご覧ください。
