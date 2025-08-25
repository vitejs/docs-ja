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

`package.json` に `"type": "module"` などでプロジェクトがネイティブな Node ESM を使用していない場合でも、Vite は設定ファイルで ES モジュール構文の使用をサポートしています。この場合、設定ファイルはロードの前に自動的に前処理されます。

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

設定自体が評価されている間に利用可能な環境変数は、現在のプロセス環境（`process.env`）に既に存在するもののみです。Vite は意図的に `.env*` ファイルの読み込みをユーザー設定が解決される**後**まで遅らせています。これは、読み込むファイルのセットが [`root`](/guide/#index-html-and-project-root) や [`envDir`](/config/shared-options.md#envdir) などの設定オプション、そして最終的な `mode` に依存するためです。

つまり、`.env`、`.env.local`、`.env.[mode]`、`.env.[mode].local` で定義された変数は、`vite.config.*` の実行中に `process.env` に自動的に注入されることは**ありません**。これは[環境変数とモード](/guide/env-and-mode.html)で説明されているとおり、これらの変数は後で自動的に読み込まれ、（デフォルトの `VITE_` プレフィックスフィルターを使用して）`import.meta.env` を通じてアプリケーションコードに公開されます。したがって、`.env*` ファイルからアプリに値を渡すだけであれば、設定内で何かを呼び出す必要はありません。

しかし、`.env*` ファイルの値が設定自体に影響を与える必要がある場合（例えば `server.port` の設定、プラグインの条件付き有効化、`define` 置換の計算など）、エクスポートされた [`loadEnv`](/guide/api-javascript.html#loadenv) ヘルパーを使用して手動で読み込めます。

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // `mode` に基づいて現在の作業ディレクトリーにある env ファイルをロードする。
  // `VITE_` プレフィックスに関係なく全ての環境変数をロードするには、
  // 第 3 引数に '' を設定します
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      // 環境変数から派生した明示的なアプリレベル定数を提供します。
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    // 例：環境変数を使用して開発サーバーのポートを条件付きで設定します。
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
    },
  }
})
```

## VS Code で設定ファイルをデバッグする

デフォルトの `--configLoader bundle` の動作では、Vite は生成された一時的な設定ファイルを `node_modules/.vite-temp` フォルダーに書き込むため、Vite の設定ファイル内でブレークポイントデバッグを設定するときにファイルが見つからないというエラーが発生します。この問題を修正するには、`.vscode/settings.json` に以下の設定を追加してください:

```json
{
  "debug.javascript.terminalOptions": {
    "resolveSourceMapLocations": [
      "${workspaceFolder}/**",
      "!**/node_modules/**",
      "**/node_modules/.vite-temp/**"
    ]
  }
}
```
