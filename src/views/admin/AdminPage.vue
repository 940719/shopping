<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/* ================= 菜单（路由模式） ================= */
const menuItems = [
  { key: 'users', label: '用户管理', icon: '👥', path: '/admin/user' },
  { key: 'goods', label: '商品管理', icon: '📦', path: '/admin/goods' }
]

/** 当前路由是否命中该菜单 */
const isMenuActive = (path: string) => route.path.startsWith(path)

const goMenu = (path: string) => {
  if (route.path !== path) router.push(path)
}

/* ================= 顶部操作 ================= */
const backToShop = () => router.push('/home')

const logout = () => {
  userStore.logout()
  showToast('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="admin-page">
    <!-- 顶部栏 -->
    <header class="admin-header">
      <div class="admin-header-inner">
        <div class="admin-brand">
          <span class="brand-icon">🛡️</span>
          <span class="brand-text">优选商城 · 管理后台</span>
        </div>
        <div class="admin-actions">
          <span class="admin-user">👤 {{ userStore.userInfo?.nickname }}</span>
          <van-button size="small" plain type="primary" class="act-btn" @click="backToShop">返回商城</van-button>
          <van-button size="small" plain class="act-btn act-btn-logout" @click="logout">退出登录</van-button>
        </div>
      </div>
    </header>

    <div class="admin-body">
      <!-- 左侧菜单 -->
      <aside class="admin-menu">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          :class="{ active: isMenuActive(item.path) }"
          @click="goMenu(item.path)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-text">{{ item.label }}</span>
        </div>
      </aside>

      <!-- 内容区：嵌套路由 -->
      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  height: calc(100vh - 60px);
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

/* ===== 顶部栏 ===== */
.admin-header {
  background: #1a1b1c;
  color: #fff;
}

.admin-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 20px;
}

.brand-text {
  font-size: 16px;
  font-weight: 700;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-user {
  font-size: 13px;
  opacity: 0.9;
  margin-right: 4px;
}

.act-btn {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff !important;
  background: transparent;
}

.act-btn-logout {
  border-color: #ff4d2d;
  color: #ff4d2d !important;
}

/* ===== 主体 ===== */
.admin-body {
  flex: 1;
  display: flex;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 24px;
  box-sizing: border-box;
  gap: 16px;
}

/* 左侧菜单 */
.admin-menu {
  width: 160px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 10px 0;
  height: fit-content;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  cursor: pointer;
  font-size: 14px;
  color: #444;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.menu-item:hover {
  color: #ff4d2d;
  background: rgba(255, 77, 45, 0.04);
}

.menu-item.active {
  color: #ff4d2d;
  font-weight: 600;
  background: rgba(255, 77, 45, 0.06);
  border-left-color: #ff4d2d;
}

.menu-icon {
  font-size: 16px;
}

/* 内容区 */
.admin-content {
  flex: 1;
  min-width: 0;
  height: calc(100% - 56px);
}

/* ========== 移动端适配 ========== */
@media (max-width: 767px) {
  .admin-body {
    flex-direction: column;
    padding: 12px;
  }

  .admin-menu {
    width: 100%;
    display: flex;
    padding: 6px;
  }

  .menu-item {
    flex: 1;
    justify-content: center;
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 10px 0;
  }

  .menu-item.active {
    border-bottom-color: #ff4d2d;
  }

  .admin-user {
    display: none;
  }
}
</style>
