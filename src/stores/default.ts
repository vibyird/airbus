import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  uid: number
  nickname: string
  email: string
}

export const useStore = defineStore('default', () => {
  const user = ref<User | null>(null)

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  async function init() {
    const res = await fetch('/api/site/init')
    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        setUser(data.user as User)
      }
    }
  }

  let readyResult: boolean = false
  const readyPromise = init()

  async function ready() {
    if (readyResult) {
      return
    }
    await readyPromise
    readyResult = true
  }

  return { ready, user, setUser }
})
