---
home: true
heroImage: /logo.svg
actionText: Viteを始める
actionLink: /guide/

altActionText: もっと詳しく
altActionLink: /guide/why

features:
  - title: 💡 瞬時にスタートするサーバー
    details: ネイティブESMを通してリアルタイムなファイルが提供されるためバンドルをする必要はありません。
  - title: ⚡️ 超高速なHMR
    details: アプリのサイズに関係なく高速を維持するHMRを提供します。
  - title: 🛠️ 豊富な機能
    details: TypeScript、JSX、CSSなどがすぐに使えるようにサポートされています。
  - title: 📦 最適化されたビルド
    details: 先読みされるロールアップビルドによってマルチページおよびライブラリモードをサポートします。
  - title: 🔩 ユニバーサルなプラグイン
    details: 開発とビルドの間で共有されるRollupと互換性のあるプラグインを提供します。
  - title: 🔑 完全に型定義がされているAPI
    details: 完全なTypeScriptの型定義を備えた柔軟なプログラミング志向のAPIです。
footer: MIT Licensed | Copyright © 2019-present Evan You & Vite Contributors
---

<div class="frontpage sponsors">
  <h2>スポンサー</h2>
  <a v-for="{ href, src, name } of sponsors" :href="href" target="_blank" rel="noopener" aria-label="sponsor-img">
    <img :src="src" :alt="name">
  </a>
  <br>
  <a href="https://github.com/sponsors/yyx990803" target="_blank" rel="noopener">GitHubでスポンサーになる</a>
</div>

<script setup>
import sponsors from './.vitepress/theme/sponsors.json'
</script>
