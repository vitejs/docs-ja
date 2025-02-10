---
title: Vite の設定
---

# Vite の設定 {#configuring-vite}

コマンドラインから `vite` を実行すると、Vite は[プロジェクトルート](/guide/#index-html-and-project-root)内の `vite.config.js` という名前の設定ファイルを自動的に解決しようとします（その他の JS および TS の拡張子もサポートされています）。

最も基本的な設定ファイルは次のようになります:

```js [vite.config.js]
export default {
  // 設定オプション
}
```

`package.json` に `type: "module"` などでプロジェクトがネイティブな Node ESM を使用していない場合でも、Vite は設定ファイルで ES モジュール構文の使用をサポートしています。この場合、設定ファイルはロードの前に自動的に前処理されます。

また、CLI の `--config` オプションで、使用するコンフィグファイルを明示的に指定することもできます（`cwd` からの相対的な解決）:

```bash
vite --config my-config.js
```

::: tip 設定の読み込み
デフォルトでは、Vite は `esbuild` を使用して設定を一時ファイルにバンドルし、読み込みます。これはモノレポ内で TypeScript をインポートする際に問題を引き起こす可能性があります。このアプローチで問題が起きた場合は、代わりに [module runner](/guide/api-environment-runtimes.html#modulerunner) を使用するように `--configLoader runner` を指定できます。これにより、一時的な設定が作成されなくなり、すべてのファイルがその場で変換されるようになります。モジュールランナーは設定ファイル内では CJS をサポートしていませんが、外部の CJS パッケージは通常通りに機能するはずです。

あるいは、TypeScript をサポートする環境（例：`node --experimental-strip-types`）を使用している場合、またはプレーンな JavaScript のみを記述している場合は、`--configLoader native` を指定して、環境のネイティブランタイムを使用して設定ファイルを読み込むことができます。設定ファイルによってインポートされたモジュールの更新は検出されないため、Vite サーバーは自動的に再起動されないことに注意してください。
:::

## 設定の自動補完

Vite には TypeScript の型が同梱されているので、jsdoc のタイプヒントを使って IDE の自動補完を活用できます:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

あるいは、jsdoc のアノテーションがなくても自動補完を提供する `defineConfig` ヘルパーを使用することもできます:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite は TypeScript の設定ファイルもサポートしています。`vite.config.ts` は、上記の `defineConfig` ヘルパー関数または `satisfies` 演算子とともに使用できます:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## 条件付き設定

設定がコマンド（`serve` や `build`）、使用されている[モード](/guide/env-and-mode#modes)、SSR ビルドかどうか（`isSsrBuild`）、ビルドのプレビューかどうか（`isPreview`）に基づいて条件付きで設定のオプションを決定する必要がある場合は、代わりに関数をエクスポートできます:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // dev 固有の設定
    }
  } else {
    // command === 'build'
    return {
      // build 固有の設定
    }
  }
})
```

Vite の API において `command` の値は、開発時（CLI で [`vite`](/guide/cli#vite)、`vite dev`、`vite serve` がエイリアス）には `serve` となり、本番用にビルド（[`vite build`](/guide/cli#vite-build)）するときには `build` となることに注意してください。

`isSsrBuild` と `isPreview` はそれぞれ `build` コマンドと `serve` コマンドの種類を区別するための追加のオプションフラグです。Vite の設定を読み込むツールの中には、これらのフラグをサポートしておらず、代わりに `undefined` を渡すものもあります。そのため、明示的に `true` と `false` を比較することをおすすめします。

## 非同期の設定

設定で非同期の関数を呼び出す必要がある場合は、代わりに非同期関数をエクスポートできます。また、この非同期関数は `defineConfig` を通じて渡すことができ、自動補完のサポートを向上させることができます:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // vite の設定
  }
})
```

## 環境変数を設定に使用する

通常通り、環境変数は `process.env` から取得することができます。

Vite はデフォルトでは `.env` ファイルをロードしないことに注意してください。ロードするファイルは Vite の設定を評価した後に決定されるからです。例えば、 `root` と `envDir` オプションはロードの動作に影響します。しかし必要に応じて、エクスポートされた `loadEnv` ヘルパーを使用して、特定の `.env` ファイルをロードすることができます。

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // `mode` に基づいて現在の作業ディレクトリーにある env ファイルをロードする。
  // `VITE_` プレフィックスに関係なく全ての環境変数をロードするには、
  // 第 3 引数に '' を設定します
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite の設定
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
