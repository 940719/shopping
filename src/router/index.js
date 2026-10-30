import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';

// 路由数组（页面组件全部懒加载）
export const routes = [
  {
    path: '/',
    // 保留 query：管理端跳转带 ?token={JWT}，重定向到 /home 时不能丢
    redirect: (to) => ({ path: '/home', query: to.query }),
  },
  // ========== 商城 Tab 主页面（底部导航）==========
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: {
      title: '商城首页',
      showTabbar: true, // 控制底部导航显示
      tabbarIndex: 0, // 底部导航激活索引
      hideHeader: true,
    },
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/category/CategoryPage.vue'),
    meta: {
      title: '商品分类',
      showTabbar: true,
      tabbarIndex: 1,
      hideHeader: true,
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/cart/CartPage.vue'),
    meta: {
      title: '购物车',
      showTabbar: true,
      tabbarIndex: 2,
      hideHeader: true,
    },
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/MinePage.vue'),
    meta: {
      title: '个人中心',
      showTabbar: true,
      tabbarIndex: 3,
      hideHeader: true,
    },
  },
  // ========== 认证与业务页面（不显示底部导航）==========
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue'),
    meta: {
      title: '登录',
      hideHeader: false,
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/userPage.vue'),
    meta: {
      title: '用户管理',
    },
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/address/AddressPage.vue'),
    meta: {
      title: '收货地址',
      hideHeader: true,
    },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/orders/OrdersPage.vue'),
    meta: {
      title: '我的订单',
      hideHeader: true,
    },
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/views/coupons/CouponPage.vue'),
    meta: {
      title: '优惠券',
      hideHeader: true,
    },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/favorites/FavoritesPage.vue'),
    meta: {
      title: '我的收藏',
      hideHeader: true,
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsPage.vue'),
    meta: {
      title: '设置',
      hideHeader: true,
    },
  },
  // 404 兜底：未知路径重定向回首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

// 创建路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // history模式（不带#）
  routes,
  // 切换路由回到页面顶部
  scrollBehavior: () => ({ top: 0 }),
});

// 全局前置守卫：设置页面标题 + 管理端跳转免登录恢复
router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.title || '商城';
  // 管理端跳转携带 ?token={JWT}：导航放行前先恢复登录态，避免页面请求 401
  const t = to.query.token || to.query.admin_token;
  if (t) {
    const userStore = useUserStore();
    if (!userStore.isLogin) {
      const ok = await userStore.loginWithToken(t);
      if (ok) {
        // 恢复成功：去掉地址栏 token，继续本次导航
        next({ path: to.path, replace: true });
        return;
      }
    }
  }
  next();
});

export default router;
