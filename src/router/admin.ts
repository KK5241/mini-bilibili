import type { RouteRecordRaw } from 'vue-router';

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/videos'
      },
      {
        path: 'videos',
        name: 'AdminVideos',
        component: () => import('../views/admin/Videos.vue'),
        meta: { title: '视频审核' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
        meta: { title: '用户管理' }
      }
    ]
  }
];

export default adminRoutes; 