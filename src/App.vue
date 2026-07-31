<script setup lang="ts">
import { useStore } from '@/stores/default'
import { storeToRefs } from 'pinia'

const store = useStore()
const { snackbar } = storeToRefs(store)
</script>

<template>
  <v-app>
    <router-view />
    <v-snackbar v-model="snackbar.show" location="top" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>
