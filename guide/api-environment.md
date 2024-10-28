# Environment API

:::warning 実験的機能
この API の初期研究は、Vite 5.1 で「Vite ランタイム API」という名前で導入されました。このガイドでは、Environment API と改名された改訂版 API について説明します。この API は Vite 6 で実験的機能としてリリースされる予定です。すでに最新の `vite@6.0.0-beta.x` バージョンでテストできます。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

この提案をテストする際には、ぜひフィードバックをお寄せください。
:::

## 環境の形式化 {#formalizing-environments}

Vite 6 では、環境の概念が正式化されました。Vite 5 までは、暗黙的な環境が 2 つ（`client` と `ssr`）が存在していました。新しい Environment API を使用すると、ユーザーは必要な数の環境を作成して、アプリが本番環境でどのように動作するかをマッピングできます。この新しい機能には大規模な内部リファクタリングが必要でしたが、後方互換性にも多大な努力が払われました。Vite 6 の当初の目標は、エコシステムをできるだけスムーズに新しいメジャーに移行することであり、十分な数のユーザーが移行し、フレームワークとプラグインの作成者が新しい設計を検証するまで、これらの新しい実験的な API の採用を遅らせます。

## ビルドと開発中のギャップを埋める {#closing-the-gap-between-build-and-dev}

シンプルな SPA の場合、環境は 1 つだけです。アプリはユーザーのブラウザーで実行されます。開発中は、Vite が最新のブラウザーを必要とする場合を除き、環境はプロダクションのランタイムとほぼ一致します。Vite 6 では、ユーザーが環境について知らなくても Vite を使用できます。この場合、通常の vite 構成はデフォルトのクライアント環境で機能します。

典型的なサーバーサイドレンダリングの Vite アプリには、2 つの環境があります。クライアント環境はブラウザーでアプリを実行し、Node 環境では SSR を行なうサーバーを実行します。Vite を開発モードで実行すると、サーバーのコードは Vite 開発サーバーと同じ Node プロセスで実行され、プロダクション環境に近い状態になります。ただし、アプリは [Cloudflare の workerd](https://github.com/cloudflare/workerd) のような他の JS ランタイムでサーバーを実行することもできます。また、最新のアプリでは 2 つ以上の環境を持つことも一般的です（たとえば、アプリはブラウザー、Node サーバー、エッジサーバーで実行される可能性があります）。Vite 5 では、これらのケースを適切に表現できませんでした。

Vite 6 では、ビルドと開発中にアプリの設定を行ない、すべての環境をマッピングできます。開発中は単一の Vite 開発サーバーを使用して、複数の異なる環境で同時にコードを実行できるようになりました。アプリのソースコードは、引き続き Vite 開発サーバーによって変換されます。共有 HTTP サーバー、ミドルウェア、解決された設定、プラグインパイプラインに加えて、Vite サーバーには独立した開発環境のセットが用意されています。各環境は、プロダクションにできるだけ近い形で構成され、コードが実行される開発ランタイムに接続されています（workerd の場合、サーバーコードはローカルで miniflare で実行できるようになりました）。クライアントでは、ブラウザーがコードをインポートして実行します。他の環境では、モジュールランナーが変換されたコードを取得して評価します。

![Vite Environments](../images/vite-environments.svg)

## 環境設定 {#environment-configuration}

環境は `environments` 設定オプションで明示的に設定します。

```js
export default {
  environments: {
    client: {
      resolve: {
        conditions: [], // クライアント環境を設定する
      },
    },
    ssr: {
      optimizeDeps: {}, // SSR 環境を設定する
    },
    rsc: {
      resolve: {
        noExternal: true, // カスタム環境を設定する
      },
    },
  },
}
```

すべての環境設定はユーザーのルート設定から拡張され、ユーザーはルートレベルですべての環境のデフォルトを追加できます。これは、Vite クライアントのみのアプリを設定するような一般的なユースケースで、`environments.client` を経由せずに設定できるため、非常に便利です。

```js
export default {
  resolve: {
    conditions: [], // すべての環境のデフォルトを設定する
  },
}
```

`EnvironmentOptions` インターフェースは環境ごとのオプションをすべて公開します。`resolve` のように、`build` と `dev` の両方に適用される `SharedEnvironmentOptions` があります。また、開発環境やビルド環境固有のオプション（`optimizeDeps` や `build.outDir` など）については、`DevEnvironmentOptions` と `BuildEnvironmentOptions` があります。

```ts
interface EnvironmentOptions extends SharedEnvironmentOptions {
  dev: DevOptions
  build: BuildOptions
}
```

説明したように、ユーザー設定のルートレベルで定義された環境固有のオプションは、デフォルトのクライアント環境に使用されます（`UserConfig` インターフェースは `EnvironmentOptions` インターフェースを継承しています）。また、環境は `environments` レコードを使用して明示的に設定できます。たとえ `environments` に空のオブジェクトが設定されていたとしても、開発中は `client` と `ssr` の環境は常に存在します。これは `server.ssrLoadModule(url)` と `server.moduleGraph` との後方互換性を保つためです。ビルド時には `client` 環境が常に存在し、`ssr` 環境は明示的に設定された場合（`environments.ssr` または後方互換性のために `build.ssr` を使用します）のみ存在します。

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // その他のオプション
}
```

::: info

トップレベルプロパティの `ssr` には `EnvironmentOptions` と共通する多くのオプションがあります。このオプションは `environments` と同じユースケースのために作成されましたが、設定できるオプションは限られていました。環境設定を統一的に定義するために、このオプションは非推奨とします。

:::

## カスタム環境インスタンス {#custom-environment-instances}

低レベルの設定 API が利用できるので、ランタイムプロバイダーはそれぞれのランタイム用の環境を提供できます。

```js
import { createCustomEnvironment } from 'vite-environment-provider'

export default {
  environments: {
    client: {
      build: {
        outDir: '/dist/client',
      },
    }
    ssr: createCustomEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## 後方互換性 {#backward-compatibility}

現在の Vite サーバーAPI はまだ非推奨ではなく、Vite 5 との後方互換性があります。新しい Environment API は実験的なものです。

`server.moduleGraph` はクライアントと ssr のモジュールグラフの混合ビューを返します。後方互換性のある混合モジュールノードがすべてのメソッドから返されます。同じスキームが `handleHotUpdate` に渡されるモジュールノードにも使用されます。

現時点では、Environment API への切り替えはまだお勧めしません。私たちは、プラグインが 2 つのバージョンを維持する必要がないように、ユーザーベースのかなりの部分が Vite 6 を採用することを目標としています。今後の廃止予定とアップグレードパスについては、今後の変更点をチェックしてください:

- [フック内の `this.environment`](/changes/this-environment-in-hooks)
- [HMR `hotUpdate` プラグインフック](/changes/hotupdate-hook)
- [環境ごとの API への移行](/changes/per-environment-apis)
- [`ModuleRunner` API を使った SSR](/changes/ssr-using-modulerunner)
- [ビルド時の共有プラグイン](/changes/shared-plugins-during-build)

## 対象ユーザー {#target-users}

このガイドでは、エンドユーザー向けの環境に関する基本的な概念を説明します。

プラグイン作者は、現在の環境構成とやり取りするために、より一貫性のある API を利用できます。Vite をベースに構築している場合は、[Environment API プラグインガイド](./api-environment-plugins.md)で、拡張プラグイン API を使用して複数のカスタム環境をサポートする方法について説明します。

フレームワークは、さまざまなレベルで環境を公開することを決定できます。フレームワーク作者の場合は、[Environment API フレームワークガイド](./api-environment-frameworks)を読み進め、Environment API のプログラム的な側面について学習してください。

ランタイムプロバイダーの場合、[Environment API ランタイムガイド](./api-environment-runtimes.md)で、フレームワークとユーザーが使用するカスタム環境を提供する方法について説明します。
