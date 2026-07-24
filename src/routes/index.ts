import appRoutes from '@/routes/app'
import { useStore } from '@/stores/default'
import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/app',
    name: 'app',
    component: () => import('@/layouts/App.vue'),
    beforeEnter: async (to, from, next) => {
      const store = useStore()
      await store.ready()
      if (!store.user) {
        next({
          path: '/login',
          replace: true,
          query: {
            redirect: to.fullPath,
          },
        })
      } else {
        next()
      }
    },
    children: appRoutes,
  },
  {
    path: '/',
    name: 'default',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('@/views/site/Index.vue'),
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/site/Login.vue'),
        beforeEnter: async (to, from, next) => {
          const store = useStore()
          await store.ready()
          if (store.user) {
            next({ path: '/app', replace: true })
          } else {
            next()
          }
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not_found',
    component: () => import('@/layouts/NotFound.vue'),
  },
] as RouteRecordRaw[]
