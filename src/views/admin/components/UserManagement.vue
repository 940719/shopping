<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import type { TableColumn } from '@/components/BaseTable/index.vue'
import type { UserData, RoleCode } from '@/api/user';
import { getUserList, ROLE_MAP } from '@/api/user';
/* ================= 用户管理（mock） ================= */
interface UserRow {
  id: number
  username: string
  nickname: string
  role: string
  status: 'normal' | 'disabled'
  regTime: string
}

const usersList = ref<UserData[]>([])

const toggleUser = (u: UserRow) => {
  u.status = u.status === 'normal' ? 'disabled' : 'normal'
  showToast(u.status === 'normal' ? '已启用' : '已禁用')
}

const removeUser = (u: UserRow) => {
  showConfirmDialog({ title: '删除用户', message: `确定删除用户「${u.nickname}」吗？` })
    .then(() => {
      usersList.value = usersList.value.filter((x) => x.id !== u.id)
      showToast('已删除')
    })
    .catch(() => { })
}

/* 角色 / 状态 / 操作列由插槽渲染，render 返回空串避免显示原始文本 */
const userTableColumns: TableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '用户名' },
  { key: 'nickname', label: '昵称' },
  { key: 'phone', label: '电话' },
  { key: 'role', label: '角色', render: () => '' },
  { key: 'status', label: '状态', render: () => '' },
  { key: 'createTime', label: '注册时间' },
  { key: 'operate', label: '操作' }
]
const initUserList = async () => {
  const res = await getUserList()
  if (res.code === 200) {
    usersList.value = res.data
  } else {
    showToast(res.msg)
  }
}
onMounted(() => {
  initUserList()
})
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">用户管理</span>
      <span class="panel-count">共 {{ usersList.length }} 个用户</span>
    </div>
    <div class="table-wrap">
      <base-table :columns="userTableColumns" :table-data="usersList" row-key="id" container-height="none">
        <template #cell-role="{ row }">
          <span>
            {{ ROLE_MAP[row.role as RoleCode] || '未知' }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <span class="tag" :class="row.status === 'normal' ? 'tag-ok' : 'tag-off'">
            {{ row.status === 'normal' ? '正常' : '禁用' }}
          </span>
        </template>
        <template #cell-operate="{ row }">
          <span class="op-cell">
            <van-button size="mini" type="primary" plain @click="toggleUser(row)">
              {{ row.status === 'normal' ? '禁用' : '启用' }}
            </van-button>
            <van-button size="mini" type="danger" plain @click="removeUser(row)">删除</van-button>
          </span>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped>
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

.table-wrap {
  overflow-x: auto;
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

/* ===== BaseTable 视觉还原：与原「用户管理」表格样式保持一致 =====
   注：选择器带 .table-wrap 祖先以提升特异性，确保覆盖 BaseTable 自身 scoped 样式 */
:deep(.table-wrap .base-table-container) {
  border: none;
  border-radius: 0;
}

:deep(.table-wrap .base-table) {
  font-size: 13px;
  min-width: 720px;
  table-layout: auto;
}

:deep(.table-wrap .base-table thead tr) {
  background-color: #f8f9fb;
}

:deep(.table-wrap .base-table th) {
  text-align: left;
  padding: 10px 12px;
  background: #f8f9fb;
  border: none;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
}

:deep(.table-wrap .base-table td) {
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid #f2f3f5;
  color: #333;
}

:deep(.table-wrap .base-table tbody tr:hover) {
  background-color: #fafbfc;
}
</style>
