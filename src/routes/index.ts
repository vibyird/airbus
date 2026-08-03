import routes from '@/routes/app'
import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/app',
    component: () => import('@/layouts/App.vue'),
    children: [
      {
        path: '',
        name: 'app',
        component: () => import('@/views/site/App.vue'),
      },
      ...routes,
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '/',
        name: 'index',
        component: () => import('@/views/site/Index.vue'),
      },
    ],
  },
  {
    path: '/:paths(.*)*',
    component: () => import('@/views/site/NotFound.vue'),
  },
] as RouteRecordRaw[]
