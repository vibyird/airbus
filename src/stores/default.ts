import type { User } from '@/types/data'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useStore = defineStore('default', () => {
  const loadingCount = ref(0)
  const loading = computed(() => loadingCount.value > 0)

  const snackbar = ref({
    show: false,
    color: '',
    message: '',
  })

  const user = ref<User & { status: 'unknown' | 'unauthenticated' | 'authenticated' }>({
    status: 'unknown',
    uid: 0,
    nickname: '',
    email: '',
  })

  function showLoading(): void {
    loadingCount.value += 1
  }

  function hideLoading(): void {
    loadingCount.value -= 1
  }

  function showSnackbar({ color = 'success', message }: { color?: string; message: string }): void {
    snackbar.value = {
      show: true,
      color,
      message,
    }
  }

  function setUser(data: User | null): void {
    if (!data) {
      user.value = {
        status: 'unauthenticated',
        uid: 0,
        nickname: '',
        email: '',
      }
      return
    }
    user.value = {
      status: 'authenticated',
      ...data,
    }
  }

  return { loading, snackbar, user, showLoading, hideLoading, showSnackbar, setUser }
})
