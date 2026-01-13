<script setup>
import RiveAnimation from '@components/shared/RiveAnimation.vue'
import flexiblePluginAnimation from '@assets/vite/animations/640_x_300_flexible_plugin.riv'
</script>

<template>
  <section
    class="wrapper wrapper--ticks border-t grid lg:grid-cols-2 divide-x divide-y divide-nickel"
  >
    <div class="p-5 sm:p-10 flex flex-col gap-3">
      <h5 class="text-balance sm:text-pretty text-white">
        柔軟なプラグインシステム
      </h5>
      <p class="sm:max-w-[28rem] text-pretty">
        Vite のプラグインは、Rollup の洗練されたプラグインインターフェースを Vite 固有のオプションで拡張。
      </p>
      <RiveAnimation
        :desktop-src="flexiblePluginAnimation"
        :desktop-width="640"
        :desktop-height="300"
        canvas-class="w-[calc(100%_+_2.5rem)] mt-5 -mx-5"
      />
    </div>

    <div class="flex flex-col gap-3 border-r-0 justify-between">
      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5 class="text-white">完全に型付けされた API</h5>
        <p class="max-w-[26rem] text-pretty">強固な型をベースに構築できるよう設計。</p>
      </div>
      <div class="relative p-5 sm:p-10 flex justify-center bg-[#370a7f]">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="@assets/vite/vite-featurepanel-4-background.jpg"
          alt=""
          inert
          loading="lazy"
        />
        <img
          class="z-1"
          src="@assets/vite/vite-typed-api.svg"
          width="454"
          height="252"
          inert
          loading="lazy"
          alt="typed api"
        />
      </div>
    </div>

    <div class="p-5 sm:p-10 flex flex-col gap-3 lg:border-b-0">
      <h5 class="text-white">ファーストクラスの SSR サポート</h5>
      <p class="sm:max-w-[28rem] text-pretty mb-12 sm:mb-16">
        カスタム SSR（サーバーサイドレンダリング）のセットアップや、独自の SSR フレームワークの構築がこれまで以上に簡単に。
      </p>
      <img
        src="@assets/vite/vite-ssr-support.png"
        width="1008"
        height="466"
        alt="SSR Support"
        loading="lazy"
        class="w-full px-5"
      />
    </div>

    <div class="flex flex-col gap-3 justify-between">
      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5 class="text-white">継続的なエコシステム統合</h5>
        <p class="max-w-[25rem] text-pretty">
          CI で下流プロジェクトに対して Vite の変更内容を継続的にテストしており、安定性と信頼性を持って Vite の改善を可能にしています。
        </p>
      </div>
      <div class="px-5 sm:px-10 flex justify-center">
        <img
          src="@assets/vite/vite-ci.svg"
          width="476"
          height="272"
          inert
          loading="lazy"
          alt="continuous ecosystem integration"
        />
      </div>
    </div>
  </section>
</template>
