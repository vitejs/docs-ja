# 破壊的変更

API の非推奨、削除、変更を含む、Vite の変更点のリストです。以下の変更のほとんどは、Vite の設定にある[`future` オプション](/config/shared-options.html#future)を使ってオプトインできます。

## 計画中

これらの変更は Vite の次のメジャーバージョンで予定されています。非推奨または使用上の警告は、可能な限りガイドし、私たちはこれらの変更を適用するようフレームワーク、プラグイン作者、ユーザーに働きかけています。

- [フック内の `this.environment`](/changes/this-environment-in-hooks)
- [HMR `hotUpdate` プラグインフック](/changes/hotupdate-hook)
- [`ModuleRunner` API を使った SSR](/changes/ssr-using-modulerunner)

## 検討中

これらの変更は検討中であり、現在の使用パターンを改善するための実験的な API であることが多いです。すべての変更がここに記載されているわけではないので、完全なリストについては [Vite GitHub ディスカッションの experimental ラベル](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=label%3Aexperimental+category%3AFeedback) を確認してください。

これらの API に切り替えることはまだお勧めしません。これらの API はフィードバックを集めるために Vite に含まれています。これらの提案を確認し、あなたのユースケースでどのように機能するか、それぞれのリンク先の GitHub Discussions でお知らせください。

- [環境ごとの API への移行](/changes/per-environment-apis)
- [ビルド時の共有プラグイン](/changes/shared-plugins-during-build)

## 過去

以下の変更は、すでに終了または差し戻されています。現在のメジャーバージョンではこれらは関係ありません。

- _過去の変更はまだありません_
