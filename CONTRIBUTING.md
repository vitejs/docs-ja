# Vite 日本語翻訳ガイド

ようこそ、Vite 日本語翻訳リポジトリーへ！
翻訳プロジェクトに貢献したい方は、以下の内容を一読の上、お願いします。

## 貢献方法

### GitHub Issues にある本家ドキュメントの差分更新
英語版ドキュメントが更新されると、自動的に本リポジトリーにも issue が生成されるようになっています（説明文が `New updates on head repo.` となっているもの）。

1. [GitHub Issues](https://github.com/vitejs/docs-ja/issues) から、[このクエリー](https://github.com/vitejs/docs-ja/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc+New+updates+on+head+repo.) でソート & フィルターして、アサインされていない issues 一覧からできるだけ古いものからやりたい issue を選択します
2. 選択した issue で、「対応します！」などのコメントで宣言します（`vitejs/docs-ja` のメンテナーの方々は、GitHub の assign 機能で self assign で OK です）
3. このリポジトリー `vitejs/docs-ja` のメンテナーから同 issue でリアクションされたら、自分が選んだ issue の担当者として正式にアサインされたことになります
4. このリポジトリーをフォークします！
    - README に従い、必ずパッケージをインストールしてください（textlint のため）
5. `main` ブランチからトピックブランチを作成します: `git branch my-topic-branch main`
6. 変更をコミットします: `git commit -am 'docs: fix typo'`
    - コミットメッセージは issue のタイトル（英語版のコミットメッセージ）と同じにしてください
7. textlint で引っかかる場合は再度修正を行いコミットします
8. フォークした自分のリポジトリーに Push します: `git push origin my-topic-branch`
9. 問題がなければ、プルリクエストを `vitejs/docs-ja` の `main` ブランチに送ります
10. レビューで指摘事項があったら修正 + Push し、再レビュー依頼（Reviewers の :arrows_counterclockwise: ボタン）します
    - 依頼の前に、修正漏れがないか確認してください
11. レビューで OK ならば、マージされてドキュメントに反映されます :tada:

#### Tips: より円滑な Pull Request のコメント記載方法

GitHub の Pull Request には、特定の記法を Pull Request の本文に書くことによって、該当 Pull Request のマージ時に自動的に対応する Issues をクローズできる機能があります。
Pull Request を送るときに、余裕があれば "resolve #123" といった形で、該当する Issues の番号を記載されているとレビュアーが非常に助かります :pray:

### タイポなどの修正

手順は上記の `4.` 以降と同じです。

## 翻訳スタイル

- [JTF日本語標準スタイルガイド（翻訳用）](https://www.jtf.jp/tips/styleguide) - 基本的な翻訳スタイル。
- [Microsoft ローカリゼーション スタイル ガイド](https://www.microsoft.com/ja-jp/language/styleguides) - 技術文書におけるスタイル。
- [textlint-rule-preset-JTF-style](https://github.com/textlint-ja/textlint-rule-preset-JTF-style) - JTF 日本語標準スタイルガイド（翻訳用）の textlint のルールセット。
- [textlint-rule-preset-vuejs-jp](https://github.com/vuejs-jp/textlint-rule-preset-vuejs-jp) - Vue.js 日本ユーザーグループで一部カスタマイズした textlint のルールセット。

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
- NG : Vite（フランス語で「速い」という意味の単語で`/vit/`と発音）は現代のWebプロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。
<!-- textlint-enable -->
- OK : Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。

例外として、句読点の前後にアルファベットがある場合は、スペースを入れなくてもいいです。

- 読点: お気づきかもしれませんが、Vite プロジェクトでは `index.html` は `public` 内に隠れているのではなく、最も目立つ場所にあります。

### 原則、一語一句翻訳。ただし日本語として分かりにくい場合は読みやすさを優先

> Dependencies are Strongly Cached.

- NG: 依存関係は強力にキャッシュされます。
- OK: 依存関係は積極的にキャッシュされます。

### 原文に使われる ':' や '!' や '?' などの記号は極力残して翻訳

> Example:

- NG: 例
- OK: 例:

ただし、文の途中にハイフン `-` やセミコロン `;` があり、その記号があると理解しづらい訳になる場合は、例外として削除してもよいです。

- 原文:

> NPM Dependency Resolving and Pre-Bundling.

- 訳文:

> NPM の依存関係の解決と事前バンドル。

### 単語の統一（特に技術用語）

- 技術用語は基本英語、ただ日本語で一般的に使われている場合は日本語 OK !!
  - 例: 英語の filter 、日本語のフィルター
- 和訳に困った、とりあえず英語
  - 例: expression -> 式、表現
- 和訳にして分かりづらい場合は、翻訳と英語（どちらかに括弧付け）でも OK
  - 例: Two way -> Two way（双方向）

### 長音訳について

原則、**長音あり**で翻訳する。

- NG: コンピュータ
- OK: コンピューター

## 注意事項

### 行の追加・削除をしない

行番号が変わってしまうと英語版ドキュメントの変更を取り込む際に対応箇所を探すのが難しくなるので、原文と同じ行に翻訳してください。

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
