import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vite',
  description: '次世代フロントエンドツール',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],

    // TODO: This is neeeded to get smooth dark mode appearance on initial
    // load. And this will be gone when VitePress figures out how to handle
    // this in core.
    [
      'script',
      {},
      `
        ;(() => {
          const saved = localStorage.getItem('vitepress-theme-appearance')
          const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches

          if (!saved || saved === 'auto' ? prefereDark : saved === 'dark') {
            document.documentElement.classList.add('dark')
          }
        })()
      `
    ]
  ],

  vue: {
    reactivityTransform: true
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      repo: 'vitejs/docs-ja',
      branch: 'main',
      dir: 'docs',
      text: 'このページへの変更を提案する'
    },

    algolia: {
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    },

    carbonAds: {
      carbon: 'CEBIEK3N',
      placement: 'vitejsdev'
    },

    localeLinks: {
      text: 'English',
      items: [
        { text: '简体中文', link: 'https://cn.vitejs.dev' },
        { text: '日本語', link: 'https://ja.vitejs.dev' }
      ]
    },

    nav: [
      { text: 'ガイド', link: '/guide/' },
      { text: '設定', link: '/config/' },
      { text: 'プラグイン', link: '/plugins/' },
      {
        text: 'リンク',
        items: [
          {
            text: 'Twitter',
            link: 'https://twitter.com/vite_js'
          },
          {
            text: 'Discord Chat',
            link: 'https://chat.vitejs.dev'
          },
          {
            text: 'Awesome Vite',
            link: 'https://github.com/vitejs/awesome-vite'
          },
          {
            text: 'DEV Community',
            link: 'https://dev.to/t/vite'
          },
          {
            text: 'Rollup Plugins Compat',
            link: 'https://vite-rollup-plugins.patak.dev/'
          },
          {
            text: 'Changelog',
            link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md'
          }
        ]
      },
      {
        text: 'v3 (next)',
        items: [
          {
            text: 'v2.x (stable)',
            link: 'https://v2.vitejs.dev'
          }
        ]
      },
    ],

    sidebar: {
      '/': [
        {
          text: 'ガイド',
          items: [
            {
              text: 'なぜ Vite なのか',
              link: '/guide/why'
            },
            {
              text: 'はじめに',
              link: '/guide/'
            },
            {
              text: '特徴',
              link: '/guide/features'
            },
            {
              text: 'プラグインの使用',
              link: '/guide/using-plugins'
            },
            {
              text: '依存関係の事前バンドル',
              link: '/guide/dep-pre-bundling'
            },
            {
              text: '静的アセットの取り扱い',
              link: '/guide/assets'
            },
            {
              text: '本番環境用のビルド',
              link: '/guide/build'
            },
            {
              text: '静的サイトのデプロイ',
              link: '/guide/static-deploy'
            },
            {
              text: '環境変数とモード',
              link: '/guide/env-and-mode'
            },
            {
              text: 'サーバサイドレンダリング',
              link: '/guide/ssr'
            },
            {
              text: 'バックエンドとの統合',
              link: '/guide/backend-integration'
            },
            {
              text: '他のツールとの比較',
              link: '/guide/comparisons'
            },
            {
              text: 'v1 からの移行',
              link: '/guide/migration'
            }
          ]
        },
        {
          text: 'API',
          items: [
            {
              text: 'プラグイン API',
              link: '/guide/api-plugin'
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr'
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript'
            },
            {
              text: '設定リファレンス',
              link: '/config/'
            }
          ]
        }
      ]
    }
  }
})
