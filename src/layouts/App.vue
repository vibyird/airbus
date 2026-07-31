<script setup lang="ts">
import Theme from '@/components/Theme.vue'
import ChangePassword from '@/components/user/ChangePassword.vue'
import Login from '@/components/user/Login.vue'
import { useStore } from '@/stores/default'
import type { User } from '@/types/data'
import { request } from '@/utils/request'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const store = useStore()

const { loading, user } = storeToRefs(store)

onMounted(async () => {
  if (user.value.status === 'unknown') {
    const { user } = await request<{ user: User | null }>('/user/init')
    store.setUser(user)
  }
})
</script>

<template>
  <template v-if="user.status !== 'unknown'">
    <v-app-bar>
      <v-container class="d-flex align-center">
        <v-app-bar-nav-icon v-if="user.status === 'authenticated'"></v-app-bar-nav-icon>
        <v-app-bar-nav-icon v-else icon="mdi-home" to="/" />
        <v-app-bar-title>Airbus</v-app-bar-title>
        <v-spacer />
        <Theme />
        <v-menu v-if="user.status === 'authenticated'" location="bottom end">
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon icon="mdi-account" />
            </v-btn>
          </template>
          <v-list density="compact">
            <v-dialog max-width="400">
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <v-icon icon="mdi-lock-outline" class="me-2" />
                  <span>修改密码</span>
                </v-list-item>
              </template>
              <template #default="{ isActive }">
                <ChangePassword
                  :user="user"
                  @cancel="() => (isActive.value = false)"
                  @confirm="
                    () => {
                      store.setUser(null)
                      isActive.value = false
                    }
                  " />
              </template>
            </v-dialog>
            <v-list-item
              :disabled="loading"
              @click="
                async () => {
                  await request('/user/logout', { method: 'POST' })
                  store.setUser(null)
                }
              ">
              <v-icon icon="mdi-logout" class="me-2" />
              <span>退出登录</span>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
      <v-progress-linear :active="loading" color="primary" indeterminate absolute location="bottom" />
    </v-app-bar>
    <v-main>
      <v-container class="fill-height" v-if="user.status === 'authenticated'">
        <router-view />
      </v-container>
      <v-container v-else class="d-flex align-center justify-center fill-height">
        <Login width="400" @confirm="(user) => store.setUser(user)" />
      </v-container>
    </v-main>
  </template>
  <v-main v-else class="d-flex align-center justify-center fill-height">
    <v-progress-circular indeterminate color="primary" size="64" width="6" />
  </v-main>
</template>
