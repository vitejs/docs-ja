# Rolldown の統合

Vite は、ビルドのパフォーマンスと機能を向上させるために、Rust で実装された JavaScript バンドラーの [Rolldown](https://rolldown.rs) を統合する計画を進めています。

<YouTubeVideo videoId="RRjfm8cMveQ" />

## Rolldown とは

Rolldown は Rust で書かれたモダンで高性能な JavaScript バンドラーです。Rollup の代替として設計されており、既存のエコシステムとの互換性を維持しながら、大幅なパフォーマンスの向上を目指しています。

Rolldown は以下の 3 つの重要な原則に焦点を当てています:

- **スピード**: 最大限のパフォーマンスを実現するために Rust で構築
- **互換性**: 既存の Rollup プラグインと連携可能
- **最適化**: esbuild や Rollup が実装しているものを超えた機能を提供

## Vite が Rolldown に移行する理由

1. **統一化**: Vite は現在、依存関係の事前バンドルには esbuild を、プロダクション環境のビルドには Rollup を使用しています。Rolldown はこれらを単一の高性能バンドラーに統一し、両方の目的に使用できるようにすることで、複雑さを軽減することを目指しています。

2. **パフォーマンス**: Rolldown の Rust ベースの実装は、JavaScript ベースのバンドラーと比較して大幅なパフォーマンスの向上を提供します。具体的なベンチマークはプロジェクトのサイズや複雑さによって異なりますが、初期のテストでは Rollup と比較して有望な速度向上が示されています。

3. **追加機能**: Rolldown は、高度なチャンク分割制御、ビルトインの HMR、モジュールフェデレーションなど、Rollup や esbuild では利用できない機能が導入されています。

Rolldown の背景にある動機についての詳細は、[Rolldown が構築される理由](https://rolldown.rs/guide/#why-rolldown)を参照してください。

## `rolldown-vite` を試す利点

- 特に大規模なプロジェクトで、大幅に高速なビルド時間を体験できます
- Vite のバンドリング体験の未来を形作るための貴重なフィードバックを提供できます
- プロジェクトを将来の公式 Rolldown 統合に向けて準備できます

## Rolldown を試す方法

Rolldown を搭載した Vite のバージョンは現在、`rolldown-vite` という別のパッケージとして利用可能です。`vite` を直接の依存関係として持っている場合、プロジェクトの `package.json` で `vite` パッケージを `rolldown-vite` にエイリアスすることで、ドロップイン置換として機能するはずです。

```json
{
  "dependencies": {
    "vite": "^6.0.0", // [!code --]
    "vite": "npm:rolldown-vite@latest" // [!code ++]
  }
}
```

Vitepress や Vite をピア依存関係として持つメタフレームワークを使用している場合は、`package.json` で `vite` の依存関係をオーバーライドする必要があります。これはパッケージマネージャーによって若干異なります:

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

### オプション検証エラー {#option-validation-errors}

Rolldown は不明または無効なオプションが渡されるとエラーをスローします。Rollup で利用可能な一部のオプションは Rolldown ではサポートされていないため、使用しているメタフレームワークや自身が設定したオプションに応じてエラーが発生する可能性があります。以下に、このようなエラーメッセージの例を示します:

> Error: Failed validate input options.
>
> - For the "preserveEntrySignatures". Invalid key: Expected never but received "preserveEntrySignatures".

このオプションを自身で設定していない場合は、使用しているフレームワークで修正される可能性があります。それまでの間、`ROLLDOWN_OPTIONS_VALIDATION=loose` 環境変数を設定することでこのエラーを抑制できます。

### API の違い

#### `manualChunks` から `advancedChunks` へ

Rolldown は Rollup で利用可能だった `manualChunks` オプションをサポートしていません。代わりに、webpack の `splitChunk` に似た、よりきめ細かい設定を [`advancedChunks` オプション](https://rolldown.rs/guide/in-depth/advanced-chunks#advanced-chunks) を通じて提供します:

```js
// 以前の設定 (Rollup)
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/react(?:-dom)?/.test(id)) {
            return 'vendor'
          }
        }
      }
    }
  }
}

// 新しい設定 (Rolldown)
export default {
  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [{ name: 'vendor', test: /\/react(?:-dom)?// }]
        }
      }
    }
  }
}
```

## パフォーマンス

`rolldown-vite` は既存のエコシステムとの互換性を確保することに重点を置いており、デフォルトはスムーズな移行を目的としています。より高速な Rust ベースの内部プラグインやその他のカスタマイズに切り替えることで、さらなるパフォーマンス向上を得ることができます。

### ネイティブプラグインの有効化

Rolldown と Oxc のおかげで、エイリアスや resolve プラグインなどの Vite の内部プラグインが Rust に変換されました。執筆時点では、これらのプラグインの動作が JavaScript 版とは異なる可能性があるため、デフォルトでは有効になっていません。

これらをテストするには、Vite の設定で `experimental.enableNativePlugin` オプションを `true` に設定できます。

### `@vitejs/plugin-react-oxc`

`@vitejs/plugin-react` または `@vitejs/plugin-react-swc` を使用している場合、React の高速リフレッシュに Babel や SWC の代わりに Oxc を使用する `@vitejs/plugin-react-oxc` プラグインに切り替えることができます。これはドロップイン置換として設計されており、ビルドパフォーマンスを向上させ、`rolldown-vite` の基盤となるアーキテクチャと連携します。

Babel または SWC プラグイン（React コンパイラーを含む）を使用していない場合、または SWC オプションを変更していない場合にのみ、`@vitejs/plugin-react-oxc` に切り替えられることに注意してください。

### `withFilter` ラッパー

プラグイン作者は、Rust と JavaScript のランタイム間の通信オーバーヘッドを削減するために、[フックフィルター機能](#hook-filter-feature)を使用するオプションがあります。
しかし、使用されているプラグインの一部がまだこの機能を使用していない場合でも、その恩恵を受けたい場合は、`withFilter` ラッパーを使用してプラグインを自分でフィルターでラップできます。

```js
// vite.config.ts 内
import { withFilter, defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    // `.svg?react` で終わるファイルに対してのみ `svgr` プラグインをロードする
    withFilter(
      svgr({
        /*...*/
      }),
      { load: { id: /\.svg\?react$/ } },
    ),
  ],
})
```

## 問題の報告

これは実験的な統合であるため、問題が発生する可能性があります。問題が発生した場合は、**メインの Vite リポジトリーではなく**、[`vitejs/rolldown-vite`](https://github.com/vitejs/rolldown-vite) リポジトリーに報告してください。

[問題を報告する](https://github.com/vitejs/rolldown-vite/issues/new)際は、適切な issue テンプレートに従ってそこで要求されている内容を提供してください。一般的には次のような内容が含まれます:

- 問題の最小限の再現方法
- 環境の詳細（OS、Node バージョン、パッケージマネージャー）
- 関連するエラーメッセージやログ

リアルタイムでの議論やトラブルシューティングについては、[Rolldown Discord](https://chat.rolldown.rs/) に参加してください。

## バージョニングポリシー

`rolldown-vite` のバージョニングポリシーは、通常の Vite パッケージのメジャーバージョンとマイナーバージョンに合わせられます。この同期により、特定の通常の Vite マイナーリリースに存在する機能が、対応する `rolldown-vite` のマイナーリリースにも含まれることが保証されます。ただし、パッチバージョンは 2 つのプロジェクト間で同期されないことに注意してください。通常の Vite からの特定の変更が `rolldown-vite` に含まれているかどうか疑問に思う場合は、いつでも [`rolldown-vite` の個別の変更履歴](https://github.com/vitejs/rolldown-vite/blob/rolldown-vite/packages/vite/CHANGELOG.md) を確認できます。

さらに、`rolldown-vite` 自体は実験的なものと見なされていることに注意してください。その実験的な性質のため、パッチバージョン内であっても破壊的変更が導入される可能性があります。加えて、`rolldown-vite` は最新のマイナーバージョンに対してのみ更新を受け取ることに注意してください。重要なセキュリティー修正やバグ修正であっても、古いメジャーバージョンやマイナーバージョン用のパッチは作成されません。

## 今後の計画

`rolldown-vite` パッケージは、フィードバックを収集し Rolldown 統合を安定させるための一時的な解決策です。将来的には、この機能はメインの Vite リポジトリーにマージされる予定です。

`rolldown-vite` を試して、フィードバックや問題報告を通じてその開発に貢献することをお勧めします。

将来的には、プロダクションモードだけでなく開発モードでもバンドルされたファイルを提供する「フルバンドルモード」も導入する予定です。

### なぜフルバンドルモードを導入するのか？

Vite は、バンドルしない開発サーバーアプローチを採用しており、これは Vite が最初に導入されたときから高速性と人気の主な理由でした。このアプローチは、従来のバンドル方式を採用せずに開発サーバーのパフォーマンスをどこまで向上できるかを試す実験でした。

しかし、プロジェクトの規模と複雑さが増すにつれ、2 つの主な課題が浮上してきました:

1. **開発/本番環境の不整合**: 開発時にはバンドルされていない JavaScript を提供し、本番環境ではバンドルされたファイルを提供するという違いは、異なるランタイムの挙動を生み出します。これにより本番環境でのみ発生する問題のデバッグが困難になります。

2. **開発時のパフォーマンス低下**: バンドルしないアプローチでは各モジュールが個別にフェッチされるため、大量のネットワークリクエストが発生します。これは本番環境では影響がありませんが、開発サーバーの起動時やページのリフレッシュ時に大きなオーバーヘッドを引き起こします。この影響は、数百から数千のリクエストを処理する必要がある大規模なアプリケーションで特に顕著です。これらのボトルネックは、開発者がネットワークプロキシを使用する場合にさらに深刻になり、リフレッシュ時間が遅くなり開発者体験が低下します。

Rolldown の統合により、Vite の特徴的なパフォーマンスを維持しながら、開発と本番の体験を統一する機会が生まれます。フルバンドルモードでは、開発時にもバンドルされたファイルを提供することで、以下のような利点が得られます:

- 大規模なアプリケーションでも高速な起動時間
- 開発環境と本番環境での一貫した挙動
- ページリフレッシュ時のネットワークオーバーヘッドの削減
- ESM 出力によるの効率的な HMR の維持

フルバンドルモードが導入された際は、まずはオプトイン機能として提供されます。Rolldown の統合と同様に、フィードバックを集めて安定性を確認した後、デフォルトにすることを目指しています。

## プラグイン / フレームワーク作者向けガイド

::: tip
このセクションは主にプラグインやフレームワークの作者向けです。ユーザーの方はこのセクションをスキップしてください。
:::

### 主な変更点の概要

- ビルドに Rolldown が使用されます（以前は Rollup が使用されていました）
- オプティマイザーに Rolldown が使用されます（以前は esbuild が使用されていました）
- CommonJS のサポートは Rolldown によって処理されます（以前は @rollup/plugin-commonjs が使用されていました）
- 構文の低レベル変換に Oxc が使用されます（以前は esbuild が使用されていました）
- CSS の圧縮にはデフォルトで Lightning CSS が使用されます（以前は esbuild が使用されていました）
- JS の圧縮にはデフォルトで Oxc minifier が使用されます（以前は esbuild が使用されていました）
- 設定のバンドルに Rolldown が使用されます（以前は esbuild が使用されていました）

### `rolldown-vite` の検出方法 {#detecting-rolldown-vite}

::: warning
ほとんどの場合、プラグインが `rolldown-vite` で実行されるか `vite` で実行されるかを検出する必要はなく、条件分岐なしで両方で一貫した動作を目指す必要があります。
:::

`rolldown-vite` で異なる動作が必要な場合は、`rolldown-vite` が使用されているかどうかを検出する方法が 2 つあります:

`this.meta.rolldownVersion` の存在を確認する:

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

<br>

`rolldownversion` エクスポートの存在を確認する:

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

[上記で述べたように](#option-validation-errors)、Rolldown は不明または無効なオプションが渡されるとエラーをスローします。

これは[上記のように](#detecting-rolldown-vite)、`rolldown-vite` で実行されているかどうかを確認することでオプションを条件的に渡すことで修正できます。

この場合、`ROLLDOWN_OPTIONS_VALIDATION=loose` 環境変数を設定してエラーを抑制することもできます。
ただし、**最終的には Rolldown でサポートされていないオプションを渡さないようにする必要がある** ことに注意してください。

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

### フックフィルター機能 {#hook-filter-feature}

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
