# トラブルシューティング

さらなる情報は[Rollup のトラブルシューティングガイド](https://rollupjs.org/troubleshooting/)もご覧ください。

こちらに提案されているもので動作しなかった場合、[GitHub Discussions](https://github.com/vitejs/vite/discussions) や [Vite Land Discord](https://chat.vite.dev) の `#help` チャンネルで質問してみてください。

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

プロジェクトフォルダーへのパスに `&` が含まれているかもしれません。この場合、Windows では `npm` が動作しません（[npm/cmd-shim#45](https://github.com/npm/cmd-shim/issues/45)）。

次のいずれかを行う必要があります:

- ほかのパッケージマネージャーに切り替える（例: `pnpm`、`yarn`）
- プロジェクトへのパスから `&` を取り除く

## 設定

### ESM のみのパッケージ

ESM のみのパッケージを `require` でインポートすると、以下のエラーが発生します。

> Failed to resolve "foo". This package is ESM only but it was tried to load by `require`.

> Error [ERR_REQUIRE_ESM]: require() of ES Module /path/to/dependency.js from /path/to/vite.config.js not supported.
> Instead change the require of index.js in /path/to/vite.config.js to a dynamic import() which is available in all CommonJS modules.

Node.js 22 以前では、ESM ファイルはデフォルトでは [`require`](<https://nodejs.org/docs/latest-v22.x/api/esm.html#require>) で読み込むことができません。

ESM ファイルは [`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) の利用や、Node.js 23 以降、その他のランタイムでは動作する可能性がありますが、まだ以下のいずれかの方法で、設定を ESM に変換することをお勧めします:

- 一番近い `package.json` に `"type": "module"` を追加する
- `vite.config.js` / `vite.config.ts` を `vite.config.mjs` / `vite.config.mts` にファイル名を変更する

## 開発サーバー

### リクエストがいつまでも終わらない

Linux を利用している場合、ファイルディスクリプタ制限と inotify 制限が問題を引き起こしているかもしれません。Vite はほとんどのファイルをバンドルしないため、ブラウザーが大量のファイルをリクエストし、大量のファイルディスクリプタが必要になり、制限を超えることがあります。

これを解決するためには:

- `ulimit` によりファイルディスクリプタ制限を引き上げる

  ```shell
  # 現在の制限を確認
  $ ulimit -Sn
  # 制限を変更（一時的）
  $ ulimit -Sn 10000 # ハードリミットを変更する必要もあるかもしれません
  # ブラウザーを再起動する
  ```

- `sysctl` により次の inotify 関連の制限を引き上げる

  ```shell
  # 現在の制限を確認
  $ sysctl fs.inotify
  # 制限を変更（一時的）
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

上記の手順でうまくいかない場合は、以下のファイルに `DefaultLimitNOFILE=65536` をコメント無しで追加してみてください:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Ubuntu Linux では、systemd 設定ファイルを更新する代わりに、`/etc/security/limits.conf` のファイルに `* - nofile 65536` という行を追加する必要があるかもしれません。

これらの設定は持続しますが、**再起動が必要**なことに注意してください。

あるいは、サーバーが VS Code devcontainer 内で起動している場合、リクエストが停止したように見える場合があります。この問題を修正するには
[Dev Container / VS Code のポートフォワーディング](#dev-containers-vs-code-port-forwarding) を参照してください。

### ネットワークリクエストの読み込みが止まる
 
自己署名 SSL 証明書を使用する場合、Chrome はすべてのキャッシュディレクティブを無視し、コンテンツを再読み込みします。Vite は、これらのキャッシュディレクティブに依存しています。

この問題を解決するには、信頼できる SSL 証明書を使用してください。

参照: [キャッシュの問題](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html)、[Chrome の問題](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macOS

このコマンドで、CLI から信頼できる証明書をインストールできます:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

または、キーチェーンアクセスアプリにインポートして、証明書の信頼度を「常に信頼」に更新します。

### 431 Request Header Fields Too Large

サーバー / WebSocket サーバーが大きな HTTP ヘッダーを受信した場合、リクエストが破棄され次のような警告が表示されます。

> Server responded with status code 431. See https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large.

これは [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121) を軽減するため Node.js がリクエストヘッダーサイズを制限しているためです。

これを回避するためには、リクエストヘッダーサイズを減らすことを試みてください。例えば、クッキーが長い場合、削除します。あるいは、[`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize) を利用して最大ヘッダーサイズを変更できます。

### Dev Container / VS Code のポートフォワーディング {#dev-containers-vs-code-port-forwarding}

Dev Container や VS Code のポートフォワーディング機能を使用している場合、正しく動作するように [`server.host`](/config/server-options.md#server-host) オプションを `127.0.0.1` に設定する必要があるかもしれません。

これは、[VS Code のポートフォワーディング機能が IPv6 をサポートしていない](https://github.com/microsoft/vscode-remote-release/issues/7029)ためです。

より詳しくは、[#16522](https://github.com/vitejs/vite/issues/16522)を参照してください。

## HMR

### Vite がファイルの変更を検知しているのに HMR が動作しない

ファイルを別のケースでインポートしているかもしれません。例えば、`src/foo.js` が存在し、`src/bar.js` が次の内容を含んでいる場合:

```js
import './Foo.js' // './foo.js' であるべき
```

関連 issue: [#964](https://github.com/vitejs/vite/issues/964)

### Vite がファイル変更を検知しない

Vite を WSL2 で実行している場合、いくつかの条件下では Vite はファイル変更を監視できません。[`server.watch` オプション](/config/server-options.md#server-watch) を参照してください。

### HMR ではなく完全なリロードが発生する

HMR が Vite またはプラグインによって処理されていない場合、状態を更新する唯一の方法であるため、フルリロードが行われます。

HMR が処理されているものの、それが循環依存関係の中にある場合、実行順序を回復するためにフルリロードも起こります。これを解決するには、そのループを解除してみてください。`vite --debug hmr` を実行することで、ファイル変更がトリガーとなった場合に、循環依存関係のパスをログに残すことができます。

## ビルド

### ビルドしたファイルが CORS エラーで動作しない

出力される HTML ファイルが `file` プロトコルで開かれている場合、以下のようなエラーでスクリプトが実行されません。

> Access to script at 'file:///foo/bar.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///foo/bar.js. (Reason: CORS request not http).

この現象が発生する理由については、[Reason: CORS request not HTTP - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) を参照してください。

ファイルには `http` プロトコルでアクセスする必要があります。これを実現する最も簡単な方法は、`npx vite preview` を実行することです。

## 最適化された依存関係

### ローカルパッケージにリンクする際、事前バンドルした依存関係が古くなる

最適化された依存関係を無効にするために使用されるハッシュキーは、パッケージロックの内容、依存関係に適用されるパッチ、およびノードモジュールのバンドルに影響を与える Vite 設定ファイルのオプションに依存します。つまり、Vite は [npm overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) のような機能を使って依存関係が上書きされたことを検出し、次のサーバー起動時に依存関係を再バンドルします。[npm link](https://docs.npmjs.com/cli/v9/commands/npm-link) のような機能を使っても、Vite は依存関係を無効化することはありません。依存関係をリンクまたはリンク解除した場合、次のサーバー起動時に `vite --force` を使って強制的に再最適化する必要があります。代わりにオーバーライドを使うことをお勧めします。オーバーライドは現在すべてのパッケージマネージャーでサポートされています（[pnpm overrides](https://pnpm.io/package_json#pnpmoverrides) および [yarn resolutions](https://yarnpkg.com/configuration/manifest/#resolutions) も参照してください）。

## パフォーマンスのボトルネック {#performance-bottlenecks}

アプリケーションのパフォーマンスがボトルネックとなり読み込みに時間がかかる場合、Vite 開発サーバーまたはアプリケーションをビルドするときに組み込みの Node.js インスペクターを起動して CPU プロファイルを作成できます:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite 開発サーバー
アプリケーションをブラウザーで開いたら、読み込みが終わるのを待ち、ターミナルに戻って `p` キーを押し（Node.js インスペクターを停止します）、次に `q` キーを押して開発サーバーを停止します。
:::

Node.js インスペクターはルートフォルダーに `vite-profile-0.cpuprofile` を生成し、https://www.speedscope.app/ に遷移、`BROWSE` ボタンを使って CPU プロファイルをアップロードし、結果を検証します。

[vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) をインストールすると、Vite プラグインの中間状態を検査でき、アプリケーションのボトルネックとなっているプラグインやミドルウェアを特定するのに役立ちます。このプラグインは開発モードとビルドモードの両方で使用できます。詳しくは readme ファイルをご覧ください。

## その他

### ブラウザー互換性のためにモジュールを外部化

Node.js のモジュールをブラウザーで使用する場合、Vite では以下のような警告が出力されます。

> Module "fs" has been externalized for browser compatibility. Cannot access "fs.readFile" in client code.

これは、Vite が Node.js のモジュールを自動的にポリフィルしないためです。

ポリフィルは手動で追加できますが、バンドルサイズを小さくするため、ブラウザーコードに Node.js モジュールを使うのは避けることをお勧めします。もし、モジュールが（ブラウザーで使用することを想定した）サードパーティのライブラリーからインポートされている場合は、それぞれのライブラリーに問題を報告することをお勧めします。

### Syntax Error / Type Error が発生する

Vite は非厳格モード（sloppy モード）でのみ動作するコードを処理できず、対応していません。これは Vite が ESM を利用していて ESM 内では常に[厳格モード](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Strict_mode)であるためです。

例えば、次のようなエラーを表示されることがあります。

> [ERROR] With statements cannot be used with the "esm" output format due to strict mode

> TypeError: Cannot create property 'foo' on boolean 'false'

これらのコードが依存関係で使われていた場合、[`patch-package`](https://github.com/ds300/patch-package)（または [`yarn patch`](https://yarnpkg.com/cli/patch) または [`pnpm patch`](https://pnpm.io/cli/patch)）をエスケープハッチとして利用できます。

### ブラウザーの拡張機能

ブラウザーの拡張機能（広告ブロッカーなど）によっては、Vite クライアントが Vite 開発サーバーにリクエストを送信できなくすることがあります。この場合、白い画面が表示され、ログにはエラーが出力されません。この問題が発生した場合は、拡張機能を無効にしてみてください。

### Windows のクロスドライブリンク

Windows でプロジェクトにクロスドライブリンクがある場合、Vite が動作しない場合があります。

クロスドライブリンクの例としては、以下のようなものがあります:

- `subst` コマンドでフォルダーにリンクされた仮想ドライブ
- `mklink` コマンドによる別ドライブへのシンボリックリンク/ジャンクション（例：Yarn のグローバルキャッシュ）

関連 issue: [#10802](https://github.com/vitejs/vite/issues/10802)

<script setup lang="ts">
// redirect old links with hash to old version docs
if (typeof window !== "undefined") {
  const hashForOldVersion = {
    'vite-cjs-node-api-deprecated': 6
  }

  const version = hashForOldVersion[location.hash.slice(1)]
  if (version) {
    // update the scheme and the port as well so that it works in local preview (it is http and 4173 locally)
    location.href = `https://v${version}.vite.dev` + location.pathname + location.search + location.hash
  }
}
</script>
