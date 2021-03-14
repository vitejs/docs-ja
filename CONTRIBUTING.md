# Vite 日本語翻訳ガイド
ようこそ、Vite 日本語翻訳レポジトリへ！翻訳プロジェクトに貢献したい方は以下の内容を一読の上、お願いします。   

## 貢献方法

### GitHub Issues にある本家ドキュメントの差分更新内容を翻訳して貢献する

1. [GitHub Issues](https://github.com/vuejs-jp/vite-docs-ja/issues) の中でまだアサインされていない issues 一覧から自分のやりたい issue を選択します。
2. 選択した issue で「翻訳やります！」のようなコメントで宣言します。(`vuejs-jp/vite-docs-ja` のメンテナの方々は、GitHub の assign 機能で self assign で OK です)
3. 本レポジトリ(`vuejs-jp/vite-docs-ja`)のメンテナの方から同 issue でコメントで承認されたら、正式自分が選んだ issue の翻訳担当者としてアサインされたことになります。
4. このレポジトリをフォークします!
5. `main` から任意の名前のブランチを切って作業を開始しましょう！ (`git checkout -b your-translate-branch`)
6. フォークした自分のレポジトリに Push します。(`git push origin your-translate-branch`)
7. 問題がなければ、プルリクエストを `vuejs-jp/vite-docs-ja` の `main` ブランチに送ります。
8. レビュー 👀 で指摘事項があったら修正し、再度 Push します 📝
9. レビュー 👀 で OK 🙆‍♀️ ならば、メンテナの方があなたのブランチをマージします🎉


### 未翻訳のページを自分で選択し翻訳を行う

1. [GitHub Issues](https://github.com/vuejs-jp/vite-docs-ja/issues) にないページを翻訳する場合は未翻訳のページを選択し自分で issue を作成しましょう！
2. issue を作成したら翻訳やります！」のようなコメントで宣言します。
3. メンテナの方がアサインしますので、アサインされたら上記の `4.` 以降の作業を行ってください！

### Tips: より円滑な Pull Request のコメント記載方法

GitHub の Pull Request には、特定の記法を Pull Request の本文に書くことによって、該当 Pull Request のマージ時に自動的に対応する Issues をクローズできる機能があります。 Pull Request を送るときに、余裕があれば "resolve #123" といった形で、該当する Issues の番号を記載されているとレビュアーが非常に助かります 🙏

## 翻訳スタイル

- [JTF日本語標準スタイルガイド（翻訳用）](https://www.jtf.jp/tips/styleguide) に準拠
- JTF日本語標準スタイルのチェックツールは [textlint-plugin-JTF-style](https://github.com/azu/textlint-plugin-JTF-style) を使用し、ルールはVue.js 公式サイト向けに[一部カスタマイズ](.textlintrc)

## 翻訳のゆらぎ & トーン

### 文体
「だである」ではなく「ですます」調

> Vite (French word for "fast", pronounced `/vit/`) is a build tool that aims to provide a faster and leaner development experience for modern web projects. 

- NG : Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）は現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツール**である**。
- OK : Vite（フランス語で「速い」という意味の単語で `/vit/` と発音）は現代の Web プロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツール**です**。

### 半角スペースでアルファベット両端を入れて読みやすく！

> Vite (French word for "fast", pronounced `/vit/`) is a build tool that aims to provide a faster and leaner development experience for modern web projects. 

- NG : Vite(フランス語で「速い」という意味の単語で`/vit/`と発音)は現代のWebプロジェクトのために、より速く無駄のない開発体験を提供することを目的としたビルドツールです。
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

ただし、文の途中にハイフン`-` や セミコロン`;` がある場合は、その記号があると理解しづらい訳になる場合は、例外として削除してもよいです。

- 原文:
> NPM Dependency Resolving and Pre-Bundling.

- 訳文:
> NPM の依存関係の解決と事前バンドル。

### 単語の統一 (特に技術用語)

- 技術用語は基本英語、ただ日本語で一般的に使われている場合は日本語 OK !!
  - 例: 英語の filter 、日本語のフィルタ
- 和訳に困った、とりあえず英語
  - 例: expression -> 式、表現
- 和訳にして分かりづらい場合は、翻訳と英語(どちらかに括弧付け)でも OK
  - 例: Two way -> Two way (双方向)

### 長音訳のついて
原則、**長音なし**で翻訳する。

- NG: コンピューター
- OK: コンピュータ

ただし、長音なしで訳した場合、**意味が分かりにくいものは、例外として長音あり**で訳してもよいです。

> Pull Request flow

- NG: プルリクエストフロ
- OK: プルリクエストフロー

#### 長音訳例外リスト
> NOTE: 以下のリストは随時追加していく

- error: エラー
- throw: スロー
- flow: フロー
- ...
