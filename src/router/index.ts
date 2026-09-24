import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'

// 路由数组，类型 RouteRecordRaw（页面组件全部懒加载）
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home' // 默认根路径 重定向到商城首页
  },
  // ========== 商城 Tab 主页面（底部导航）==========
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: {
      title: '商城首页',
      showTabbar: true,   // 控制底部导航显示
      tabbarIndex: 0      // 底部导航激活索引
    }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/category/CategoryPage.vue'),
    meta: {
      title: '商品分类',
      showTabbar: true,
      tabbarIndex: 1
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/cart/CartPage.vue'),
    meta: {
      title: '购物车',
      showTabbar: true,
      tabbarIndex: 2
    }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/MinePage.vue'),
    meta: {
      title: '个人中心',
      showTabbar: true,
      tabbarIndex: 3
    }
  },
  // ========== 认证与业务页面（不显示底部导航）==========
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminPage.vue'),
    redirect: '/admin/user',
    meta: {
      title: '管理后台',
      requiresAdmin: true // 需要管理员权限
    },
    children: [
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('@/views/admin/components/UserManagement.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'goods',
        name: 'AdminGoods',
        component: () => import('@/views/admin/components/ProductManagement.vue'),
        meta: {
          title: '商品管理'
        }
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/userPage.vue'),
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

// 全局前置守卫：设置页面标题 + 登录/管理员鉴权
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '商城'

  // 管理后台：未登录 → 登录页（带回跳），非管理员 → 首页
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else if (!userStore.isAdmin) {
      next('/home')
    } else {
      next()
    }
    return
  }

  next()
})

export default router
