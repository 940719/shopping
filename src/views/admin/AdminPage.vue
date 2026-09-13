<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/user'
import { useGoodsStore } from '@/store/goods'
import ProductManagement from './components/ProductManagement.vue'

const router = useRouter()
const userStore = useUserStore()
const goodsStore = useGoodsStore()

/* ================= 菜单 ================= */
const activeMenu = ref<'users' | 'goods'>('users')

/* ================= 用户管理（mock） ================= */
interface UserRow {
  id: number
  username: string
  nickname: string
  role: string
  status: 'normal' | 'disabled'
  regTime: string
}

const users = ref<UserRow[]>([
  { id: 1, username: 'admin', nickname: '系统管理员', role: '管理员', status: 'normal', regTime: '2026-01-12' },
  { id: 2, username: 'user', nickname: '商城会员', role: '普通用户', status: 'normal', regTime: '2026-02-03' },
  { id: 3, username: 'xiaoming', nickname: '小明同学', role: '普通用户', status: 'normal', regTime: '2026-03-18' },
  { id: 4, username: 'lily', nickname: '莉莉', role: '普通用户', status: 'normal', regTime: '2026-05-27' },
  { id: 5, username: 'wangwu', nickname: '王五', role: '普通用户', status: 'disabled', regTime: '2026-06-09' }
])

const toggleUser = (u: UserRow) => {
  u.status = u.status === 'normal' ? 'disabled' : 'normal'
  showToast(u.status === 'normal' ? '已启用' : '已禁用')
}

const removeUser = (u: UserRow) => {
  showConfirmDialog({ title: '删除用户', message: `确定删除用户「${u.nickname}」吗？` })
    .then(() => {
      users.value = users.value.filter((x) => x.id !== u.id)
      showToast('已删除')
    })
    .catch(() => { })
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
        <div class="menu-item" :class="{ active: activeMenu === 'users' }" @click="activeMenu = 'users'">
          <span class="menu-icon">👥</span>
          <span class="menu-text">用户管理</span>
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'goods' }" @click="activeMenu = 'goods'">
          <span class="menu-icon">📦</span>
          <span class="menu-text">商品管理</span>
        </div>
      </aside>

      <!-- 内容区 -->
      <main class="admin-content">
        <!-- 用户管理 -->
        <div v-if="activeMenu === 'users'" class="panel">
          <div class="panel-header">
            <span class="panel-title">用户管理</span>
            <span class="panel-count">共 {{ users.length }} 个用户</span>
          </div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>昵称</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" :key="u.id">
                  <td>{{ u.id }}</td>
                  <td>{{ u.username }}</td>
                  <td>{{ u.nickname }}</td>
                  <td>
                    <span class="tag" :class="u.role === '管理员' ? 'tag-admin' : 'tag-user'">{{ u.role }}</span>
                  </td>
                  <td>
                    <span class="tag" :class="u.status === 'normal' ? 'tag-ok' : 'tag-off'">
                      {{ u.status === 'normal' ? '正常' : '禁用' }}
                    </span>
                  </td>
                  <td>{{ u.regTime }}</td>
                  <td class="op-cell">
                    <van-button size="mini" type="primary" plain @click="toggleUser(u)">
                      {{ u.status === 'normal' ? '禁用' : '启用' }}
                    </van-button>
                    <van-button size="mini" type="danger" plain @click="removeUser(u)">删除</van-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 商品管理 -->
        <ProductManagement v-else />
        <!-- <div v-else class="panel">
          <div class="panel-header">
            <span class="panel-title">商品管理</span>
            <van-button size="small" type="danger" class="add-btn" @click="openAdd">＋ 新增商品</van-button>
          </div>
          <div class="table-wrap">
            <base-table :columns="productTableColumns" :table-data="goodsStore.goodsList.map((g) => ({
              ...g,
              actions: g
            }))" row-key="id">
              <template #operate="{ row }">
                <van-button size="mini" type="primary" plain @click="editGoods(row)">
                  编辑
                </van-button>
                <van-button size="mini" type="danger" plain @click="removeGoods(row)">删除</van-button>
              </template>
</base-table>
</div>
</div> -->
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

.panel {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1b1c;
}

.panel-count {
  font-size: 12px;
  color: #999;
}

/* 表格 */
.table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 720px;

}

.admin-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f8f9fb;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
}

.admin-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f2f3f5;
  color: #333;
}

.admin-table tr:hover td {
  background: #fafbfc;
}

/* 标签 */
.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.tag-admin {
  background: rgba(255, 77, 45, 0.1);
  color: #ff4d2d;
}

.tag-user {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.tag-ok {
  background: rgba(82, 196, 26, 0.12);
  color: #52c41a;
}

.tag-off {
  background: rgba(140, 140, 140, 0.12);
  color: #8c8c8c;
}

/* 操作列 */
.op-cell {
  white-space: nowrap;
}

.op-cell .van-button {
  margin-right: 6px;
}

/* 商品缩略图 */
.goods-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  font-size: 22px;
}

.goods-name-cell {
  max-width: 220px;
}

.price-cell {
  font-weight: 600;
  color: #ff2d4b;
}

.price-cell.origin {
  color: #b0b0b0;
  text-decoration: line-through;
  font-weight: 400;
}

.price-cell.flash {
  color: #ff4d2d;
}

.muted {
  color: #c8c9cc;
}

/* 编辑弹窗 */
.edit-popup {
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.edit-body {
  padding: 20px 0 24px;
}

.edit-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #1a1b1c;
  margin-bottom: 16px;
}

.edit-group {
  margin-bottom: 16px;
}

.edit-bg {
  padding: 0 16px;
  margin-bottom: 16px;
}

.bg-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.bg-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.bg-item {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  box-sizing: border-box;
}

.bg-item.active {
  border-color: #ff4d2d;
  box-shadow: 0 0 0 2px rgba(255, 77, 45, 0.2);
}

.edit-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f9fb;
  margin: 0 16px 16px;
  border-radius: 10px;
}

.preview-label {
  font-size: 13px;
  color: #666;
}

.preview-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.preview-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff2d4b;
}

.edit-actions {
  display: flex;
  gap: 12px;
  padding: 0 16px;
}

.cancel-btn {
  flex: 1;
  border-color: #ddd;
  color: #666;
}

.save-btn {
  flex: 1;
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  font-weight: 600;
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
