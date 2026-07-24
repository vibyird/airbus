<script setup lang="ts">
import Account from '@/components/Account.vue'
import Theme from '@/components/Theme.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app-bar>
    <v-container class="d-flex align-center">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-app-bar-title>Airbus</v-app-bar-title>
      <v-spacer />
      <Theme />
      <Account />
    </v-container>
  </v-app-bar>
  <v-main>
    <v-container class="fill-height">
      <RouterView />
    </v-container>
  </v-main>
</template>
