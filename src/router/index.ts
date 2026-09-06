import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'
// 页面组件
import UserPage from '@/views/user/userPage.vue'
import HomePage from '@/views/home/HomePage.vue'
import CategoryPage from '@/views/category/CategoryPage.vue'
import CartPage from '@/views/cart/CartPage.vue'
import MinePage from '@/views/mine/MinePage.vue'

// 路由数组，类型 RouteRecordRaw
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home' // 默认根路径 重定向到商城首页
  },
  // ========== 商城 Tab 主页面（底部导航）==========
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: {
      title: '商城首页',
      showTabbar: true,   // 控制底部导航显示
      tabbarIndex: 0      // 底部导航激活索引
    }
  },
  {
    path: '/category',
    name: 'Category',
    component: CategoryPage,
    meta: {
      title: '商品分类',
      showTabbar: true,
      tabbarIndex: 1
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartPage,
    meta: {
      title: '购物车',
      showTabbar: true,
      tabbarIndex: 2
    }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: MinePage,
    meta: {
      title: '个人中心',
      showTabbar: true,
      tabbarIndex: 3
    }
  },
  // ========== 业务页面（不显示底部导航）==========
  {
    path: '/user',
    name: 'User',
    component: UserPage,
    meta: {
      title: '用户管理'
    }
  },
  // 404 兜底：未知路径重定向回首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

// 创建路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // history模式（不带#）
  routes,
  // 切换路由回到页面顶部
  scrollBehavior: () => ({ top: 0 })
})

// 全局前置守卫：设置页面标题（后续可扩展登录鉴权）
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '商城'
  next()
})

export default router
