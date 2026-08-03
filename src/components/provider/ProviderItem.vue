<script setup lang="ts">
import clash from '@/assets/icons/clash.png'
import shadowrocket from '@/assets/icons/shadowrocket.png'
import stash from '@/assets/icons/stash.png'
import type { Provider } from '@/types/data'

const links = [
  { type: 'clash', image: clash, text: 'Clash' },
  { type: 'stash', image: stash, text: 'Stash' },
  { type: 'shadowrocket', image: shadowrocket, text: 'Shadowrocket' },
]

interface Props {
  provider: Provider
}

const props = defineProps<Props>()

function openLink(type: string, provider: Provider): void {
  const { name, token } = provider
  const url = `${location.origin}/api/subscribe/${token}`

  if (type === 'clash') {
    location.href = `clash://install-config?url=${encodeURIComponent(url)}&name=${encodeURIComponent(`${name}.yaml`)}`
  } else if (type === 'stash') {
    location.href = `stash://install-config?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`
  } else if (type === 'shadowrocket') {
    location.href = `shadowrocket://add/sub://${btoa(url)}#${encodeURIComponent(name)}`
  }
}
</script>

<template>
  <v-card :title="provider.name">
    <v-row dense class="pa-4">
      <v-col v-for="(link, i) in links" :key="i" cols="6" sm="4" md="3">
        <v-sheet
          class="d-flex flex-column align-center justify-center pa-3 rounded-lg border cursor-pointer hover-elevation"
          aspect-ratio="1"
          @click="openLink(link.type, provider)">
          <v-img :src="link.image" width="36" height="36" class="mb-2" />
          <span class="text-caption font-weight-medium text-truncate w-100 text-center">{{ link.text }}</span>
        </v-sheet>
      </v-col>
    </v-row>
  </v-card>
</template>
