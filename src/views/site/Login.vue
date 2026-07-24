<script setup lang="ts">
import Login from '@/components/Login.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="d-flex align-center fill-height">
    <Login @login="router.push((route.query.redirect as string) || '/app')" />
  </div>
</template>
