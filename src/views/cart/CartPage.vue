<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/* 猜你喜欢（mock，后续替换为接口） */
const recommend = [
  { id: 1, name: '无线蓝牙耳机 主动降噪', emoji: '🎧', bg: 'linear-gradient(135deg,#e6f7ff,#bae7ff)', price: 199, originPrice: 299 },
  { id: 2, name: '智能保温杯 316 不锈钢', emoji: '☕', bg: 'linear-gradient(135deg,#e6fffb,#b5f5ec)', price: 79, originPrice: 119 }
]

const goShopping = () => router.push('/home')
</script>

<template>
  <div class="cart-page">
    <div class="cart-header">
      <div class="cart-header-inner">
        <span class="header-title">购物车</span>
      </div>
    </div>

    <div class="cart-main">
      <!-- 空购物车状态 -->
      <div class="empty-card">
        <van-empty image="default" description="购物车还是空的">
          <van-button round type="danger" size="small" class="go-btn" @click="goShopping">
            去逛逛
          </van-button>
        </van-empty>
      </div>

      <!-- 猜你喜欢 -->
      <div class="recommend-section">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">猜你喜欢</span>
        </div>
        <div class="recommend-grid">
          <div v-for="g in recommend" :key="g.id" class="rec-card" @click="goShopping">
            <div class="rec-img" :style="{ background: g.bg }">{{ g.emoji }}</div>
            <div class="rec-body">
              <div class="rec-name text-ellipsis">{{ g.name }}</div>
              <div class="rec-price-row">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ g.price }}</span>
                <span class="origin-price">¥{{ g.originPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.cart-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 16px 16px 34px;
  color: #fff;
}
.cart-header-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.header-title {
  font-size: 17px;
  font-weight: 700;
}
.cart-main {
  max-width: 1200px;
  margin: 0 auto;
}
.empty-card {
  margin: 12px 12px 0;
  background: #fff;
  border-radius: 12px;
  position: relative;
  z-index: 2;
  padding: 20px 0;
}
.go-btn {
  margin-top: 8px;
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
}
.recommend-section {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
}
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.title-bar {
  width: 4px;
  height: 14px;
  background: #ff4d2d;
  border-radius: 2px;
  margin-right: 6px;
}
.title-text {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}
.recommend-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rec-card {
  display: flex;
  background: #f8f9fb;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}
.rec-img {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}
.rec-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.rec-name {
  font-size: 13px;
  color: #333;
}
.rec-price-row {
  display: flex;
  align-items: baseline;
}
.price-symbol {
  font-size: 12px;
  color: #ff2d4b;
  font-weight: 700;
}
.price-num {
  font-size: 18px;
  color: #ff2d4b;
  font-weight: 700;
}
.origin-price {
  margin-left: 6px;
  font-size: 11px;
  color: #b0b0b0;
  text-decoration: line-through;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .cart-page {
    height: 100%;
    overflow-y: auto; /* PC 端页面内部滚动，body 不滚动 */
  }
  .cart-header {
    padding: 20px 24px 44px;
  }
  .cart-main {
    padding: 0 24px 24px;
    box-sizing: border-box;
  }
  .empty-card {
    margin: 12px 0 0;
    padding: 32px 0;
  }
  .recommend-section {
    margin: 16px 0 0;
    padding: 20px;
  }
  .recommend-grid {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  .rec-card {
    flex: 1 1 360px;
    max-width: 480px;
  }
}
</style>
