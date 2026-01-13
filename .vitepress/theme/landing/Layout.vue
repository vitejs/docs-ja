<script setup>
// these components live in @voidzero-dev/vitepress-theme
import Hero from './Hero.vue'
import ViteFeatureGrid1 from './FeatureGrid1.vue'
import ViteFeatureGrid2 from './FeatureGrid2.vue'
import ViteFrameworks from './Frameworks.vue'
import ViteCommunity from './Community.vue'
import TrustedBy from '@components/oss/TrustedBy.vue'
import HeadingSection from '@components/oss/HeadingSection.vue'
import Sponsors from '@components/oss/Sponsors.vue'
import Spacer from '@components/shared/Spacer.vue'
import Footer from '@components/oss/Footer.vue'
import { useSponsor } from '../composables/sponsor'

const { data: sponsors } = useSponsor()
</script>

<template>
  <Hero />
  <TrustedBy
    :logos="['openai', 'shopify', 'stripe', 'linear', 'clickup', 'wiz']"
  />
  <HeadingSection
    heading="開発者体験の革新"
    subheading="Vite はウェブ開発を再び楽しくします"
  />
  <ViteFeatureGrid1 />
  <HeadingSection heading="ビルドのための共通基盤" />
  <ViteFeatureGrid2 />
  <HeadingSection heading="あなたのお気に入りのツールやフレームワークを支えています" />
  <ViteFrameworks />
  <ViteCommunity />
  <Sponsors
    :sponsors="sponsors"
    heading="無料でオープンソース"
    description="Vite は MIT ライセンスで、今後もずっと無料でオープンソースです。これはコントリビューターと以下の企業によって実現されています:"
    sponsorLinkText="スポンサーになる"
   />
  <Spacer />
  <Footer
    heading="さぁ、Vite で作ろう"
    subheading="あなたの思考スピードについていける開発環境を手に入れよう。"
    button-text="はじめる"
    button-link="/guide/"
  />
</template>
