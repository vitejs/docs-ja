# トラブルシューティング

さらなる情報は[Rollupのトラブルシューティングガイド](https://rollupjs.org/guide/en/#troubleshooting)もご覧ください。

こちらに提案されているもので動作しなかった場合、[GitHub Discussions](https://github.com/vitejs/vite/discussions) や [Vite Land Discord](https://chat.vitejs.dev) の `#help` チャンネルで質問してみてください。

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

プロジェクトフォルダへのパスに `&` が含まれているかもしれません。この場合、Windows では `npm` が動作しません ([npm/cmd-shim#45](https://github.com/npm/cmd-shim/issues/45))。

次のいずれかを行う必要があります:

- ほかのパッケージマネージャに切り替える (例: `pnpm`、`yarn`)
- プロジェクトへのパスから `&` を取り除く

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

上記の手順でうまくいかない場合は、以下のファイルに `DefaultLimitNOFILE=65536` をコメント無しで追加してみてください:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

これらの設定は持続しますが、**再起動が必要**なことに注意してください。

### 431 Request Header Fields Too Large

サーバ / WebSocket サーバが大きな HTTP ヘッダを受信した場合、リクエストが破棄され次のような警告が表示されます。

> Server responded with status code 431. See https://vitejs.dev/guide/troubleshooting.html#_431-request-header-fields-too-large.

これは [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121) を軽減するため Node.js がリクエストヘッダサイズを制限しているためです。

これを回避するためには、リクエストヘッダサイズを減らすことを試みてください。例えば、クッキーが長い場合、削除します。あるいは、[`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize) を利用して最大ヘッダサイズを変更できます。

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

## ビルド

### ビルドしたファイルが CORS エラーで動作しない

出力される HTML ファイルが `file` プロトコルで開かれている場合、以下のようなエラーでスクリプトが実行されません。

> Access to script at 'file:///foo/bar.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///foo/bar.js. (Reason: CORS request not http).

この現象が発生する理由については、[Reason: CORS request not HTTP - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) を参照してください。

ファイルには `http` プロトコルでアクセスする必要があります。これを実現する最も簡単な方法は、`npx vite preview` を実行することです。

## その他

### Syntax Error / Type Error が発生する

Vite は非厳格モード (sloppy モード) でのみ動作するコードを処理できず、対応していません。これは Vite が ESM を利用していて ESM 内では常に[厳格モード](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Strict_mode)であるためです。

例えば、次のようなエラーを表示されることがあります。

> [ERROR] With statements cannot be used with the "esm" output format due to strict mode

> TypeError: Cannot create property 'foo' on boolean 'false'

これらのコードが依存関係で使われていた場合、[`patch-package`](https://github.com/ds300/patch-package) (または [`yarn patch`](https://yarnpkg.com/cli/patch) または [`pnpm patch`](https://pnpm.io/cli/patch)) をエスケープハッチとして利用できます。
