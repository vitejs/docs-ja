# Vite 日本語翻訳ガイド

ようこそ、Vite 日本語翻訳リポジトリーへ！翻訳プロジェクトに貢献したい方は以下の内容を一読の上、お願いします。

## 貢献方法

### GitHub Issues にある本家ドキュメントの差分更新内容を翻訳して貢献する

1. [GitHub Issues](https://github.com/vitejs/docs-ja/issues) の中でまだアサインされていない issues 一覧から自分のやりたい issue を選択します。
2. 選択した issue で「翻訳やります！」のようなコメントで宣言します。(`vitejs/docs-ja` のメンテナーの方々は、GitHub の assign 機能で self assign で OK です)
3. 本リポジトリー(`vitejs/docs-ja`)のメンテナーの方から同 issue でコメントで承認されたら、正式自分が選んだ issue の翻訳担当者としてアサインされたことになります。
4. このリポジトリーをフォークします！
5. `main` から任意の名前のブランチを切って作業を開始しましょう！　(`git checkout -b your-translate-branch`)
6. フォークした自分のリポジトリーに Push します。(`git push origin your-translate-branch`)
7. 問題がなければ、プルリクエストを `vitejs/docs-ja` の `main` ブランチに送ります。
8. レビュー 👀 で指摘事項があったら修正し、再度 Push します 📝
9. レビュー 👀 で OK 🙆‍♀️ ならば、メンテナーの方があなたのブランチをマージします🎉


### Tips: より円滑な Pull Request のコメント記載方法

GitHub の Pull Request には、特定の記法を Pull Request の本文に書くことによって、該当 Pull Request のマージ時に自動的に対応する Issues をクローズできる機能があります。 Pull Request を送るときに、余裕があれば "resolve #123" といった形で、該当する Issues の番号を記載されているとレビュワーが非常に助かります 🙏 詳しくは、[プルリクエストをIssueにリンクする - GitHub Docs](https://docs.github.com/ja/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue) を参照してください。

## 翻訳スタイル

- [JTF 日本語標準スタイルガイド（翻訳用）](https://www.jtf.jp/tips/styleguide) に準拠
- JTF 日本語標準スタイルのチェックツールは [textlint-plugin-JTF-style](https://github.com/azu/textlint-plugin-JTF-style) を使用し、ルールは Vue.js 公式サイト向けに [一部カスタマイズ](https://github.com/vitejs/docs-ja/blob/main/.textlintrc)
  - `pnpm run lint` コマンドを実行すると、Markdown ファイルに対して textlint を実行できます。

## 翻訳のゆらぎ & トーン

### 文体

「だである」ではなく「ですます」調

> Vite (French word for "fast", pronounced `/vit/`) is a build tool that aims to provide a faster and leaner development experience for modern web projects.

<!-- textlint-disable -->
- NG : Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）は現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツール**である**。
<!-- textlint-enable -->
- OK : Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）は現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツール**です**。

### 半角スペースでアルファベット両端を入れて読みやすく！

> Vite (French word for "fast", pronounced `/vit/`) is a build tool that aims to provide a faster and leaner development experience for modern web projects.

<!-- textlint-disable -->
- NG : Vite(フランス語で「速い」という意味の単語で`/vit/`と発音)は現代のWebプロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。
<!-- textlint-enable -->
- OK : Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。

例外として、句読点の前後にアルファベットがある場合は、スペースを入れなくてもいいです。

- 読点: お気づきかもしれませんが、Vite プロジェクトでは `index.html` は `public` 内に隠れているのではなく、最も目立つ場所にあります。

### 原則、一語一句翻訳、ただ日本語として分かりにくい場合は読みやすさを優先

> Dependencies are Strongly Cached.

- NG: 依存関係は強力にキャッシュされます。
- OK: 依存関係は積極的にキャッシュされます。

### 原文に使われる ':' や '!' や '?' などの記号は極力残して翻訳

> Example:

- NG: 例
- OK: 例:

ただし、文の途中にハイフン `-` やセミコロン `;` がある場合は、その記号があると理解しづらい訳になる場合は、例外として削除してもよいです。

- 原文:

> NPM Dependency Resolving and Pre-Bundling.

- 訳文:

> NPM の依存関係の解決と事前バンドル。

### 単語の統一 (特に技術用語)

- 技術用語は基本英語、ただ日本語で一般的に使われている場合は日本語 OK !!
  - 例: 英語の filter 、日本語のフィルター
- 和訳に困った、とりあえず英語
  - 例: expression -> 式、表現
- 和訳にして分かりづらい場合は、翻訳と英語(どちらかに括弧付け)でも OK
  - 例: Two way -> Two way (双方向)

### 長音訳について

原則、**長音あり**で翻訳する。

- NG: コンピュータ
- OK: コンピューター

## 注意事項

### 行の追加・削除をしない

行番号が変わってしまうと Vite 本体の変更を取り込む際に対応箇所を探すのが難しいので、原文と同じ行に翻訳してください。

原文:

```text
5 | When running `vite` from the command line, ...
6 |
7 | The most basic config file looks like this:
```

NG: 空行がなくなっている

```text
5 | コマンドラインから `vite` を実行すると、... 自動的に解決しようとします。
6 | 最も基本的な設定ファイルは次のようになります:
```

NG: 改行が増えている

```text
5 | コマンドラインから `vite` を実行すると、...
6 | 自動的に解決しようとします。
7 |
8 | 最も基本的な設定ファイルは次のようになります:
```

OK: 行がそのまま

```text
5 | コマンドラインから `vite` を実行すると、... 自動的に解決しようとします。
6 |
7 | 最も基本的な設定ファイルは次のようになります:
```

### Vite 本体との差分 Issue について

以下の説明文の Issue は Vite 本体のリポジトリーに変更があった際に自動的に作られるものです。

```text
New updates on head repo.
vitejs/vite@コミット番号
```

これらに関しては `help wanted` タグなどが付いていなくても対応可能です。
もし対応いただける場合は、古いものから順番にお願いします。
（新しいものを先にやってしまうとデグレの可能性があるため）
