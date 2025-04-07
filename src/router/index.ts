import {createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/IndexVue/index.vue'),
  },
  {
    path: '/school',
    component: () => import('@/views/school/index.vue'),
  },
  {
    path: '/video',
    component: () => import('@/views/video/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
