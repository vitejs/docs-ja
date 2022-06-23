---
title: Vite の設定
---

# Vite の設定

コマンドラインから `vite` を実行すると、Vite は[プロジェクトルート](/guide/#index-html-とプロジェクトルート)内の `vite.config.js` という名前の設定ファイルを自動的に解決しようとします。

最も基本的な設定ファイルは次のようになります:

```js
// vite.config.js
export default {
  // 設定オプション
}
```

プロジェクトが `type: "module"` を介してネイティブな Node ESM を使用していない場合でも、Vite は設定ファイルで ES モジュール構文の使用をサポートしています。この場合、設定ファイルはロードの前に自動的に前処理されます。

また、CLI の `--config` オプションで、使用するコンフィグファイルを明示的に指定することもできます（`cwd` からの相対的な解決）:

```bash
vite --config my-config.js
```

::: tip 注意
Vite は設定ファイルとその依存関係内の `__filename`, `__dirname`, `import.meta.url` を置換することに注意してください。これらを変数名として使用したり、関数のパラメータとしてダブルクォートを含む文字列のパラメータを渡す（以下の例の `console.log`）と、エラーになります:

```js
const __filename = "value"
// これは次のように変換されます
const "path/vite.config.js" = "value"

console.log("import.meta.url") // ビルド時にブレークエラー
```

:::

## 設定の自動補完

Vite には TypeScript の型が同梱されているので、jsdoc のタイプヒントを使って IDE の自動補完を活用できます:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

あるいは、jsdoc のアノテーションがなくても自動補完を提供する `defineConfig` ヘルパを使用することもできます:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite は TS の設定ファイルも直接サポートしています。`vite.config.ts` を `defineConfig` ヘルパと一緒に使うこともできます。

## 条件付き設定

コマンド（`dev`/`serve` か `build`）や使用されている[モード](/guide/env-and-mode)に基づいて条件付きで設定のオプションを決定する必要がある場合は、代わりに関数をエクスポートできます:

```js
export default defineConfig(({ command, mode }) => {
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

Vite の API において `command` の値は、開発時（CLI で `vite`、`vite dev`、`vite serve` がエイリアス）には `serve` となり、本番用にビルド（`vite build`）するときには `build` となることに注意してください。

## 非同期の設定

設定で非同期の関数を呼び出す必要がある場合は、代わりに async 関数をエクスポートできます:

```js
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // vite の設定
  }
})
```

## 環境変数

通常通り、環境変数は `process.env` から取得することができます。

Vite はデフォルトでは `.env` ファイルをロードしないことに注意してください。ロードするファイルは Vite の設定を評価した後に決定されるからです。例えば、 `root` と `envDir` オプションはロードの動作に影響します。しかし必要に応じて、エクスポートされた `loadEnv` ヘルパーを使用して、特定の `.env` ファイルをロードすることができます。

```js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // `mode` に基づいて現在の作業ディレクトリにある env ファイルをロードする
  // `VITE_` プレフィックスに関係なく全ての環境変数をロードするには、第 3 引数に '' を設定します
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite の設定
    define: {
      __APP_ENV__: env.APP_ENV
    }
  }
})
```
