# ビルド時の共有プラグイン

::: tip フィードバック
[Environment API feedback discussion](https://github.com/vitejs/vite/discussions/16358)でフィードバックをお寄せください。
:::

[ビルド時の共有プラグイン](/guide/api-environment-plugins.md#shared-plugins-during-build)を参照してください。

影響範囲: `Vite プラグイン作成者`

::: warning 将来のデフォルト変更
`builder.sharedConfigBuild` は `v6.0` で初めて導入されました。これを true に設定することで、プラグインが共有コンフィグでどのように動作するかをチェックできます。プラグインエコシステムの準備が整ったら、将来のメジャーバージョンでデフォルトを変更するためのフィードバックを求めています。
:::

## 動機

開発とビルドのプラグインパイプラインを調整します。

## 移行ガイド

環境をまたいでプラグインを共有できるようにするには、プラグインの状態を現在の環境でキー付けする必要があります。以下の形式のプラグインは、すべての環境における変換されたモジュールの数を数えます。

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

代わりに、各環境で変換されたモジュールの数を数えたい場合は、マップを保持する必要があります。

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

このパターンを簡素化するために、Vite は `perEnvironmentState` ヘルパーをエクスポートしています:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
