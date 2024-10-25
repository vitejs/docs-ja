# 環境変数とモード

## 環境変数 {#env-variables}

Vite は環境変数を特別な **`import.meta.env`** オブジェクトに公開しており、これはビルド時に静的に置き換えられます。いくつかのビルトイン変数は全てのケースで利用可能です:

- **`import.meta.env.MODE`**: {string} アプリが動作している[モード](#modes)。

- **`import.meta.env.BASE_URL`**: {string} アプリが配信されているベース URL。これは [`base` 設定オプション](/config/shared-options.md#base) によって決まります。

- **`import.meta.env.PROD`**: {boolean} アプリがプロダクションで動作しているかどうか（`NODE_ENV='production'` で開発サーバーを起動するか `NODE_ENV='production'` でビルドしたアプリを実行する）。

- **`import.meta.env.DEV`**: {boolean} アプリが開発で動作しているかどうか（常に `import.meta.env.PROD` の逆）

- **`import.meta.env.SSR`**: {boolean} アプリが[サーバー](./ssr.md#conditional-logic)で動作しているかどうか

## `.env` ファイル {#env-files}

Vite は、[環境ディレクトリー](/config/shared-options.md#envdir)にある以下のファイルから追加の環境変数を読み込むために [dotenv](https://github.com/motdotla/dotenv) を利用します。

```
.env                # 全ての場合に読み込まれる
.env.local          # 全ての場合に読み込まれ、gitには無視される
.env.[mode]         # 指定されたモードでのみ読み込まれる
.env.[mode].local   # 指定されたモードでのみ読み込まれ、gitには無視される
```

:::tip env 読み込みの優先度

特定のモードの env ファイル（例: `.env.production`）は、汎用の env ファイル（例: `.env`）よりも優先されます。

また、Vite の実行時に既に存在している環境変数は最も優先度が高く、`.env` ファイルによって上書きされることはありません。例えば、`VITE_SOME_KEY=123 vite build` を実行する場合。

`.env` は Vite 起動時に読み込まれます。変更した後はサーバーを再起動してください。
:::

読み込まれた環境変数は、`import.meta.env` を経由してクライアントソースコードにも文字列として公開されます。

環境変数が誤ってクライアントに漏れてしまうことを防ぐために、`VITE_` から始まる変数のみが Vite で処理されたコードに公開されます。例えば、以下の環境変数だと:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

`VITE_SOME_KEY` だけが `import.meta.env.VITE_SOME_KEY` としてクライアントソースコードに公開され、`DB_PASSWORD` は公開されません。

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // undefined
```

:::tip env のパース

上に示したように、`VITE_SOME_KEY` は数値ですが、パースすると文字列が返ります。同じことはブール型の環境変数にも起こります。コード内で使用する場合には、必ず目的の型に変換するようにしてください。
:::

また、Vite は [dotenv-expand](https://github.com/motdotla/dotenv-expand) を使って、設定不要で env ファイルに書かれた変数を展開できます。構文の詳細については、[ドキュメント](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow)を参照してください。

環境値の中で `$` を使用する場合は、`\` でエスケープする必要があることに注意してください。

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

環境変数のプレフィックスをカスタマイズしたい場合は、[envPrefix](/config/shared-options.html#envprefix) オプションを参照してください。

:::warning SECURITY NOTES

- `.env.*.local` ファイルはローカル限定で、センシティブな変数を含めることができます。git にチェックインされるのを防ぐために、`.gitignore` に `*.local` を追加すべきです。

- Vite のソースコードに公開される変数は最終的にクライアントバンドルに入るので、`VITE_*` 変数はセンシティブな情報を*含まない*ようにすべきです。
  :::

### TypeScript 用の自動補完

デフォルトで Vite は [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) で `import.meta.env` のための型定義を提供します。`.env.[mode]` ファイルで自前の環境変数を定義できますが、`VITE_` で始まるユーザー定義の環境変数に対する TypeScript の自動補完が欲しくなるかもしれません。

この目的を達するには、`src` ディレクトリーに `vite-env.d.ts` を作成し、以下のように `ImportMetaEnv` を補ってください:

```typescript [vite-env.d.ts]
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // その他の環境変数...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

コードがブラウザー環境の型、例えば [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) や [WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts) に依存している場合は、`tsconfig.json` 内の [lib](https://www.typescriptlang.org/tsconfig#lib) フィールドを更新しましょう。

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning import は型拡張を破壊する

`ImportMetaEnv` の拡張が上手く動かない場合、`import` ステートメントが `vite-env.d.ts` 内に存在しないことを確認してください。詳しい情報については、[TypeScript のドキュメント](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) を参照してください。
:::

## HTML での置換

Vite は HTML ファイルでの環境変数の置換もサポートしています。`import.meta.env` にあるプロパティは、特別な `%ENV_NAME%` 構文使用して HTML ファイルで使用できます:

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

環境変数が `import.meta.env` に存在しない場合（例: `%NON_EXISTENT%`）、JS では `import.meta.env.NON_EXISTENT` が `undefined` として置換されるのとは異なり、（HTML では）無視されて置換されません。

Vite は多くのフレームワークで使用されているため、条件分岐のような複雑な置換については意図的に主張を持たないようにしています。Vite は[既存のユーザーランドプラグイン](https://github.com/vitejs/awesome-vite#transformers)、または [`transformIndexHtml` フック](./api-plugin#transformindexhtml)を実装したカスタムプラグインを使って拡張できます。

## モード {#modes}

デフォルトで、開発サーバー（`dev` コマンド）は `development` モードで動作し、`build` コマンドは `production` モードで動作します。

つまり、 `vite build` の動作中は、もし `.env.production` があれば、環境変数をそこから読み込むということです:

```
# .env.production
VITE_APP_TITLE=My App
```

アプリケーションの中で、`import.meta.env.VITE_APP_TITLE` を利用してタイトルを描画できます。

場合によっては、`vite build` を別のモードで実行して、別のタイトルをレンダリングしたいかもしれません。オプションフラグの `--mode` を渡すことで、コマンドで使用されるデフォルトのモードを上書きすることができます。例えば、staging モード用にアプリをビルドしたい場合:

```bash
vite build --mode staging
```

また、`.env.staging` ファイルを作成します:

```
# .env.staging
VITE_APP_TITLE=My App (staging)
```

`vite build` はデフォルトで本番環境のビルドを実行しますが、別のモードと `.env` ファイルの設定を変更することで、開発環境のビルドを実行することもできます:

```
# .env.testing
NODE_ENV=development
```

## NODE_ENV とモード

`NODE_ENV`（`process.env.NODE_ENV`）とモードは異なる概念であると意識するのが重要です。それぞれのコマンドが `NODE_ENV` とモードにどのように影響するかを以下に示します:

| コマンド                                              | NODE_ENV        | モード              |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

`NODE_ENV` およびモードのいろいろな値は、それに対応する `import.meta.env` プロパティにも反映されます:

| コマンド                | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| コマンド               | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `.env` ファイル内での `NODE_ENV`

`NODE_ENV=...` はコマンドや `.env` ファイルで設定できます。`.env.[mode]` ファイルで `NODE_ENV` が指定されている場合、モードを使用してその値を制御できます。ただし、`NODE_ENV` とモードは依然として異なる概念として残ります。

コマンドでの `NODE_ENV=...` の主な利点は、Vite がその値を早期に検出できることです。Vite は設定ファイルが評価された後でしか env ファイルを読み込めないので、（コマンドで `NODE_ENV` を指定すると）Vite の設定内で `process.env.NODE_ENV` を読み取ることができます。
:::
