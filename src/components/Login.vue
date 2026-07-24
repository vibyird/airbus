<script setup lang="ts">
import type { User } from '@/stores/default'
import { useStore } from '@/stores/default'
import { useOverlayStore } from '@/stores/overlay'
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'

const store = useStore()
const overlayStore = useOverlayStore()

const emit = defineEmits<{
  (e: 'login'): void
}>()

const form = ref<InstanceType<typeof VForm> | null>(null)
const email = ref('')
const password = ref('')

async function login() {
  if (!form.value) {
    return
  }

  const { valid } = await form.value.validate()
  if (!valid) {
    overlayStore.showSnackbar({
      color: 'error',
      message: '请填写邮箱和密码',
    })
    return
  }

  const res = await fetch('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  })
  if (res.ok) {
    const data = await res.json()
    if (data.user) {
      store.setUser(data.user as User)
      overlayStore.showSnackbar({
        message: '登录成功',
      })
      emit('login')
    } else {
      overlayStore.showSnackbar({
        color: 'error',
        message: '服务器异常，请重试',
      })
    }
  } else {
    if (res.status === 401) {
      overlayStore.showSnackbar({
        color: 'error',
        message: '邮箱或密码错误，请重试',
      })
    } else {
      overlayStore.showSnackbar({
        color: 'error',
        message: '服务器异常，请重试',
      })
    }
  }
}
</script>

<template>
  <v-sheet elevation="1" rounded="lg" class="sheet mx-auto pa-6">
    <h1 class="text-headline-large text-center">登录账户</h1>
    <v-form ref="form" @submit.prevent="login">
      <v-text-field
        type="email"
        density="compact"
        v-model="email"
        prepend-inner-icon="mdi-email"
        placeholder="请输入邮箱"
        :rules="[(v) => !!v || '邮箱不能为空']">
      </v-text-field>
      <v-text-field
        type="password"
        density="compact"
        v-model="password"
        prepend-inner-icon="mdi-lock"
        placeholder="请输入密码"
        :rules="[(v) => !!v || '密码不能为空']">
      </v-text-field>
      <v-btn type="submit" block color="primary" size="large" class="my-4">登录</v-btn>
    </v-form>
  </v-sheet>
</template>

<style scoped>
.sheet {
  width: 320px;
}

@media screen and (min-width: 1024px) {
  .sheet {
    width: 400px;
  }
}
</style>
