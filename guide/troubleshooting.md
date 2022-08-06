# トラブルシューティング

さらなる情報は[Rollupのトラブルシューティングガイド](https://rollupjs.org/guide/en/#troubleshooting)もご覧ください。

こちらに提案されているもので動作しなかった場合、[GitHub Discussions](https://github.com/vitejs/vite/discussions) や [Vite Land Discord](https://chat.vitejs.dev) の `#help` チャンネルで質問してみてください。

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

プロジェクトフォルダへのパスに `?` が含まれているかもしれません。この場合、Windows では `npm` が動作しません ([npm/cmd-shim#45](https://github.com/npm/cmd-shim/issues/45))。

次のいずれかを行う必要があります:

- ほかのパッケージマネージャに切り替える (例: `pnpm`、`yarn`)
- プロジェクトへのパスから `?` を取り除く

## 開発サーバ

### リクエストがいつまでも終わらない

Linux を利用している場合、ファイルディスクリプタ制限と inotify 制限が問題を引き起こしているかもしれません。Vite はほとんどのファイルをバンドルしないため、ブラウザが大量のファイルをリクエストし、大量のファイルディスクリプタが必要になり、制限を超えることがあります。

これを解決するためには:

- `ulimit` によりファイルディスクリプタ制限を引き上げる

  ```shell
  # 現在の制限を確認
  $ ulimit -Sn
  # 制限を変更 (一時的)
  $ ulimit -Sn 10000 # ハードリミットを変更する必要もあるかもしれません
  # ブラウザを再起動する
  ```

- `sysctl` により次の inotify 関連の制限を引き上げる

  ```shell
  # 現在の制限を確認
  $ sysctl fs.inotify
  # 制限を変更 (一時的)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

## HMR

### Viteがファイルの変更を検知しているのにHMRが動作しない

ファイルを別のケースでインポートしているかもしれません。例えば、`src/foo.js` が存在し、`src/bar.js` が次の内容を含んでいる場合:

```js
import './Foo.js' // './foo.js' であるべき
```

関連 issue: [#964](https://github.com/vitejs/vite/issues/964)

### Viteがファイル変更を検知しない

Vite を WSL2 で実行している場合、いくつかの条件下では Vite はファイル変更を監視できません。[`server.watch` オプション](/config/server-options.md#server-watch) を参照してください。

### HMRではなく完全なリロードが発生する

Vite もしくはプラグインによって HMR が処理されていない場合、完全なリロードが発生します。

また、依存関係の循環がある場合、完全なリロードが発生します。これを解決するには、循環を取り除くことを試みてください。
