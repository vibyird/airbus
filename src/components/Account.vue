<script setup lang="ts">
import { useStore } from '@/stores/default'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

async function logout() {
  const res = await fetch('/api/user/logout', {
    method: 'POST',
  })
  if (res.ok) {
    store.setUser(null)
    router.push('/')
  }
}
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props }">
      <v-btn icon v-bind="props">
        <v-icon icon="mdi-account" />
      </v-btn>
    </template>

    <v-list density="compact">
      <v-list-item>
        <div class="d-flex align-center ga-1 cursor-pointer user-select-none">
          <v-icon icon="mdi-logout" />
          <v-list-item-title @click="logout">登出</v-list-item-title>
        </div>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
