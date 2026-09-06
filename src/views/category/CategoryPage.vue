<script setup lang="ts">
import { ref, computed } from 'vue'

interface CategoryGoods {
  id: number
  name: string
  emoji: string
  price: number
}

interface Category {
  id: number
  name: string
  goods: CategoryGoods[]
}

/* mock 分类数据（后续可替换为接口） */
const categories: Category[] = [
  {
    id: 1, name: '推荐',
    goods: [
      { id: 101, name: '今日爆款 无线耳机', emoji: '🎧', price: 199 },
      { id: 102, name: '车厘子 2 斤装', emoji: '🍒', price: 69 },
      { id: 103, name: '纯棉卫衣', emoji: '🧥', price: 129 },
      { id: 104, name: '空气炸锅', emoji: '🍟', price: 259 }
    ]
  },
  {
    id: 2, name: '手机数码',
    goods: [
      { id: 201, name: '智能手机 12+256G', emoji: '📱', price: 2999 },
      { id: 202, name: '蓝牙耳机 降噪', emoji: '🎧', price: 199 },
      { id: 203, name: '智能手表', emoji: '⌚', price: 899 },
      { id: 204, name: '移动电源 20000mAh', emoji: '🔋', price: 129 }
    ]
  },
  {
    id: 3, name: '服饰鞋包',
    goods: [
      { id: 301, name: '纯棉T恤 基础款', emoji: '👕', price: 59 },
      { id: 302, name: '运动跑鞋', emoji: '👟', price: 219 },
      { id: 303, name: '休闲双肩包', emoji: '🎒', price: 99 }
    ]
  },
  {
    id: 4, name: '美妆个护',
    goods: [
      { id: 401, name: '保湿精华液', emoji: '🧴', price: 89 },
      { id: 402, name: '口红 丝绒哑光', emoji: '💄', price: 79 },
      { id: 403, name: '电动牙刷', emoji: '🪥', price: 139 }
    ]
  },
  {
    id: 5, name: '食品生鲜',
    goods: [
      { id: 501, name: '进口车厘子', emoji: '🍒', price: 69 },
      { id: 502, name: '有机牛奶 12 盒', emoji: '🥛', price: 59 },
      { id: 503, name: '坚果礼盒', emoji: '🥜', price: 89 }
    ]
  },
  {
    id: 6, name: '家用电器',
    goods: [
      { id: 601, name: '空气炸锅 5L', emoji: '🍟', price: 259 },
      { id: 602, name: '破壁机 静音款', emoji: '🥤', price: 399 },
      { id: 603, name: '扫地机器人', emoji: '🤖', price: 1599 }
    ]
  }
]

const active = ref(0)
const current = computed(() => categories[active.value])

/* 左侧分类底色 */
const categoryBg = [
  'linear-gradient(135deg,#ff4d2d,#ff6034)',
  'linear-gradient(135deg,#1890ff,#36cfc9)',
  'linear-gradient(135deg,#9254de,#b37feb)',
  'linear-gradient(135deg,#ff85c0,#ffadd2)',
  'linear-gradient(135deg,#52c41a,#95de64)',
  'linear-gradient(135deg,#fa8c16,#ffc53d)'
]
</script>

<template>
  <div class="category-page">
    <div class="category-header">
      <div class="category-header-inner">
        <span class="header-title">商品分类</span>
      </div>
    </div>
    <div class="category-body">
      <!-- 左侧分类导航 -->
      <van-sidebar v-model="active" class="sidebar">
        <van-sidebar-item
          v-for="c in categories"
          :key="c.id"
          :title="c.name"
        />
      </van-sidebar>

      <!-- 右侧商品 -->
      <div class="goods-panel">
        <div class="panel-title">
          <span class="title-bar"></span>
          <span>{{ current.name }}</span>
        </div>
        <div class="panel-grid">
          <div
            v-for="g in current.goods"
            :key="g.id"
            class="cat-goods"
          >
            <div
              class="cat-goods-img"
              :style="{ background: categoryBg[active % categoryBg.length] }"
            >
              {{ g.emoji }}
            </div>
            <div class="cat-goods-name text-ellipsis">{{ g.name }}</div>
            <div class="cat-goods-price">¥{{ g.price }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}
.category-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 16px 16px 34px;
  color: #fff;
}
.category-header-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.header-title {
  font-size: 17px;
  font-weight: 700;
}
.category-body {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
  box-sizing: border-box;
}
.sidebar {
  width: 88px;
  flex-shrink: 0;
  border-radius: 0 12px 0 0;
  overflow: hidden;
}
.sidebar :deep(.van-sidebar-item) {
  padding: 14px 8px;
  font-size: 13px;
}
.sidebar :deep(.van-sidebar-item--select) {
  color: #ff4d2d;
  font-weight: 600;
  background: #f5f7fa;
}
.sidebar :deep(.van-sidebar-item--select::before) {
  background: #ff4d2d;
}
.goods-panel {
  flex: 1;
  background: #fff;
  margin: 0 10px 10px 0;
  border-radius: 12px;
  padding: 12px;
  min-height: 400px;
}
.panel-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin-bottom: 10px;
}
.title-bar {
  width: 4px;
  height: 14px;
  background: #ff4d2d;
  border-radius: 2px;
  margin-right: 6px;
}
.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.cat-goods {
  background: #f8f9fb;
  border-radius: 10px;
  padding: 8px;
}
.cat-goods-img {
  height: 72px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}
.cat-goods-name {
  font-size: 12px;
  color: #333;
  margin-top: 6px;
}
.cat-goods-price {
  font-size: 14px;
  color: #ff2d4b;
  font-weight: 700;
  margin-top: 2px;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .category-page {
    height: 100%;
    overflow-y: auto; /* PC 端页面内部滚动，body 不滚动 */
  }
  .category-header {
    padding: 20px 24px 44px;
  }
  .category-body {
    padding: 0 24px 24px;
    min-height: 480px;
  }
  .sidebar {
    width: 160px;
    border-radius: 12px;
    overflow: hidden;
  }
  .sidebar :deep(.van-sidebar-item) {
    padding: 18px 14px;
    font-size: 14px;
  }
  .goods-panel {
    margin: 16px 0 0 16px;
    padding: 20px;
  }
  .panel-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }
  .cat-goods-img {
    height: 120px;
    font-size: 48px;
  }
  .cat-goods-name {
    font-size: 13px;
    margin-top: 8px;
  }
  .cat-goods-price {
    font-size: 16px;
    margin-top: 4px;
  }
}
</style>
