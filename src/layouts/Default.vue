<script setup lang="ts">
import Theme from '@/components/Theme.vue'
import { useStore } from '@/stores/default'
import type { User } from '@/types/data'
import { request } from '@/utils/request'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const store = useStore()

const { loading, user } = storeToRefs(store)
</script>

<template>
  <v-app-bar>
    <v-container class="d-flex align-center">
      <v-app-bar-nav-icon
        icon="mdi-home"
        @click="
          () => {
            if (route.path !== '/') {
              router.push('/')
            }
          }
        " />
      <v-app-bar-title>Airbus</v-app-bar-title>
      <v-spacer />
      <Theme />
      <v-btn
        icon="mdi-login"
        title="登录"
        :disabled="loading"
        @click="
          async () => {
            if (user.status === 'unknown') {
              const { user } = await request<{ user: User | null }>('/user/init')
              store.setUser(user)
            }
            router.push('/app')
          }
        " />
    </v-container>
    <v-progress-linear :active="loading" color="primary" indeterminate absolute location="bottom" />
  </v-app-bar>
  <v-main>
    <v-container class="fill-height">
      <router-view />
    </v-container>
  </v-main>
  <footer>
    <span class="text-body-small">Copyright © 2024 - {{ new Date().getFullYear() }} Vibyird</span>
  </footer>
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
