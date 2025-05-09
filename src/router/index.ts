import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './admin'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    component: () => import('@/views/IndexVue/index.vue'),
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { guest: true },
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
      requiresAuth: true,
    },
  },
  {
    path: '/chat/:userId',
    component: () => import('../views/chat/ChatRoom.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  ...adminRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  console.log('userStore', userStore)

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && userStore.user.role !== 'admin') {
    next('/')
  } else if (to.meta.guest && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
