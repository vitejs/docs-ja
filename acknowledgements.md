---
title: Acknowledgements
description: Vite は偉大なプロジェクトの上に成り立っています。Vite を実現してくれたすべてのプロジェクトとコントリビューターに感謝します。
---

<script setup>
import { computed } from 'vue'
// import { data } from './_data/acknowledgements.data' // 日本語リポジトリには packages/vite がないのでエラーになる。
import { useSponsor, voidZero } from './.vitepress/theme/composables/sponsor'
import VPSponsors from '@components/vitepress-default/VPSponsors.vue'

const { data: sponsorData } = useSponsor()

const allSponsors = computed(() => {
  if (!sponsorData.value) return []
  return [
    {
      tier: 'Brought to you by',
      size: 'big',
      items: [voidZero],
    },
    ...sponsorData.value,
  ]
})

function npmUrl(name) {
  return `https://www.npmjs.com/package/${name}`
}
</script>

# 謝辞

Vite は偉大なプロジェクトの上に成り立っています。Vite を実現してくれたすべてのプロジェクト、コントリビューター、スポンサーに感謝します。

## コントリビューター

Vite は国際的なコントリビューターのチームによって開発されています。コアチームのメンバーについては[チームページ](/team)をご覧ください。

また、コードの貢献、バグレポート、ドキュメント、ドキュメント翻訳を通じて Vite の改善に協力してくれた [GitHub 上のすべてのコントリビューター](https://github.com/vitejs/vite/graphs/contributors)にも感謝します。

## スポンサー

Vite の開発は寛大なスポンサーによって支えられています。[GitHub Sponsors](https://github.com/sponsors/vitejs) または [Open Collective](https://opencollective.com/vite) を通じて Vite を支援できます。

<div class="sponsors-container">
  <VPSponsors :data="allSponsors" />
</div>

<!--
## 依存関係

Vite はこれらの素晴らしいオープンソースプロジェクトに依存しています:

### 主要な依存関係

<div class="deps-list notable">
  <div v-for="dep in data.notableDependencies" :key="dep.name" class="dep-item">
    <div class="dep-header">
      <a :href="npmUrl(dep.name)" target="_blank" rel="noopener"><code>{{ dep.name }}</code></a>
      <span class="dep-links">
        <a v-if="dep.repository" :href="dep.repository" target="_blank" rel="noopener" class="dep-link">Repo</a>
        <a v-if="dep.funding" :href="dep.funding" target="_blank" rel="noopener" class="dep-link sponsor">Sponsor</a>
      </span>
    </div>
    <p v-if="dep.author" class="dep-author">
      by <a v-if="dep.authorUrl" :href="dep.authorUrl" target="_blank" rel="noopener">{{ dep.author }}</a><template v-else>{{ dep.author }}</template>
    </p>
    <p v-if="dep.description">{{ dep.description }}</p>
  </div>
</div>

### バンドルされた依存関係の作者

<table class="authors-table">
  <thead>
    <tr>
      <th>作者</th>
      <th>パッケージ</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="author in data.authors" :key="author.name">
      <td>
        <a v-if="author.url" :href="author.url" target="_blank" rel="noopener">{{ author.name }}</a>
        <template v-else>{{ author.name }}</template>
        <a v-if="author.funding" :href="author.funding" target="_blank" rel="noopener" class="sponsor-link">Sponsor</a>
      </td>
      <td>
        <template v-for="(pkg, index) in author.packages" :key="pkg.name">
          <span class="pkg-item"><a :href="npmUrl(pkg.name)" target="_blank" rel="noopener"><code>{{ pkg.name }}</code></a><a v-if="pkg.funding" :href="pkg.funding" target="_blank" rel="noopener" class="sponsor-link">Sponsor</a></span><template v-if="index < author.packages.length - 1">, </template>
        </template>
      </td>
    </tr>
  </tbody>
</table>

::: tip パッケージ作者の方へ
このセクションは各パッケージの `package.json` の `author` フィールドと `funding` フィールドから自動的に生成されています。パッケージの表示を更新したい場合は、パッケージのこれらのフィールドを更新してください。
:::

## 開発ツール

Vite の開発ワークフローはこれらのツールによって支えられています:

<div class="deps-list notable">
  <div v-for="dep in data.devTools" :key="dep.name" class="dep-item">
    <div class="dep-header">
      <a :href="npmUrl(dep.name)" target="_blank" rel="noopener"><code>{{ dep.name }}</code></a>
      <span class="dep-links">
        <a v-if="dep.repository" :href="dep.repository" target="_blank" rel="noopener" class="dep-link">Repo</a>
        <a v-if="dep.funding" :href="dep.funding" target="_blank" rel="noopener" class="dep-link sponsor">Sponsor</a>
      </span>
    </div>
    <p v-if="dep.author" class="dep-author">
      by <a v-if="dep.authorUrl" :href="dep.authorUrl" target="_blank" rel="noopener">{{ dep.author }}</a><template v-else>{{ dep.author }}</template>
    </p>
    <p v-if="dep.description">{{ dep.description }}</p>
  </div>
</div>

## 過去の主要な依存関係

以前のバージョンの Vite で使用されていたこれらのプロジェクトのメンテナーにも感謝します:

<table>
  <thead>
    <tr>
      <th>パッケージ</th>
      <th>説明</th>
      <th>リンク</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="dep in data.pastNotableDependencies" :key="dep.name">
      <td><a :href="npmUrl(dep.name)" target="_blank" rel="noopener"><code>{{ dep.name }}</code></a></td>
      <td>{{ dep.description }}</td>
      <td><a :href="dep.repository" target="_blank" rel="noopener">Repo</a></td>
    </tr>
  </tbody>
</table>
-->

<style scoped>
.deps-list {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}

.deps-list.notable {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.dep-item {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.dep-item .dep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.dep-item a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.dep-item a:hover {
  text-decoration: underline;
}

.dep-item .dep-links {
  display: flex;
  gap: 0.5rem;
}

.dep-item .dep-link {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
}

.dep-item .dep-author {
  margin: 0.25rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.dep-item .dep-link.sponsor {
  background: var(--vp-c-brand-soft);
}

.dep-item p {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.authors-table .sponsor-link {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.authors-table .sponsor-link:hover {
  text-decoration: underline;
}
</style>
