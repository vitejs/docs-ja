import { defineConfig, DefaultTheme } from 'vitepress'

const ogDescription = '次世代フロントエンドツール'
const ogImage = 'https://vitejs.dev/og-image.png'
const ogTitle = 'Vite'
const ogUrl = 'https://vitejs.dev'

// netlify envs
const deployURL = process.env.DEPLOY_PRIME_URL || ''
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    // case 'https://main--vite-docs-main.netlify.app':
    //   return 'main'
    case '':
      return 'local'
    default:
      return 'release'
  }
})()
const additionalTitle = ((): string => {
  switch (deployType) {
    // case 'main':
    //   return ' (main branch)'
    case 'local':
      return ' (local)'
    case 'release':
      return ''
  }
})()
const versionLinks = ((): DefaultTheme.NavItemWithLink[] => {
  switch (deployType) {
    // case 'main':
    case 'local':
      return [
        {
          text: 'Vite 4 Docs (release)',
          link: 'https://vitejs.dev',
        },
        {
          text: 'Vite 3 Docs',
          link: 'https://v3.vitejs.dev',
        },
        {
          text: 'Vite 2 Docs',
          link: 'https://v2.vitejs.dev',
        },
      ]
    case 'release':
      return [
        {
          text: 'Vite 3 Docs',
          link: 'https://v3.vitejs.dev',
        },
        {
          text: 'Vite 2 Docs',
          link: 'https://v2.vitejs.dev',
        },
      ]
  }
})()

export default defineConfig({
  title: `Vite${additionalTitle}`,
  description: '次世代フロントエンドツール',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'CBDFBSLI',
        'data-spa': 'auto',
        defer: '',
      },
    ],
  ],

  locales: {
    root: { label: '日本語' },
    en: { label: 'English', link: 'https://vitejs.dev' },
    zh: { label: '简体中文', link: 'https://cn.vitejs.dev' },
    es: { label: 'Español', link: 'https://es.vitejs.dev' },
  },

  vue: {
    reactivityTransform: true,
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/vitejs/docs-ja/edit/main/:path',
      text: 'このページへの変更を提案する',
    },

    socialLinks: [
      { icon: 'twitter', link: 'https://twitter.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vitejs.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' },
    ],

    algolia: {
      appId: '7H67QR5P0A',
      apiKey: 'deaab78bcdfe96b599497d25acc6460e',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en'],
      },
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev',
    },

    footer: {
      message: `Released under the MIT License. (${commitRef})`,
      copyright: 'Copyright © 2019-present Evan You & Vite Contributors',
    },

    nav: [
      { text: 'ガイド', link: '/guide/', activeMatch: '/guide/' },
      { text: '設定', link: '/config/', activeMatch: '/config/' },
      { text: 'プラグイン', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'リソース',
        items: [
          { text: 'チーム', link: '/team' },
          {
            items: [
              {
                text: 'Twitter',
                link: 'https://twitter.com/vite_js',
              },
              {
                text: 'Discord Chat',
                link: 'https://chat.vitejs.dev',
              },
              {
                text: 'Awesome Vite',
                link: 'https://github.com/vitejs/awesome-vite',
              },
              {
                text: 'DEV Community',
                link: 'https://dev.to/t/vite',
              },
              {
                text: 'Rollup Plugins Compat',
                link: 'https://vite-rollup-plugins.patak.dev/',
              },
              {
                text: 'Changelog',
                link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
              },
            ],
          },
        ],
      },
      {
        text: 'Version',
        items: versionLinks,
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'ガイド',
          items: [
            {
              text: 'なぜ Vite なのか',
              link: '/guide/why',
            },
            {
              text: 'はじめに',
              link: '/guide/',
            },
            {
              text: '特徴',
              link: '/guide/features',
            },
            {
              text: 'CLI',
              link: '/guide/cli',
            },
            {
              text: 'プラグインの使用',
              link: '/guide/using-plugins',
            },
            {
              text: '依存関係の事前バンドル',
              link: '/guide/dep-pre-bundling',
            },
            {
              text: '静的アセットの取り扱い',
              link: '/guide/assets',
            },
            {
              text: '本番環境用のビルド',
              link: '/guide/build',
            },
            {
              text: '静的サイトのデプロイ',
              link: '/guide/static-deploy',
            },
            {
              text: '環境変数とモード',
              link: '/guide/env-and-mode',
            },
            {
              text: 'サーバサイドレンダリング',
              link: '/guide/ssr',
            },
            {
              text: 'バックエンドとの統合',
              link: '/guide/backend-integration',
            },
            {
              text: '他のツールとの比較',
              link: '/guide/comparisons',
            },
            {
              text: 'トラブルシューティング',
              link: '/guide/troubleshooting',
            },
            {
              text: 'v3 からの移行',
              link: '/guide/migration',
            },
          ],
        },
        {
          text: 'API',
          items: [
            {
              text: 'プラグイン API',
              link: '/guide/api-plugin',
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr',
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript',
            },
            {
              text: '設定リファレンス',
              link: '/config/',
            },
          ],
        },
      ],
      '/config/': [
        {
          text: '設定',
          items: [
            {
              text: 'Vite の設定',
              link: '/config/',
            },
            {
              text: '共通オプション',
              link: '/config/shared-options',
            },
            {
              text: 'サーバオプション',
              link: '/config/server-options',
            },
            {
              text: 'ビルドオプション',
              link: '/config/build-options',
            },
            {
              text: 'プレビューのオプション',
              link: '/config/preview-options',
            },
            {
              text: '依存関係の最適化オプション',
              link: '/config/dep-optimization-options',
            },
            {
              text: 'SSR オプション',
              link: '/config/ssr-options',
            },
            {
              text: 'ワーカのオプション',
              link: '/config/worker-options',
            },
          ],
        },
      ],
    },
  },
})
