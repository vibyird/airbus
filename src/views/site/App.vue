<script setup lang="ts">
import ProviderItem from '@/components/provider/ProviderItem.vue'
import type { Provider } from '@/types/data'
import { request } from '@/utils/request'
import { onMounted, ref } from 'vue'

const ready = ref(false)
const providers = ref<Provider[]>([])

onMounted(async () => {
  const { providers: data } = await request<{ providers: Provider[] }>('/provider/list')
  providers.value = data
  ready.value = true
})
</script>

<template>
  <div v-if="ready" v-for="(provider, i) in providers" :key="i" class="mb-4">
    <ProviderItem :provider="provider" />
  </div>
  <div v-else class="d-flex align-center justify-center fill-height">
    <v-progress-circular indeterminate color="primary" size="64" width="6" />
  </div>
</template>
