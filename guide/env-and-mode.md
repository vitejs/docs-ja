# Env Variables and Modes

## Env Variables

Vite は環境変数を特別な **`import.meta.env`** オブジェクトに公開します。いくつかのビルトイン変数は全てのケースで利用可能です:

- **`import.meta.env.MODE`**: {string} アプリが動作している[モード](#modes)。

- **`import.meta.env.BASE_URL`**: {string} アプリが配信されているベースURL。これは [`base` config option](/config/#base) によって決まります。

- **`import.meta.env.PROD`**: {boolean} アプリがプロダクションで動作しているかどうか。

- **`import.meta.env.DEV`**: {boolean} アプリが開発で動作しているかどうか（常に `import.meta.env.PROD` の逆）

### Production Replacement

プロダクションでは、これらの環境変数は、**静的に置換されます**。したがって、常に、完全な静的文字列を使って参照する必要があります。例えば、`import.meta.env[key]` のような動的なキーでのアクセスはうまく行きません。

JavaScript の文字列と Vue テンプレートの中に現れる文字列も置換されます。これはまれなケースのはずですが、意図的でないこともありえます。この挙動を一時的に解決する方法はいくつかあります:

- JavaScript の文字列に対しては、ユニコードの​ゼロ幅スペースでその文字列を分割できます（例 `'import.meta\u200b.env.MODE'`）。

- Vue のテンプレートや他の HTML タグに対しては、[`<wbr>` タグ](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr)を使うことができます（例 `import.meta.<wbr>env.MODE`）。

## `.env` Files

Vite は、プロジェクトのルートにある以下のファイルから追加の環境変数を読み込むために [dotenv](https://github.com/motdotla/dotenv) を利用します。

```
.env                # 全ての場合に読み込まれる
.env.local          # 全ての場合に読み込まれ、gitには無視される
.env.[mode]         # 指定されたモードでのみ読み込まれる
.env.[mode].local   # 指定されたモードでのみ読み込まれ、gitには無視される
```

読み込まれた環境変数は、`import.meta.env` を経由してクライアントソースコードにも公開されます。

環境変数が誤ってクライアントに漏れてしまうことを防ぐために、`VITE_` から始まる変数のみがVite で処理されたコードに公開されます。例えば、以下のファイルで:

```
DB_PASSWORD=foobar
VITE_SOME_KEY=123
```

`VITE_SOME_KEY` だけが `import.meta.env.VITE_SOME_KEY` としてクライアントソースコードに公開され、`DB_PASSWORD` は公開されません。

:::warning SECURITY NOTES

- `.env.*.local` ファイルはローカル限定で、センシティブな変数を含めることができます。git にチェックインされるのを防ぐために、`.gitignore` に `.local` を追加すべきです。

- Vite のソースコードに公開される変数は最終的にクライアントバンドルに入るので、`VITE_*` 変数はセンシティブな情報を*含まない*ようにすべきです。
  :::

### IntelliSense

デフォルトで Vite は `import.meta.env` のための型定義を提供します。`.env.[mode]` ファイルで自前の環境変数を定義できますが、`VITE_` で始まるユーザー定義の環境変数に対する TypeScript IntelliSense が欲しくなるかもしれません。

この目的を達するには、`src` ディレクトリに `env.d.ts` を作成し、以下のように `ImportMetaEnv` を補ってください:

```typescript
interface ImportMetaEnv {
  VITE_APP_TITLE: string
  // more env variables...
}
```

## Modes

デフォルトで、開発サーバー（`serve` コマンド）は `development` モードで動作し、`build` コマンドは `production` モードで動作します。

つまり、 `vite build` の動作中は、もし `.env.production` があれば、環境変数をそこから読み込むということです:

```
# .env.production
VITE_APP_TITLE=My App
```

アプリケーションの中で、`import.meta.env.VITE_APP_TITLE` を利用してタイトルを描画できます。

**モード**は単に development vs. production よりも広い概念であるのを理解することが重要です。典型的な例として、production のような振る舞いを持ちつつ少しだけ production と異なる環境変数を持つ"staging"モードが欲しくなるかもしれません。

`--mode` オプションフラグを渡すことで、コマンドに対して使われるデフォルトモードを上書きすることができます。例えば、アプリケーションを staging モード（が仮にあるとして）向けにビルドしたい場合は以下のようにし:

```bash
vite build --mode staging
```

また、望んでいる挙動を得るには、`.env.staging`ファイルが必要です:

```
# .env.staging
NODE_ENV=production
VITE_APP_TITLE=My App (staging)
```

これで staging アプリケーションが production のような挙動を持ちつつ、production とは異なるタイトルを表示するはずです。
