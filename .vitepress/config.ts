import { defineConfig } from 'vitepress'

const ogDescription = '次世代フロントエンドツール'
const ogImage = 'https://vitejs.dev/og-image.png'
const ogTitle = 'Vite'
const ogUrl = 'https://vitejs.dev'

export default defineConfig({
  title: 'Vite',
  description: '次世代フロントエンドツール',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }]
  ],

  vue: {
    reactivityTransform: true
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/vitejs/vite/edit/main/docs/:path',
      text: 'このページへの変更を提案する'
    },

    socialLinks: [
      { icon: 'twitter', link: 'https://twitter.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vitejs.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' }
    ],

    algolia: {
      appId: 'BH4D9OD16A',
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev'
    },

    localeLinks: {
      text: '日本語',
      items: [
        { text: 'English', link: 'https://vitejs.dev' },
        { text: '简体中文', link: 'https://cn.vitejs.dev' },
        { text: 'Español', link: 'https://es.vitejs.dev' }
      ]
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You & Vite Contributors'
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
          }
        ]
      },
      {
        text: 'Version',
        items: [
          {
            text: 'Vite 2 Docs',
            link: 'https://v2.vitejs.dev'
          }
        ]
      },
    ],

    sidebar: {
      '/guide/': [
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
              text: 'v2 からの移行',
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
      ],
      '/config/': [
        {
          text: '設定',
          items: [
            {
              text: 'Vite の設定',
              link: '/config/'
            },
            {
              text: '共通オプション',
              link: '/config/shared-options'
            },
            {
              text: 'サーバオプション',
              link: '/config/server-options'
            },
            {
              text: 'ビルドオプション',
              link: '/config/build-options'
            },
            {
              text: 'プレビューのオプション',
              link: '/config/preview-options'
            },
            {
              text: '依存関係の最適化オプション',
              link: '/config/dep-optimization-options'
            },
            {
              text: 'SSR オプション',
              link: '/config/ssr-options'
            },
            {
              text: 'ワーカのオプション',
              link: '/config/worker-options'
            }
          ]
        }
      ]
    }
  }
})
