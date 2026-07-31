<script setup lang="ts">
import { useStore } from '@/stores/default'
import type { User } from '@/types/data'
import { HTTPError, request } from '@/utils/request'
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'

const store = useStore()

interface Props {
  user: User
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const form = ref<InstanceType<typeof VForm> | null>(null)
const password = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const loading = ref(false)

async function confirm(): Promise<void> {
  if (!form.value) {
    return
  }

  const { valid } = await form.value.validate()
  if (!valid) {
    store.showSnackbar({
      color: 'error',
      message: '请填写新旧密码',
    })
    return
  }

  if (newPassword.value === password.value) {
    store.showSnackbar({
      color: 'error',
      message: '新密码不可以和当前密码一致',
    })
    return
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    store.showSnackbar({
      color: 'error',
      message: '两次新密码填写不一致',
    })
    return
  }

  try {
    loading.value = true
    await request('/user/change-password', {
      data: {
        email: props.user.email,
        password: password.value,
        newPassword: newPassword.value,
      },
    })
    store.showSnackbar({
      message: '修改密码成功，请重新登录',
    })
    emit('confirm')
  } catch (e) {
    if (e instanceof HTTPError) {
      if (e.status === 401) {
        store.showSnackbar({
          color: 'error',
          message: '当前密码错误，请重试',
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
  <v-card title="修改密码" rounded="lg">
    <v-card-text>
      <v-form ref="form">
        <v-label class="d-block mb-2 text-body-large">当前密码<span class="text-error">*</span></v-label>
        <v-text-field
          type="password"
          density="compact"
          v-model="password"
          placeholder="请输入当前密码"
          :rules="[(v) => !!v || '当前密码不能为空']" />
        <v-label class="d-block mb-2 text-body-large">新密码<span class="text-error">*</span></v-label>
        <v-text-field
          type="password"
          density="compact"
          v-model="newPassword"
          placeholder="请输入新密码"
          :rules="[(v) => !!v || '新密码不能为空']" />
        <v-label class="d-block mb-2 text-body-large">确认新密码<span class="text-error">*</span></v-label>
        <v-text-field
          type="password"
          density="compact"
          v-model="newPasswordConfirm"
          placeholder="请确认新密码"
          :rules="[(v) => !!v || '确认新密码不能为空']" />
      </v-form>
    </v-card-text>
    <v-divider />
    <v-card-actions class="px-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn variant="plain" @click="emit('cancel')">取消</v-btn>
      <v-btn :loading="loading" :disabled="loading" color="primary" variant="tonal" @click="confirm">确认</v-btn>
    </v-card-actions>
  </v-card>
</template>
