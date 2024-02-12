# 依存関係の最適化オプション

- **関連:** [依存関係の事前バンドル](/guide/dep-pre-bundling)

## optimizeDeps.entries

- **型:** `string | string[]`

デフォルトでは、Vite はすべての `.html` ファイルをクロールして、事前にバンドルする必要のある依存関係を検出します（`node_modules`, `build.outDir`, `__tests__` および `coverage` は無視します）。`build.rollupOptions.input` が指定されている場合、Vite は代わりにそれらのエントリーポイントをクロールします。

これらのいずれもニーズに合わない場合、このオプションを使ってカスタムエントリーを指定することができます。値は Vite プロジェクトルートからの相対的な [fast-glob パターン](https://github.com/mrmlnc/fast-glob#basic-syntax) か、パターンの配列でなければいけません。これによりデフォルトのエントリーの推論が上書きされます。`optimizeDeps.entries` が明示的に定義されている場合、デフォルトでは `node_modules` と `build.outDir` フォルダーのみが無視されます。他のフォルダーを無視したい場合は、最初の `!` でマークした無視パターンをエントリーリストの一部として使用できます。

## optimizeDeps.exclude

- **型:** `string[]`

事前バンドルから除外する依存関係。

:::warning CommonJS
CommonJS の依存関係を最適化から除外してはいけません。ESM の依存関係が最適化から除外されているが、ネストされた CommonJS の依存関係がある場合は、CommonJS の依存関係を `optimizeDeps.include` に追加する必要があります。例:

```js
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **型:** `string[]`

デフォルトでは、リンクされたパッケージのうち `node_modules` の外にあるものは事前バンドルされません。このオプションを使用してリンクされたパッケージを強制的に事前バンドルします。

**実験的機能:** 多くのディープインポートを持つライブラリーを使用している場合、末尾に glob パターンを指定して、すべてのディープインポートを一度に事前バンドルすることもできます。これにより、新たにディープインポートが使用されるたびに常に事前バンドルされることを避けることができます。例:

```js
export default defineConfig({
  optimizeDeps: {
    include: ["my-lib/components/**/*.vue"],
  },
});
```

## optimizeDeps.esbuildOptions
<!-- textlint-disable -->
- **型:** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)`<`[`EsbuildBuildOptions`](https://esbuild.github.io/api/#simple-options)`,
| 'bundle'
| 'entryPoints'
| 'external'
| 'write'
| 'watch'
| 'outdir'
| 'outfile'
| 'outbase'
| 'outExtension'
| 'metafile'>`
<!-- textlint-enable -->
依存関係のスキャンと最適化の際、 esbuild に渡すオプション。

いくつかのオプションは、変更すると Vite の依存関係の最適化と互換性がなくなるため、省略されています。

- `external` も省略されています。Vite の `optimizeDeps.exclude` オプションを使用してください
- `plugins` は Vite の依存関係プラグインとマージされます

## optimizeDeps.force

- **型:** `boolean`

`true` に設定すると、前にキャッシュされた最適化された依存関係を無視して、依存関係の事前バンドルをするよう強制します。

## optimizeDeps.disabled

- **実験的機能:** [フィードバックをしてください](https://github.com/vitejs/vite/discussions/13839)
- **型:** `boolean | 'build' | 'dev'`
- **デフォルト:** `'build'`

依存関係の最適化を無効にします。`true` はビルド時とデバッグ時にオプティマイザーを無効にします。`'build'` または `'dev'` を渡すと、どちらか一方のモードでのみオプティマイザーを無効にできます。依存関係の最適化は、デフォルトでは開発時にのみ有効です。

:::warning
ビルドモードでの依存関係の最適化は**実験的**なものです。有効にすると、開発環境と本番環境の間の最も大きな違いの 1 つを取り除くことができます。esbuild は CJS だけの依存関係を ESM に変換するので、[`@rollup/plugin-commonjs`](https://github.com/rollup/plugins/tree/master/packages/commonjs) はこの場合もう必要ないでしょう。

このビルド戦略を試したい場合は、`optimizeDeps.disabled: false` を使用します。`@rollup/plugin-commonjs` は `build.commonjsOptions: { include: [] }` を渡すことで削除できます。
:::

## optimizeDeps.needsInterop

- **実験的機能**
- **型:** `string[]`

依存関係をインポートする際に、ESM の相互作用を強制します。Vite は依存関係が相互作用を必要とする場合に適切に検出することができるため、このオプションは一般的には必要ありません。しかし、依存関係の組み合わせが異なると、いくつかのパッケージが異なる形で事前にバンドルされる可能性があります。これらのパッケージを `needsInterop` に追加すると、全ページの再読み込みを回避してコールドスタートを高速化することができます。依存関係のあるパッケージがそうである場合、警告が表示され、パッケージ名を設定内のこの配列に追加するよう提案されます。
