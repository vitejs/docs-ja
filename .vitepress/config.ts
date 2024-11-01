import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { buildEnd } from './buildEnd.config'

const ogDescription = '次世代フロントエンドツール'
const ogImage = 'https://vite.dev/og-image.jpg'
const ogTitle = 'Vite'
const ogUrl = 'https://vite.dev'

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
  const oldVersions: DefaultTheme.NavItemWithLink[] = [
    {
      text: 'Vite 4 ドキュメント',
      link: 'https://v4.vite.dev',
    },
    {
      text: 'Vite 3 ドキュメント',
      link: 'https://v3.vite.dev',
    },
    {
      text: 'Vite 2 ドキュメント',
      link: 'https://v2.vite.dev',
    },
  ]

  switch (deployType) {
    // case 'main':
    case 'local':
      return [
        {
          text: 'Vite 5 ドキュメント（リリース）',
          link: 'https://vite.dev',
        },
        ...oldVersions,
      ]
    case 'release':
      return oldVersions
  }
})()

export default defineConfig({
  title: `Vite${additionalTitle}`,
  description: '次世代フロントエンドツール',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    [
      'link',
      { rel: 'alternate', type: 'application/rss+xml', href: '/blog.rss' },
    ],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'true',
      },
    ],
    [
      'link',
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
        as: 'style',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
      },
    ],
    ['link', { rel: 'me', href: 'https://m.webtoo.ls/@vite' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:site_name', content: 'vitejs' }],
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
    en: { label: 'English', link: 'https://vite.dev' },
    zh: { label: '简体中文', link: 'https://cn.vite.dev' },
    es: { label: 'Español', link: 'https://es.vite.dev' },
    pt: { label: 'Português', link: 'https://pt.vite.dev' },
    ko: { label: '한국어', link: 'https://ko.vite.dev' },
    de: { label: 'Deutsch', link: 'https://de.vite.dev' },
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/vitejs/docs-ja/edit/main/:path',
      text: 'このページへの変更を提案する',
    },

    socialLinks: [
      { icon: 'mastodon', link: 'https://elk.zone/m.webtoo.ls/@vite' },
      { icon: 'twitter', link: 'https://twitter.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vite.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' },
    ],

    algolia: {
      appId: '7H67QR5P0A',
      apiKey: '208bb9c14574939326032b937431014b',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en'],
      },
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev',
    },

    outlineTitle: '目次',

    docFooter: {
      prev: '前のページ',
      next: '次のページ',
    },

    footer: {
      message: `Released under the MIT License. (${commitRef})`,
      copyright: 'Copyright © 2019-present VoidZero Inc. & Vite Contributors',
    },

    nav: [
      { text: 'ガイド', link: '/guide/', activeMatch: '/guide/' },
      { text: '設定', link: '/config/', activeMatch: '/config/' },
      { text: 'プラグイン', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'リソース',
        items: [
          { text: 'チーム', link: '/team' },
          { text: 'ブログ', link: '/blog' },
          { text: 'リリース', link: '/releases' },
          {
            items: [
              {
                text: 'Mastodon',
                link: 'https://elk.zone/m.webtoo.ls/@vite',
              },
              {
                text: 'Twitter',
                link: 'https://twitter.com/vite_js',
              },
              {
                text: 'Discord Chat',
                link: 'https://chat.vite.dev',
              },
              {
                text: 'Awesome Vite',
                link: 'https://github.com/vitejs/awesome-vite',
              },
              {
                text: 'ViteConf',
                link: 'https://viteconf.org',
              },
              {
                text: 'DEV Community',
                link: 'https://dev.to/t/vite',
              },
              {
                text: '変更履歴',
                link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
              },
              {
                text: '貢献ガイド',
                link: 'https://github.com/vitejs/docs-ja/blob/main/CONTRIBUTING.md',
              },
            ],
          },
        ],
      },
      {
        text: 'バージョン',
        items: versionLinks,
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'ガイド',
          items: [
            {
              text: 'Vite を使う理由',
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
              text: 'サーバーサイドレンダリング',
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
              text: 'パフォーマンス',
              link: '/guide/performance',
            },
            {
              text: '理念',
              link: '/guide/philosophy',
            },
            {
              text: 'v5 からの移行',
              link: '/guide/migration',
            },
            {
              text: '破壊的変更',
              link: '/changes/',
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
        {
          text: 'Environment API',
          items: [
            {
              text: 'はじめに',
              link: '/guide/api-environment',
            },
            {
              text: '環境インスタンス',
              link: '/guide/api-environment-instances',
            },
            {
              text: 'プラグイン',
              link: '/guide/api-environment-plugins',
            },
            {
              text: 'フレームワーク',
              link: '/guide/api-environment-frameworks',
            },
            {
              text: 'ランタイム',
              link: '/guide/api-environment-runtimes',
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
              text: 'サーバーオプション',
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
              text: 'ワーカーのオプション',
              link: '/config/worker-options',
            },
          ],
        },
      ],
      '/changes/': [
        {
          text: '破壊的変更',
          link: '/changes/',
        },
        {
          text: '現在',
          items: [],
        },
        {
          text: '将来',
          items: [
            {
              text: 'フック内の this.environment',
              link: '/changes/this-environment-in-hooks',
            },
            {
              text: 'HMR hotUpdate プラグインフック',
              link: '/changes/hotupdate-hook',
            },
            {
              text: '環境ごとの API への移行',
              link: '/changes/per-environment-apis',
            },
            {
              text: 'ModuleRunner API を使った SSR',
              link: '/changes/ssr-using-modulerunner',
            },
            {
              text: 'ビルド時の共有プラグイン',
              link: '/changes/shared-plugins-during-build',
            },
          ],
        },
        {
          text: '過去',
          items: [],
        },
      ],
    },

    outline: {
      level: [2, 3],
    },
  },
  transformPageData(pageData) {
    const canonicalUrl = `${ogUrl}/${pageData.relativePath}`
      .replace(/\/index\.md$/, '/')
      .replace(/\.md$/, '/')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.unshift(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', content: pageData.title }],
    )
    return pageData
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          firebase: 'vscode-icons:file-type-firebase',
          '.gitlab-ci.yml': 'vscode-icons:file-type-gitlab',
        },
      }),
    ],
    optimizeDeps: {
      include: [
        '@shikijs/vitepress-twoslash/client',
        'gsap',
        'gsap/dist/ScrollTrigger',
        'gsap/dist/MotionPathPlugin',
      ],
    },
  },
  buildEnd,
})
