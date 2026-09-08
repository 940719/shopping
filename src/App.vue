<script setup lang="ts">
import { getUserList } from './api/user'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 底部导航激活项（随路由同步）
const active = ref(0)
// PC 顶部导航搜索关键词
const keyword = ref('')

// Tab 路由与底部导航索引的映射
const TAB_PATHS = ['/home', '/category', '/cart', '/mine']
const TAB_LABELS = ['首页', '分类', '购物车', '我的']

// 路由变化时同步导航高亮
watch(
  () => route.path,
  () => {
    const index = route.meta.tabbarIndex as number | undefined
    if (typeof index === 'number') active.value = index
  },
  { immediate: true }
)

const go = (path: string) => {
  if (route.path !== path) router.push(path)
}

const onTabChange = (index: number) => go(TAB_PATHS[index])

const onSearch = (val: string) => {
  // 演示：跳转到分类页（后续可接商品搜索页）
  router.push({ path: '/category', query: { keyword: val } })
}

/* ---------- PC 登录入口 ---------- */
const goLogin = () => {
  if (route.path !== '/login') router.push('/login')
}

const handleLogout = () => {
  userStore.logout()
  showToast('已退出登录')
  if (route.path === '/admin') router.push('/home')
}

const init = async () => {
  const res = await getUserList()
  console.log('用户列表：', res.data)
}

onMounted(() => {
  console.log('App.vue mounted')
  init()
})
</script>

<template>
  <div class="app-container">
    <!-- PC 顶部导航（≥768px 显示） -->
    <header class="pc-header">
      <div class="pc-header-inner">
        <div class="logo" @click="go('/home')">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">优选商城</span>
        </div>
        <nav class="pc-nav">
          <a
            v-for="(label, i) in TAB_LABELS"
            :key="label"
            class="pc-nav-item"
            :class="{ active: active === i }"
            @click="go(TAB_PATHS[i])"
          >{{ label }}</a>
        </nav>
        <van-search
          v-model="keyword"
          class="pc-search"
          shape="round"
          placeholder="搜索商品，如：耳机"
          @search="onSearch"
        />
        <!-- PC 登录入口 / 用户信息 -->
        <div class="pc-user">
          <template v-if="userStore.isLogin">
            <span class="pc-username">👤 {{ userStore.userInfo?.nickname }}</span>
            <button v-if="userStore.isAdmin" class="pc-admin-btn" @click="go('/admin')">管理后台</button>
            <button class="pc-login-btn" @click="handleLogout">退出</button>
          </template>
          <template v-else>
            <button class="pc-login-btn" @click="goLogin">登录</button>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面内容区（PC 端为内部滚动容器） -->
    <div class="page-view">
      <RouterView />
    </div>

    <!-- 移动端底部导航：仅商城 Tab 页显示（PC 端由 CSS 隐藏） -->
    <van-tabbar
      v-if="route.meta.showTabbar"
      v-model="active"
      class="mobile-tabbar"
      active-color="#ff4d2d"
      inactive-color="#7d7e80"
      safe-area-inset-bottom
      @change="onTabChange"
    >
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o">分类</van-tabbar-item>
      <van-tabbar-item icon="cart-o">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-bottom: 50px; /* 为底部导航留出空间（移动端） */
  display: flex;
  flex-direction: column;
}
/* 页面内容区：移动端自然撑高，PC 端作为内部滚动容器 */
.page-view {
  flex: 1;
  min-height: 0;
}

/* ===== PC 顶部导航（默认隐藏） ===== */
.pc-header {
  display: none;
}

@media (min-width: 768px) {
  .app-container {
    height: 100vh; /* 锁定视口高度，禁用 body 滚动 */
    min-height: 0;
    padding-bottom: 0; /* PC 端无底部导航 */
    overflow: hidden;
  }
  .page-view {
    overflow: hidden; /* 滚动收敛到页面组件内部 */
  }
  .pc-header {
    display: block;
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
  .pc-header-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 28px;
    padding: 10px 24px;
    box-sizing: border-box;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .logo-icon {
    font-size: 26px;
  }
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #ff4d2d;
  }
  .pc-nav {
    flex: 1;
    display: flex;
    gap: 6px;
  }
  .pc-nav-item {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 14px;
    color: #444;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pc-nav-item:hover {
    color: #ff4d2d;
  }
  .pc-nav-item.active {
    color: #ff4d2d;
    background: rgba(255, 77, 45, 0.08);
    font-weight: 600;
  }
  .pc-search {
    flex: 0 1 320px;
    padding: 0;
  }
  .pc-search :deep(.van-search__content) {
    background: #f5f5f5;
    border-radius: 20px;
  }
  .pc-user {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pc-username {
    font-size: 13px;
    color: #444;
    white-space: nowrap;
  }
  .pc-login-btn,
  .pc-admin-btn {
    padding: 6px 16px;
    border-radius: 18px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .pc-login-btn {
    background: linear-gradient(90deg, #ff4d2d, #ff6034);
    color: #fff;
    border: none;
    font-weight: 600;
  }
  .pc-login-btn:hover {
    opacity: 0.9;
  }
  .pc-admin-btn {
    background: #fff;
    color: #ff4d2d;
    border: 1px solid #ff4d2d;
    font-weight: 600;
  }
  .pc-admin-btn:hover {
    background: rgba(255, 77, 45, 0.06);
  }
  .mobile-tabbar {
    display: none !important; /* PC 端隐藏底部导航 */
  }
}
</style>
