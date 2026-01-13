---
layout: page
title: チーム紹介
description: Vite の開発は、国際的なチームによって進められています。
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from '@voidzero-dev/vitepress-theme'
import { core, emeriti } from './_data/team'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>チーム紹介</template>
    <template #lead>
      Vite の開発は、国際的なチームによって進められており、
      以下にその一部を紹介します。
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="core" />
  <VPTeamPageSection>
    <template #title>名誉チームメンバー</template>
    <template #lead>
      ここでは、過去に多大な貢献をした、
      現在は活動していないメンバーを称えます。
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="emeriti" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
