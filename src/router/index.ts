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
  {
    path: '/search',
    component: () => import('@/views/search/index.vue'),
  },
  {
    path: '/profile',
    component: () => import('@/views/profile/index.vue'),
  },
  {
    path: '/profile/:id',
    component: () => import('@/views/profile/index.vue'),
  },
  {
    path: '/favorites',
    component: () => import('@/views/profile/index.vue'),
    props: { defaultTab: 'favorites' },
  },
  {
    path: '/upload',
    component: () => import('@/views/upload/index.vue'),
  },
  {
    path: '/chat',
    component: () => import('../views/chat/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/chat/:userId',
    component: () => import('../views/chat/ChatRoom.vue'),
    meta: {
      requiresAuth: true
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
