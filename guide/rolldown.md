# Rolldown の統合

Vite は、ビルドのパフォーマンスと機能を向上させるために、Rust で実装された JavaScript バンドラーの [Rolldown](https://rolldown.rs) を統合する計画を進めています。

## Rolldown とは

Rolldown は Rust で書かれたモダンで高性能な JavaScript バンドラーです。Rollup の代替として設計されており、既存のエコシステムとの互換性を維持しながら、大幅なパフォーマンスの向上を目指しています。

Rolldown は以下の 3 つの重要な原則に焦点を当てています:

- **スピード**: 最大限のパフォーマンスを実現するために Rust で構築
- **互換性**: 既存の Rollup プラグインと連携可能
- **開発者体験**: Rollup ユーザーにとって馴染みのある API

## Vite が Rolldown に移行する理由

1. **統一化**: Vite は現在、依存関係の事前バンドルには esbuild を、プロダクション環境のビルドには Rollup を使用しています。Rolldown はこれらを単一の高性能バンドラーに統一し、両方の目的に使用できるようにすることで、複雑さを軽減することを目指しています。

2. **パフォーマンス**: Rolldown の Rust ベースの実装は、JavaScript ベースのバンドラーと比較して大幅なパフォーマンスの向上を提供します。具体的なベンチマークはプロジェクトのサイズや複雑さによって異なりますが、初期のテストでは Rollup と比較して有望な速度向上が示されています。

Rolldown の背景にある動機についての詳細は、[Rolldown が構築される理由](https://rolldown.rs/guide/#why-rolldown)を参照してください。

## `rolldown-vite` を試す利点

- 特に大規模なプロジェクトで、大幅に高速なビルド時間を体験できます
- Vite のバンドリング体験の未来を形作るための貴重なフィードバックを提供できます
- プロジェクトを将来の公式 Rolldown 統合に向けて準備できます

## Rolldown を試す方法

Rolldown を搭載した Vite のバージョンは現在、`rolldown-vite` という別のパッケージとして利用可能です。`package.json` にパッケージオーバーライドを追加することで試すことができます:

:::code-group

```json [npm]
{
  "overrides": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

```json [Yarn]
{
  "resolutions": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

```json [pnpm]
{
  "pnpm": {
    "overrides": {
      "vite": "npm:rolldown-vite@latest"
    }
  }
}
```

```json [Bun]
{
  "overrides": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

:::

これらのオーバーライドを追加した後、依存関係を再インストールし、通常通り開発サーバーを起動するかプロジェクトをビルドしてください。それ以上の設定変更は必要ありません。

## 既知の制限事項

Rolldown は Rollup の代替として機能することを目指していますが、まだ実装中の機能や意図的な動作の違いがあります。包括的なリストについては、定期的に更新される[この GitHub PR](https://github.com/vitejs/rolldown-vite/pull/84#issue-2903144667) を参照してください。

## 問題の報告

これは実験的な統合であるため、問題が発生する可能性があります。問題が発生した場合は、**メインの Vite リポジトリーではなく**、[`vitejs/rolldown-vite`](https://github.com/vitejs/rolldown-vite) リポジトリーに報告してください。

[問題を報告する](https://github.com/vitejs/rolldown-vite/issues/new)際は、issue テンプレートに従って以下の情報を提供してください:

- 問題の最小限の再現方法
- 環境の詳細（OS、Node バージョン、パッケージマネージャー）
- 関連するエラーメッセージやログ

リアルタイムでの議論やトラブルシューティングについては、[Rolldown Discord](https://chat.rolldown.rs/) に参加してください。

## 今後の計画

`rolldown-vite` パッケージは、フィードバックを収集し Rolldown 統合を安定させるための一時的な解決策です。将来的には、この機能はメインの Vite リポジトリーにマージされる予定です。

`rolldown-vite` を試して、フィードバックや問題報告を通じてその開発に貢献することをお勧めします。

## プラグイン / フレームワーク作者向けガイド

### 主な変更点

- ビルドに Rolldown が使用されます（以前は Rollup が使用されていました）
- オプティマイザーに Rolldown が使用されます（以前は esbuild が使用されていました）
- CommonJS のサポートは Rolldown によって処理されます（以前は @rollup/plugin-commonjs が使用されていました）
- 構文の低レベル変換に Oxc が使用されます（以前は esbuild が使用されていました）
- CSS の圧縮にはデフォルトで Lightning CSS が使用されます（以前は esbuild が使用されていました）
- JS の圧縮にはデフォルトで Oxc minifier が使用されます（以前は esbuild が使用されていました）
- 設定のバンドルに Rolldown が使用されます（以前は esbuild が使用されていました）

### rolldown-vite の検出方法

以下のいずれかの方法で検出できます:

- `this.meta.rolldownVersion` の存在を確認する

```js
const plugin = {
  resolveId() {
    if (this.meta.rolldownVersion) {
      // rolldown-vite 向けのロジック
    } else {
      // rollup-vite 向けのロジック
    }
  },
}
```

- `rolldownversion` エクスポートの存在を確認します

```js
import * as vite from 'vite'

if (vite.rolldownVersion) {
  // rolldown-vite 向けのロジック
} else {
  // rollup-vite 向けのロジック
}
```

依存関係（peer dependency ではない）として `vite` がある場合、`rolldownVersion` エクスポートは、コードのどこからでも使用できるため有用です。

### Rolldown のオプション検証を無視するには

Rolldown は、不明または無効なオプションが渡されるとエラーをスローします。Rollup で利用可能ないくつかのオプションは Rolldown でサポートされていないため、エラーに遭遇する可能性があります。以下に、このようなエラーメッセージの例を見つけることができます:

> Error: Failed validate input options.
>
> - For the "preserveEntrySignatures". Invalid key: Expected never but received "preserveEntrySignatures".

これは、上記のように `rolldown-vite` で実行されているかどうかを確認することでオプションを条件的に渡すことで修正できます。

今のところこのエラーを抑制したい場合は、 `rolldown_options_validation = loose` 環境変数を設定できます。ただし、最終的には Rolldown でサポートされていないオプションを渡すのをやめる必要があることに留意してください。

### `transformwithesbuild` は `esbuild` を個別にインストールする必要があります

`esbuild` の代わりに Oxc を使用する `transformWithOxc` と呼ばれる同様の関数は、`rolldown-vite` からエクスポートされます。

### `esbuild` オプションの互換性レイヤー

Rolldown-Vite には、`esbuild` のオプションをそれぞれの Oxc または `rolldown` のオプションに変換する互換性レイヤーがあります。[Ecosystem-Ci](https://github.com/vitejs/vite-ecosystem-ci/blob/rolldown-vite/README-temp.md)でテストされているように、これは多くの場合、単純な `esbuild` プラグインを含めて動作します。
とはいえ、**将来的には `esbuild` オプションのサポートを削除する予定**なので、対応する Oxc または `rolldown` オプションを試すことをお勧めします。
`configResolved` フックから互換性レイヤーによって設定されたオプションを取得できます。

```js
const plugin = {
  name: 'log-config',
  configResolved(config) {
    console.log('options', config.optimizeDeps, config.oxc)
  },
},
```

### フックフィルター機能

Rolldown は[フックフィルター機能](https://rolldown.rs/guide/plugin-development#plugin-hook-filters)を導入して、Rust と JavaScript のランタイムの間の通信を縮小しました。この機能を使用することで、プラグインのパフォーマンスを向上させることができます。
これは、Rollup 4.38.0+ および Vite 6.3.0+ によってサポートされています。プラグインを古いバージョンとの後方互換性を持たせるには、フックハンドラー内でフィルターを実行してください。

### `load` または `transform` フックでコンテンツを JavaScript に変換する

`load` または `Transform` フックでコンテンツを他のタイプから JavaScript に変換する場合、`moduleType: 'js'` を返された値に追加する必要がある場合があります。

```js
const plugin = {
  name: 'txt-loader',
  load(id) {
    if (id.endsWith('.txt')) {
      const content = fs.readFile(id, 'utf-8')
      return {
        code: `export default ${JSON.stringify(content)}`,
        moduleType: 'js', // [!code ++]
      }
    }
  },
}
```

これは、[Rolldown は JavaScript 以外のモジュールもサポート](https://rolldown.rs/guide/in-depth/module-types)しており、指定がない限り拡張子からモジュールタイプを拡張するためです。`rolldown-vite` は開発時にはモジュールタイプをサポートしていないことに注意してください。
