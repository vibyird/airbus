<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>文档</template>

    <span>Vue的</span>
    <a href="https://vuejs.org/" target="_blank" rel="noopener">官方文档</a>
    <span>为您提供了入门所需的所有信息。</span>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>工具</template>

    <span>本项目由</span>
    <a href="https://vite.dev/guide/features.html" target="_blank" rel="noopener">Vite</a>
    <span>提供服务并进行打包。推荐的IDE配置是</span>
    <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VSCode</a> +
    <a href="https://github.com/vuejs/language-tools" target="_blank" rel="noopener">Vue (Official)</a>
    <span>。如果你需要测试组件和网页，可以看看</span>
    <a href="https://vitest.dev/" target="_blank" rel="noopener">Vitest</a>
    <span>和</span>
    <a href="https://www.cypress.io/" target="_blank" rel="noopener">Cypress</a> /
    <a href="https://playwright.dev/" target="_blank" rel="noopener">Playwright</a>。
    <br />
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>生态</template>

    <span>你的项目可以获取的官方工具和库：</span>
    <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Pinia</a>,
    <a href="https://router.vuejs.org/" target="_blank" rel="noopener">Vue Router</a>,
    <a href="https://test-utils.vuejs.org/" target="_blank" rel="noopener">Vue Test Utils</a>
    <span>和</span>
    <a href="https://github.com/vuejs/devtools" target="_blank" rel="noopener">Vue Dev Tools</a>。
    <span>如果你需要更多资源，我们建议访问</span>
    <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">Awesome Vue</a>。
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>社区</template>

    <span>有困难了? 请在</span>
    <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>
    <span>（我们的官方Discord服务器），或</span>
    <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener">StackOverflow</a>
    <span>上提问。你还可以关注官方</span>
    <a href="https://bsky.app/profile/vuejs.org" target="_blank" rel="noopener">@vuejs.org</a>
    <span>Bluesky 账号或</span>
    <a href="https://x.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
    <span>X 账号，获取Vue领域的最新资讯。</span>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>支持 Vue</template>

    <span>作为一个独立项目，Vue 依靠社区支持来实现可持续发展。 您可以通过</span>
    <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">成为赞助商</a>
    <span>来帮助我们。</span>
  </WelcomeItem>
</template>

<style scoped>
a {
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  transition: 0.4s;
  padding: 3px;
}
</style>
