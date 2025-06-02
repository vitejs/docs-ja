# Environment API

:::warning 実験的機能
Environment API は実験的なものです。エコシステムでの実験と開発を可能にするため、メジャーリリース間の API の安定性は維持されます。ダウンストリームプロジェクトが新機能を実験して検証した後、将来のメジャーリリースでこれらの新しい API を安定化する予定です（破壊的変更を含む可能性あり）。

リソース:

- 新しい API に関するフィードバックを収集する [Feedback discussion](https://github.com/vitejs/vite/discussions/16358)
- 新しい API が実装され、レビューされる [Environment API PR](https://github.com/vitejs/vite/pull/16471)

ぜひフィードバックをお寄せください。
:::

## 環境の形式化 {#formalizing-environments}

Vite 6 では、環境の概念が正式化されました。Vite 5 までは、暗黙的な環境が 2 つ（`client` と省略可能な `ssr`）が存在していました。新しい Environment API を使用すると、ユーザーは必要な数の環境を作成して、アプリが本番環境でどのように動作するかをマッピングできます。この新しい機能には大規模な内部リファクタリングが必要でしたが、後方互換性にも多大な努力が払われました。Vite 6 の当初の目標は、エコシステムをできるだけスムーズに新しいメジャーに移行することであり、十分な数のユーザーが移行し、フレームワークとプラグインの作成者が新しい設計を検証するまで、これらの新しい実験的な API の採用を遅らせます。

## ビルドと開発中のギャップを埋める {#closing-the-gap-between-build-and-dev}

シンプルな SPA/MPA の場合、環境に関する新しい API は config に公開されません。内部的には、Vite はオプションを `client` 環境に適用しますが、Vite の設定時にこの概念を知っておく必要はありません。Vite 5 の設定と動作は、ここでもシームレスに機能するはずです。

典型的なサーバーサイドレンダリング（SSR）アプリに移行すると、2 つの環境が存在することになります:

- `client`: ブラウザー内でアプリを実行します。
- `ssr`: Node（または他のサーバーランタイム）内でアプリを実行し、ブラウザーに送信する前にページをレンダリングします。

開発環境では、Vite は Vite 開発サーバーと同じ Node プロセスでサーバーコードを実行し、プロダクション環境に近い環境を実現します。しかし、サーバーを他の JS ランタイムで実行することも可能であり、例えば [Cloudflare の workerd](https://github.com/cloudflare/workerd) など、制約が異なるものもあります。最近のアプリケーションは、ブラウザー、Node サーバー、Edge サーバーなど、2 つ以上の環境で実行されることもあります。 Vite 5 では、これらの環境を適切に表現できませんでした。

Vite 6 では、ビルドと開発中にアプリの設定を行ない、すべての環境をマッピングできます。開発中は単一の Vite 開発サーバーを使用して、複数の異なる環境で同時にコードを実行できるようになりました。アプリのソースコードは、引き続き Vite 開発サーバーによって変換されます。共有 HTTP サーバー、ミドルウェア、解決された設定、プラグインパイプラインに加えて、Vite 開発サーバーには独立した開発環境のセットが用意されています。各環境は、プロダクションにできるだけ近い形で構成され、コードが実行される開発ランタイムに接続されています（workerd の場合、サーバーコードはローカルで miniflare で実行できるようになりました）。クライアントでは、ブラウザーがコードをインポートして実行します。他の環境では、モジュールランナーが変換されたコードを取得して評価します。

![Vite Environments](../images/vite-environments.svg)

## 環境設定 {#environments-configuration}

SPA/MPA の場合、構成は Vite 5 と似たものになります。内部では、これらのオプションは `client` 環境の構成に使用されます。

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

これは、Vite を使いやすい状態に保ち、必要になるまで新しい概念を公開しないようにしたいため重要です。

アプリが複数の環境で構成されている場合、これらの環境は、`environments` 設定オプションで明示的に設定することができます。

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

明示的にドキュメント化されていない場合、環境は設定されたトップレベルのコンフィグオプションを継承します（例えば、新しい `server` および `edge` 環境は `build.sourcemap: false` オプションを継承します）。`optimizeDeps` などの少数のトップレベルオプションは、サーバー環境にデフォルトで適用するとうまく動作しないため、`client` 環境のみに適用されます。 `client` 環境は `environments.client` を通して明示的に設定することもできますが、新しい環境を追加した際にクライアントの設定が変更されないように、トップレベルオプションを使用することをお勧めします。

`EnvironmentOptions` インターフェースは環境ごとのオプションをすべて公開します。`resolve` のように、`build` と `dev` の両方に適用される環境オプションもあります。また、`dev` と `build` に固有のオプション（`dev.warmup` や `build.outDir` など）には、`DevEnvironmentOptions` と `BuildEnvironmentOptions` があります。`optimizeDeps` のように、`dev` にのみ適用されるオプションもありますが、後方互換性を保つため、`dev` のネストではなくトップレベルとして維持されています。

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

`UserConfig` インターフェースは `EnvironmentOptions` インターフェースを継承しており、`environments` オプションで設定されたクライアントと他の環境のデフォルトを設定することができます。`client` 環境と `ssr` という名前のサーバー環境は、開発時には常に存在します。これにより、`server.ssrLoadModule(url)` および `server.moduleGraph` との後方互換性が確保されます。ビルド時には、`client` 環境は常に存在し、`ssr` 環境は明示的に設定（`environments.ssr` または後方互換性のために `build.ssr` を使用）されている場合のみ存在します。アプリは SSR 環境に `ssr` という名前を使用する必要はなく、例えば `server` と名付けることもできます。

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // その他のオプション
}
```

Environment API が安定したら、トップレベルプロパティ `ssr` が廃止予定になることに注意してください。このオプションは `environments` と同じ役割を持ちますが、デフォルトの `ssr` 環境に対してのみ、限られたオプションの設定のみが可能です。

## カスタム環境インスタンス {#custom-environment-instances}

低レベルの設定 API が利用できるので、ランタイムプロバイダーはそれぞれのランタイムに適切なデフォルト設定の環境を提供することができます。これらの環境では、プロダクション環境に近いランタイムで開発中にモジュールを実行するために、他のプロセスやスレッドを生成することもできます。

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
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
