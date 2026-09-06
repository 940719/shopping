<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref({
  nickname: '未登录',
  desc: '登录后享受更多会员权益'
})

const orderEntries = [
  { icon: '💳', label: '待付款' },
  { icon: '📦', label: '待发货' },
  { icon: '🚚', label: '待收货' },
  { icon: '⭐', label: '待评价' },
  { icon: '🛠️', label: '退款/售后' }
]

const menuEntries = [
  { icon: '📍', label: '收货地址', color: '#ff6034' },
  { icon: '🎟️', label: '优惠券', color: '#ff2d4b' },
  { icon: '❤️', label: '我的收藏', color: '#ff85c0' },
  { icon: '⚙️', label: '设置', color: '#8c8c8c' }
]
</script>

<template>
  <div class="mine-page">
    <!-- 用户信息卡 -->
    <div class="user-card">
      <div class="user-card-inner">
        <div class="user-info">
          <div class="avatar">🙂</div>
          <div class="user-meta">
            <div class="nickname">{{ userInfo.nickname }}</div>
            <div class="desc">{{ userInfo.desc }}</div>
          </div>
          <van-button
            round
            size="small"
            color="rgba(255,255,255,0.9)"
            class="login-btn"
            @click="userInfo.nickname = '商城会员'"
          >
            登录 / 注册
          </van-button>
        </div>
      </div>
    </div>

    <div class="mine-main">
      <!-- 订单状态栏 -->
      <div class="order-card">
        <div class="order-title">
          <span>我的订单</span>
          <span class="order-more">全部订单 ›</span>
        </div>
        <div class="order-grid">
          <div v-for="o in orderEntries" :key="o.label" class="order-item">
            <span class="order-icon">{{ o.icon }}</span>
            <span class="order-label">{{ o.label }}</span>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="menu-card">
        <div v-for="m in menuEntries" :key="m.label" class="menu-item">
          <span class="menu-icon" :style="{ color: m.color }">{{ m.icon }}</span>
          <span class="menu-label">{{ m.label }}</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="version">Shopping Mall v1.0.0</div>
    </div>
  </div>
</template>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ===== 用户信息 ===== */
.user-card {
  background: linear-gradient(135deg, #ff4d2d 0%, #ff8a3d 100%);
  padding: 28px 16px 40px;
}
.user-card-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.user-info {
  display: flex;
  align-items: center;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin-right: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
}
.user-meta {
  flex: 1;
  color: #fff;
}
.nickname {
  font-size: 18px;
  font-weight: 700;
}
.desc {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
}
.login-btn {
  color: #ff4d2d !important;
  font-weight: 600;
  border: none;
}

/* ===== 内容区 ===== */
.mine-main {
  max-width: 800px;
  margin: 0 auto;
}

/* ===== 订单栏 ===== */
.order-card {
  margin: -20px 12px 0;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  position: relative;
  z-index: 2;
}
.order-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin-bottom: 12px;
}
.order-more {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}
.order-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}
.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.order-icon {
  font-size: 24px;
}
.order-label {
  font-size: 11px;
  color: #666;
}

/* ===== 功能菜单 ===== */
.menu-card {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 4px 14px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f2f3f5;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-icon {
  font-size: 20px;
  margin-right: 10px;
}
.menu-label {
  flex: 1;
  font-size: 14px;
  color: #333;
}
.menu-arrow {
  color: #c8c9cc;
  font-size: 16px;
}

.version {
  text-align: center;
  font-size: 12px;
  color: #c8c9cc;
  margin: 24px 0;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .mine-page {
    height: 100%;
    overflow-y: auto; /* PC 端页面内部滚动，body 不滚动 */
  }
  .user-card {
    padding: 40px 24px 56px;
  }
  .avatar {
    width: 72px;
    height: 72px;
    font-size: 38px;
  }
  .nickname {
    font-size: 22px;
  }
  .desc {
    font-size: 13px;
  }
  .mine-main {
    max-width: 1200px;
    padding: 0 24px 24px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: start;
  }
  .order-card {
    margin: 12px 0 0;
    padding: 20px;
  }
  .menu-card {
    margin-top: 12px;
    padding: 4px 20px;
  }
  .order-item {
    padding: 8px 0;
  }
  .order-icon {
    font-size: 30px;
  }
  .order-label {
    font-size: 13px;
  }
  .version {
    grid-column: 1 / -1;
    margin: 12px 0;
  }
}
</style>
