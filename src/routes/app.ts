import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'provider',
    children: [
      {
        path: 'config',
        name: 'provider_config',
        component: () => import('@/views/provider/Config.vue'),
      },
    ],
  },
] as RouteRecordRaw[]
