<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from 'vuetify'

const userThemeModeKey = 'user-theme-mode'

const theme = useTheme()

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

const mode = localStorage.getItem(userThemeModeKey) ?? 'auto'
const computedMode = mode === 'auto' ? (mediaQuery.matches ? 'dark' : 'light') : mode
const selectedMode = ref(computedMode)
theme.global.name.value = computedMode

function setThemeMode(mode: string) {
  const computedMode = mode === 'auto' ? (mediaQuery.matches ? 'dark' : 'light') : mode
  selectedMode.value = computedMode
  theme.global.name.value = computedMode
}

function handleSystemThemeChange() {
  const mode = localStorage.getItem(userThemeModeKey) ?? 'auto'
  if (mode === 'auto') {
    setThemeMode(mode)
  }
}

function switchThemeMode(mode: string | null) {
  if (!mode) {
    return
  }
  localStorage.setItem(userThemeModeKey, mode)
  setThemeMode(mode)
}

onMounted(() => {
  mediaQuery.addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', handleSystemThemeChange)
})
</script>

<template>
  <v-switch
    v-model="selectedMode"
    inset
    size="small"
    hide-details
    true-value="dark"
    false-value="light"
    true-icon="mdi-weather-night"
    false-icon="mdi-white-balance-sunny"
    @update:model-value="switchThemeMode" />
</template>
