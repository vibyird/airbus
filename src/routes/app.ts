import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '',
    name: 'app',
    component: () => import('@/views/site/App.vue'),
  },
] as RouteRecordRaw[]
