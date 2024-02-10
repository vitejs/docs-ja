# コマンドラインインターフェイス

## 開発サーバー

### `vite`

Vite 開発サーバーをカレントディレクトリーで起動します。

#### 使い方

```bash
vite [root]
```

#### オプション

| オプション                  |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| `--host [host]`          | ホスト名を指定する (`string`)                                       |
| `--port <port>`          | ポートを指定する (`number`)                                           |
| `--open [path]`          | 起動時にブラウザーを起動する (`boolean \| string`)                     |
| `--cors`                 | CORS を有効化する (`boolean`)                                           |
| `--strictPort`           | 指定されたポートが既に使用されている場合は終了する (`boolean`)              |
| `--force`                | オプティマイザーにキャッシュを無視して再バンドルさせる (`boolean`) |
| `-c, --config <file>`    | 指定された設定ファイルを使用する (`string`)                              |
| `--base <path>`          | public のベースパス（デフォルト: `/`） (`string`)                        |
| `-l, --logLevel <level>` | info \| warn \| error \| silent (`string`)                        |
| `--clearScreen`          | ログを表示する際に画面をクリアするかどうか (`boolean`)               |
| `--profile`              | 組み込みの Node.js インスペクターを起動する ([パフォーマンスのボトルネック](/guide/troubleshooting#performance-bottlenecks)を確認してください) |
| `-d, --debug [feat]`     | デバッグログを表示する (`string \| boolean`)                             |
| `-f, --filter <filter>`  | デバッグログをフィルタリングする (`string`)                                      |
| `-m, --mode <mode>`      | env モードを設定する (`string`)                                           |
| `-h, --help`             | 利用可能な CLI オプションを表示する                                     |
| `-v, --version`          | バージョン番号を表示する                                            |

## ビルド

### `vite build`

プロダクション用にビルドします。

#### 使い方

```bash
vite build [root]
```

#### オプション

| オプション                        |                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `--target <target>`            | トランスパイル対象（デフォルト: `"modules"`） (`string`)                                                            |
| `--outDir <dir>`               | 出力ディレクトリー（デフォルト: `dist`） (`string`)                                                                   |
| `--assetsDir <dir>`            | 出力先のディレクトリー内で静的アセットを配置するディレクトリー（デフォルト: `"assets"`） (`string`)              |
| `--assetsInlineLimit <number>` | 静的アセットを base64 inline 化する閾値（単位はバイト。デフォルト: `4096`） (`number`)                      |
| `--ssr [entry]`                | サーバーサイドレンダリング用に特定のエントリーをビルドする (`string`)                                         |
| `--sourcemap [output]`         | ビルド用のソースマップを出力する (デフォルト: `false`) (`boolean \| "inline" \| "hidden"`)                                 |
| `--minify [minifier]`          | 最小化を有効/無効にする、または使用するミニファイアを指定する (デフォルト: `"esbuild"`) (`boolean \| "terser" \| "esbuild"`) |
| `--manifest [name]`            | ビルドマニフェスト JSON を出力する (`boolean \| string`)                                                                |
| `--ssrManifest [name]`         | SSR マニフェスト JSON を出力する (`boolean \| string`)                                                                  |
| `--emptyOutDir`                | root の外部に outDir がある場合、outDir を強制的に空にする (`boolean`)                                                            |
| `-w, --watch`                  | ディスク上のモジュールが変更されたときに再ビルドする (`boolean`)                                                              |
| `-c, --config <file>`          | 指定された設定ファイルを使用する (`string`)                                                                                |
| `--base <path>`                | public のベースパス（デフォルト: `/`） (`string`)                                                                          |
| `-l, --logLevel <level>`       | Info \| warn \| error \| silent (`string`)                                                                          |
| `--clearScreen`                | ログを表示する際に画面をクリアするかどうか (`boolean`)                                                                 |
| `--profile`                    | 組み込みの Node.js インスペクターを起動する ([パフォーマンスのボトルネック](/guide/troubleshooting#performance-bottlenecks)を確認してください) |
| `-d, --debug [feat]`           | デバッグログを表示する (`string \| boolean`)                                                                               |
| `-f, --filter <filter>`        | デバッグログをフィルタリングする (`string`)                                                                                        |
| `-m, --mode <mode>`            | env モードを設定する (`string`)                                                                                             |
| `-h, --help`                   | 利用可能な CLI オプションを表示する                                                                                       |

## その他

### `vite optimize`

依存関係を事前バンドルします。

#### 使い方

```bash
vite optimize [root]
```

#### オプション

| オプション                  |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| `--force`                | オプティマイザーにキャッシュを無視して再バンドルさせる (`boolean`) |
| `-c, --config <file>`    | 指定された設定ファイルを使用する (`string`)                       |
| `--base <path>`          | public のベースパス（デフォルト: `/`） (`string`)                     |
| `-l, --logLevel <level>` | Info \| warn \| error \| silent (`string`)                        |
| `--clearScreen`          | ログを表示する際に画面をクリアするかどうか (`boolean`)          |
| `-d, --debug [feat]`     | デバッグログを表示する (`string \| boolean`)                      |
| `-f, --filter <filter>`  | デバッグログをフィルタリングする (`string`)                       |
| `-m, --mode <mode>`      | env モードを設定する (`string`)                                    |
| `-h, --help`             | 利用可能な CLI オプションを表示する                               |

### `vite preview`

プロダクションビルドをローカルでプレビューします。プロダクション用として設計されていないため、プロダクション用サーバーとして使用しないでください。

#### 使い方

```bash
vite preview [root]
```

#### オプション

| オプション                  |                                                      |
| ------------------------ | ---------------------------------------------------- |
| `--host [host]`          | ホスト名を指定する (`string`)                          |
| `--port <port>`          | ポートを指定する (`number`)                              |
| `--strictPort`           | 指定されたポートが既に使用されている場合は終了する (`boolean`) |
| `--open [path]`          | 起動時にブラウザーを起動する (`boolean \| string`)        |
| `--outDir <dir>`         | 出力ディレクトリー（デフォルト: `dist`） (`string`)         |
| `-c, --config <file>`    | 指定された設定ファイルを使用する (`string`)                 |
| `--base <path>`          | public のベースパス（デフォルト: `/`） (`string`)           |
| `-l, --logLevel <level>` | Info \| warn \| error \| silent (`string`)           |
| `--clearScreen`          | ログを表示する際に画面をクリアするかどうか (`boolean`)  |
| `-d, --debug [feat]`     | デバッグログを表示する (`string \| boolean`)                |
| `-f, --filter <filter>`  | デバッグログをフィルタリングする (`string`)                         |
| `-m, --mode <mode>`      | env モードを設定する (`string`)                              |
| `-h, --help`             | 利用可能な CLI オプションを表示する                        |
