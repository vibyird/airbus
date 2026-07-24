<script setup lang="ts">
import Login from '@/components/Login.vue'
import Theme from '@/components/Theme.vue'
import { useStore } from '@/stores/default'
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const showLoginDialog = ref(false)

function goHome() {
  const route = router.currentRoute.value
  if (route.path !== '/') {
    router.push('/')
  }
}

function goLogin() {
  if (store.user) {
    router.push('/app')
  } else {
    const route = router.currentRoute.value
    if (route.path !== '/login') {
      showLoginDialog.value = true
    }
  }
}
</script>

<template>
  <v-app-bar>
    <v-container class="d-flex align-center">
      <v-app-bar-nav-icon icon="mdi-home" @click="goHome" />
      <v-app-bar-title>Airbus</v-app-bar-title>
      <v-spacer />
      <Theme />
      <v-btn icon="mdi-login" title="登录" @click="goLogin" />
    </v-container>
  </v-app-bar>
  <v-main>
    <v-container class="fill-height">
      <RouterView />
    </v-container>
  </v-main>
  <footer>
    <span class="text-body-small">Copyright © 2024 - {{ new Date().getFullYear() }} Vibyird</span>
  </footer>
  <v-dialog v-model="showLoginDialog"><Login @login="router.push('/app')" /></v-dialog>
</template>

<style scoped>
footer {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 64px;

  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow:
    0 1px 2px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity, 0.3)),
    0 2px 6px 2px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15));
  --v-elevation-overlay: color-mix(in srgb, var(--v-elevation-overlay-color) 4%, transparent);
}
</style>
