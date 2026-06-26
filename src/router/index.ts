import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/views/site/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not_found',
      component: () => Promise.resolve({ render: () => null }),
      beforeEnter: () => {
        window.location.href = '/404'
      },
    },
  ],
})

export default router
