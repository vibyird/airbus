<script setup lang="ts">
import Theme from '@/components/Theme.vue'
import ChangePassword from '@/components/user/ChangePassword.vue'
import Login from '@/components/user/Login.vue'
import { useStore } from '@/stores/default'
import type { User } from '@/types/data'
import { request } from '@/utils/request'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const tabs = [
  { title: '首页', icon: 'mdi-home', to: '/app' },
  { title: '规则配置', icon: 'mdi-cog', to: '/app/provider/config' },
]

const route = useRoute()
const store = useStore()

const { loading, user } = storeToRefs(store)
const activeTab = ref(route.path)
const showDrawer = ref(false)

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
        <v-app-bar-nav-icon v-if="user.status === 'authenticated'" @click="showDrawer = !showDrawer" />
        <v-app-bar-nav-icon v-else icon="mdi-home" to="/" />
        <v-app-bar-title>Airbus</v-app-bar-title>
        <div v-if="user.status === 'authenticated'" class="nav-tabs hidden-sm-and-down">
          <v-btn-toggle
            v-model="activeTab"
            mandatory
            rounded="pill"
            density="comfortable"
            selected-class="active-nav-btn"
            class="nav-toggle-group"
            border="sm"
            variant="outlined">
            <v-btn
              v-for="item in tabs"
              :key="item.title"
              :value="item.to"
              :to="item.to"
              exact
              width="128"
              variant="text"
              class="nav-btn">
              <v-icon start :icon="item.icon" />
              {{ item.title }}
            </v-btn>
          </v-btn-toggle>
        </div>
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
    <v-navigation-drawer v-if="user.status === 'authenticated'" v-model="showDrawer" location="left" temporary>
      <v-list nav>
        <v-list-item
          v-for="item in tabs"
          :key="item.title"
          :to="item.to"
          :title="item.title"
          :prepend-icon="item.icon"
          exact />
      </v-list>
    </v-navigation-drawer>
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

<style scoped>
.nav-tabs {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
