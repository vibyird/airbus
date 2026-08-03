<script setup lang="ts">
import shadowrocket from '@/assets/icons/shadowrocket.png'

const links = [{ type: 'shadowrocket', image: shadowrocket, text: 'Shadowrocket' }]

function openLink(type: string): void {
  if (type === 'shadowrocket') {
    location.href = `shadowrocket://config/add/${location.origin}/api/provider/config/shadowrocket.conf`
  }
}
</script>

<template>
  <v-card title="规则配置">
    <v-row dense class="pa-4">
      <v-col v-for="(link, i) in links" :key="i" cols="6" sm="4" md="3">
        <v-sheet
          class="d-flex flex-column align-center justify-center pa-3 rounded-lg border cursor-pointer hover-elevation"
          aspect-ratio="1"
          @click="openLink(link.type)">
          <v-img :src="link.image" width="36" height="36" class="mb-2" />
          <span class="text-caption font-weight-medium text-truncate w-100 text-center">{{ link.text }}</span>
        </v-sheet>
      </v-col>
    </v-row>
  </v-card>
</template>
