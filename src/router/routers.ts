import type { RouteRecordRaw } from 'vue-router'
// 页面组件
import UserPage from '@/views/user/userPage.vue'

// 路由数组，类型 RouteRecordRaw
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/user' // 默认根路径 重定向到用户页面
  },
  {
    path: '/user',
    name: 'User',
    component: UserPage,
    meta: {
      title: '用户管理'
    }
  }
]