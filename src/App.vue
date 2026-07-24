<script setup lang="ts">
import { useStore } from '@/stores/default'
import { useOverlayStore } from '@/stores/overlay'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

const store = useStore()
const overlayStore = useOverlayStore()
const { snackbar } = storeToRefs(overlayStore)

const ready = ref(false)

onMounted(async () => {
  await store.ready()
  ready.value = true
})
</script>

<template>
  <v-app>
    <template v-if="ready">
      <router-view />
      <v-snackbar v-model="snackbar.show" location="top" :color="snackbar.color" :timeout="3000">
        {{ snackbar.message }}
      </v-snackbar>
    </template>
    <v-main v-else class="d-flex align-center justify-center fill-height">
      <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
    </v-main>
  </v-app>
</template>
