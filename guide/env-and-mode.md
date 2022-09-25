# 環境変数とモード

## Env Variables

Vite は環境変数を特別な **`import.meta.env`** オブジェクトに公開します。いくつかのビルトイン変数は全てのケースで利用可能です:

- **`import.meta.env.MODE`**: {string} アプリが動作している[モード](#modes)。

- **`import.meta.env.BASE_URL`**: {string} アプリが配信されているベース URL。これは [`base` 設定オプション](/config/shared-options.md#base) によって決まります。

- **`import.meta.env.PROD`**: {boolean} アプリがプロダクションで動作しているかどうか。

- **`import.meta.env.DEV`**: {boolean} アプリが開発で動作しているかどうか（常に `import.meta.env.PROD` の逆）

- **`import.meta.env.SSR`**: {boolean} アプリが[サーバ](./ssr.md#条件付きロジック)で動作しているかどうか

### Production Replacement

プロダクションでは、これらの環境変数は、**静的に置換されます**。したがって、常に、完全な静的文字列を使って参照する必要があります。例えば、`import.meta.env[key]` のような動的なキーでのアクセスはうまく行きません。

JavaScript の文字列と Vue テンプレートの中に現れる文字列も置換されます。これはまれなケースのはずですが、意図的でないこともありえます。この場合、たとえば `"process.env.`<wbr>`NODE_ENV: "` が `""development": "` に変換されると、`Missing Semicolon` や `Unexpected token` などのエラーが表示されることがあります。この挙動を一時的に解決する方法はいくつかあります:

- JavaScript の文字列に対しては、ユニコードの​ゼロ幅スペースでその文字列を分割できます（例 `'import.meta\u200b.env.MODE'`）。

- Vue のテンプレートや他の HTML タグに対しては、[`<wbr>` タグ](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr)を使うことができます（例 `import.meta.<wbr>env.MODE`）。

## `.env` Files

Vite は、[環境ディレクトリ](/config/shared-options.md#envdir)にある以下のファイルから追加の環境変数を読み込むために [dotenv](https://github.com/motdotla/dotenv) を利用します。

```
.env                # 全ての場合に読み込まれる
.env.local          # 全ての場合に読み込まれ、gitには無視される
.env.[mode]         # 指定されたモードでのみ読み込まれる
.env.[mode].local   # 指定されたモードでのみ読み込まれ、gitには無視される
```

:::tip env 読み込みの優先度

特定のモードの env ファイル（例: `.env.production`）は、汎用の env ファイル（例: `.env`）よりも優先されます。

また、Vite の実行時に既に存在している環境変数は最も優先度が高く、`.env` ファイルによって上書きされることはありません。例えば、`VITE_SOME_KEY=123 vite build` を実行する場合。

`.env` は Vite 起動時に読み込まれます。変更した後はサーバを再起動してください。
:::

読み込まれた環境変数は、`import.meta.env` を経由してクライアントソースコードにも文字列として公開されます。

環境変数が誤ってクライアントに漏れてしまうことを防ぐために、`VITE_` から始まる変数のみが Vite で処理されたコードに公開されます。例えば、以下の環境変数だと:

```
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

`VITE_SOME_KEY` だけが `import.meta.env.VITE_SOME_KEY` としてクライアントソースコードに公開され、`DB_PASSWORD` は公開されません。

```js
console.log(import.meta.env.VITE_SOME_KEY) // 123
console.log(import.meta.env.DB_PASSWORD) // undefined
```

環境変数のプレフィックスをカスタマイズしたい場合は、[envPrefix](/config/shared-options.html#envprefix) オプションを参照してください。

:::warning SECURITY NOTES

- `.env.*.local` ファイルはローカル限定で、センシティブな変数を含めることができます。git にチェックインされるのを防ぐために、`.gitignore` に `*.local` を追加すべきです。

- Vite のソースコードに公開される変数は最終的にクライアントバンドルに入るので、`VITE_*` 変数はセンシティブな情報を*含まない*ようにすべきです。
  :::

### TypeScript 用の自動補完

デフォルトで Vite は [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) で `import.meta.env` のための型定義を提供します。`.env.[mode]` ファイルで自前の環境変数を定義できますが、`VITE_` で始まるユーザ定義の環境変数に対する TypeScript の自動補完が欲しくなるかもしれません。

この目的を達するには、`src` ディレクトリに `env.d.ts` を作成し、以下のように `ImportMetaEnv` を補ってください:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // その他の環境変数...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

コードがブラウザー環境の型、例えば [DOM](https://github.com/microsoft/TypeScript/blob/main/lib/lib.dom.d.ts) や [WebWorker](https://github.com/microsoft/TypeScript/blob/main/lib/lib.webworker.d.ts) に依存している場合は、`tsconfig.json` 内の [lib](https://www.typescriptlang.org/tsconfig#lib) フィールドを更新しましょう。

```json
{
  "lib": ["WebWorker"]
}
```

## Modes

デフォルトで、開発サーバ（`dev` コマンド）は `development` モードで動作し、`build` コマンドは `production` モードで動作します。

つまり、 `vite build` の動作中は、もし `.env.production` があれば、環境変数をそこから読み込むということです:

```
# .env.production
VITE_APP_TITLE=My App
```

アプリケーションの中で、`import.meta.env.VITE_APP_TITLE` を利用してタイトルを描画できます。

**モード**は単に development vs. production よりも広い概念なのを理解することが重要です。典型的な例として、production のような振る舞いを持ちつつ少しだけ production と異なる環境変数を持つ"staging"モードが欲しくなるかもしれません。

`--mode` オプションフラグを渡すことで、コマンドに対して使われるデフォルトモードを上書きすることができます。例えば、アプリケーションを staging モード（が仮にあるとして）向けにビルドしたい場合は以下のようにします:

```bash
vite build --mode staging
```

また、望んでいる挙動を得るには、`.env.staging` ファイルが必要です:

```
# .env.staging
NODE_ENV=production
VITE_APP_TITLE=My App (staging)
```

これで staging アプリケーションが production のような挙動を持ちつつ、production とは異なるタイトルを表示するはずです。
