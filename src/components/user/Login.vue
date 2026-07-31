<script setup lang="ts">
import { useStore } from '@/stores/default'
import type { User } from '@/types/data'
import { HTTPError, request } from '@/utils/request'
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'

const store = useStore()

const emit = defineEmits<{
  (e: 'confirm', user: User): void
}>()

const form = ref<InstanceType<typeof VForm> | null>(null)
const email = ref('')
const password = ref('')
const loading = ref(false)

async function confirm(): Promise<void> {
  if (!form.value) {
    return
  }

  const { valid } = await form.value.validate()
  if (!valid) {
    store.showSnackbar({
      color: 'error',
      message: '请填写邮箱和密码',
    })
    return
  }

  try {
    loading.value = true
    const { user } = await request<{ user: User }>('/user/login', {
      data: {
        email: email.value,
        password: password.value,
      },
      handleUnauthenticated: false,
    })
    store.showSnackbar({
      message: '登录成功',
    })
    emit('confirm', user)
  } catch (e) {
    if (e instanceof HTTPError) {
      if (e.status === 401) {
        store.showSnackbar({
          color: 'error',
          message: '邮箱或密码错误，请重试',
        })
      } else {
        store.showSnackbar({
          color: 'error',
          message: '服务器异常，请重试',
        })
      }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card rounded="lg">
    <v-card-title class="text-headline-large text-center py-6">登录账户</v-card-title>
    <v-card-text>
      <v-form ref="form" @submit.prevent="confirm">
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
        <v-btn type="submit" :loading="loading" :disabled="loading" block color="primary" size="large" class="my-4">
          登录
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
