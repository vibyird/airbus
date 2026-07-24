import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOverlayStore = defineStore('overlay', () => {
  const snackbar = ref({
    show: false,
    color: '',
    message: '',
  })

  function showSnackbar({ color = 'success', message }: { color?: string; message: string }) {
    snackbar.value = {
      show: true,
      color,
      message,
    }
  }

  return {
    snackbar,
    showSnackbar,
  }
})
