# v5 からの移行

## Environment API

新しい実験的な [Environment API](/guide/api-environment.md) の一部として、大きな内部リファクタリングが必要でした。Vite 6 は、ほとんどのプロジェクトが新しいメジャーに素早くアップグレードできるように、破壊的変更を避けるように努めています。エコシステムの大部分が移行して安定し、新しい API の使用を推奨し始めるまで待ちます。いくつかのエッジケースはあるかもしれなれませんが、それはフレームワークやツールによる低レベルの使用にのみ影響するはずです。私たちはエコシステムのメンテナーと協力して、リリース前にこれらの差分を軽減しました。リグレッションを発見した場合は、[問題を報告](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml)してください。

Vite の実装変更に伴い、いくつかの内部 API が削除されました。これらの API に依存していた場合は、[機能のリクエスト](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml)を作成してください。

## Vite ランタイム API

実験的な Vite ランタイム API は、新しい実験的な [Environment API](/guide/api-environment) の一部として Vite 6 でリリースされたモジュールランナー API へと進化しました。この機能が実験的なものであったことを考えると、Vite 5.1 で導入された以前の API の削除は破壊的変更ではありませんが、ユーザーは Vite 6 への移行の一環として、モジュールランナー API と同等のものに更新する必要があります。

## v4 からの移行

まず、Vite v5 ドキュメントの[v4 からの移行ガイド](https://v5.vite.dev/guide/migration.html)をチェックし、アプリを Vite 5 に移植するために必要な変更を確認してから、このページの変更を進めてください。
