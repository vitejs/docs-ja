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
