<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.replace('/')
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/')
  }
}
</script>

<template>
  <v-main class="d-flex align-center justify-center fill-height px-2">
    <v-empty-state class="text-center py-8">
      <template #media>
        <v-icon icon="mdi-alert-circle-outline" color="error" class="ma-0 my-2" />
      </template>
      <template #title>
        <h1 class="text-headline-large ma-0 my-2">404 - 页面未找到</h1>
      </template>
      <template #text>
        <p class="text-body-large text-medium-emphasis ma-0 my-2">抱歉，您访问的页面不存在或已被移除。</p>
      </template>
      <template #actions>
        <v-btn color="primary" width="128" variant="flat" prepend-icon="mdi-home" @click="goHome">
          <span>主页</span>
        </v-btn>
        <v-btn width="128" variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
          <span>上一页</span>
        </v-btn>
      </template>
    </v-empty-state>
  </v-main>
</template>
