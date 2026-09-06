<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ---------- 响应式视口（PC / 移动） ---------- */
const isPc = ref(false)
let mq: MediaQueryList | null = null

const updateViewport = () => {
  isPc.value = mq ? mq.matches : window.innerWidth >= 768
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 768px)')
  updateViewport()
  mq.addEventListener('change', updateViewport)
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', updateViewport)
})

/* 金刚区列数：移动端 4 列，PC 端 8 列一行 */
const gridColumns = computed(() => (isPc.value ? 8 : 4))

/* ---------- 搜索 ---------- */
const keyword = ref('')

const onSearch = (val: string) => {
  // 演示：跳转到分类页（后续可接商品搜索页）
  router.push({ path: '/category', query: { keyword: val } })
}

/* ---------- 轮播 Banner ---------- */
const banners = [
  { id: 1, title: '开学季焕新', sub: '全场低至 5 折', emoji: '🎒', bg: 'linear-gradient(135deg,#ff6a3d,#ff2d55)' },
  { id: 2, title: '数码狂欢周', sub: '爆款直降 300 元', emoji: '📱', bg: 'linear-gradient(135deg,#36cfc9,#1890ff)' },
  { id: 3, title: '生鲜好物节', sub: '每日 0 点开抢', emoji: '🥬', bg: 'linear-gradient(135deg,#73d13d,#13c2c2)' }
]

/* ---------- 金刚区（分类入口） ---------- */
const gridEntries = [
  { icon: '🏷️', label: '限时秒杀', color: '#ff2d4b' },
  { icon: '🔥', label: '今日推荐', color: '#ff6034' },
  { icon: '📱', label: '手机数码', color: '#1890ff' },
  { icon: '👕', label: '服饰鞋包', color: '#9254de' },
  { icon: '💄', label: '美妆个护', color: '#ff85c0' },
  { icon: '🍎', label: '食品生鲜', color: '#52c41a' },
  { icon: '🏠', label: '家用电器', color: '#fa8c16' },
  { icon: '🎁', label: '领券中心', color: '#f5222d' }
]

/* ---------- 推荐商品（mock 数据，后续可替换为接口） ---------- */
interface Goods {
  id: number
  name: string
  emoji: string
  bg: string
  price: number
  originPrice: number
  sales: number
}

const goodsList: Goods[] = [
  { id: 1, name: '无线蓝牙耳机 主动降噪 长续航', emoji: '🎧', bg: 'linear-gradient(135deg,#e6f7ff,#bae7ff)', price: 199, originPrice: 299, sales: 12000 },
  { id: 2, name: '智能手环 心率监测 50 米防水', emoji: '⌚', bg: 'linear-gradient(135deg,#f0f5ff,#d6e4ff)', price: 159, originPrice: 229, sales: 8600 },
  { id: 3, name: '纯棉卫衣 情侣款 宽松百搭', emoji: '🧥', bg: 'linear-gradient(135deg,#fff7e6,#ffe7ba)', price: 129, originPrice: 189, sales: 15000 },
  { id: 4, name: '保湿精华液 烟酰胺 提亮肤色', emoji: '🧴', bg: 'linear-gradient(135deg,#fff0f6,#ffd6e7)', price: 89, originPrice: 139, sales: 21000 },
  { id: 5, name: '进口车厘子 JJ 级 2 斤装', emoji: '🍒', bg: 'linear-gradient(135deg,#fff1f0,#ffccc7)', price: 69, originPrice: 99, sales: 32000 },
  { id: 6, name: '空气炸锅 5L 无油低脂 智能控温', emoji: '🍟', bg: 'linear-gradient(135deg,#f6ffed,#d9f7be)', price: 259, originPrice: 399, sales: 5800 },
  { id: 7, name: '运动跑鞋 轻便透气 缓震回弹', emoji: '👟', bg: 'linear-gradient(135deg,#f4f0ff,#efdbff)', price: 219, originPrice: 329, sales: 9800 },
  { id: 8, name: '智能保温杯 316 不锈钢 24 小时保温', emoji: '☕', bg: 'linear-gradient(135deg,#e6fffb,#b5f5ec)', price: 79, originPrice: 119, sales: 17000 }
]

/* ---------- 秒杀倒计时（演示用静态值） ---------- */
const countdown = '12:30:00'

const goCategory = () => router.push('/category')
const addToCart = (goods: Goods) => {
  // 演示：加入购物车（后续接 Pinia 购物车状态）
  console.log('加入购物车：', goods.name)
}
</script>

<template>
  <div class="home-page">
    <!-- 顶部搜索栏（移动端显示，PC 端由顶部导航承担） -->
    <div class="header">
      <div class="header-inner">
        <div class="search-wrap">
          <van-search
            v-model="keyword"
            shape="round"
            placeholder="搜索商品，如：耳机"
            background="transparent"
            @search="onSearch"
          />
        </div>
      </div>
    </div>

    <!-- 主内容区（PC 端 1200px 居中） -->
    <div class="home-main">
      <!-- 轮播 Banner -->
      <div class="banner-wrap">
        <van-swipe class="banner-swipe" :autoplay="3500" indicator-color="white" lazy-render>
          <van-swipe-item v-for="b in banners" :key="b.id">
            <div class="banner-card" :style="{ background: b.bg }">
              <div class="banner-info">
                <div class="banner-title">{{ b.title }}</div>
                <div class="banner-sub">{{ b.sub }}</div>
              </div>
              <div class="banner-emoji">{{ b.emoji }}</div>
            </div>
          </van-swipe-item>
        </van-swipe>
      </div>

      <!-- 金刚区：分类入口 -->
      <div class="grid-card">
        <van-grid :column-num="gridColumns" :border="false" class="grid">
          <van-grid-item
            v-for="g in gridEntries"
            :key="g.label"
            @click="goCategory"
          >
            <div class="grid-icon" :style="{ color: g.color }">{{ g.icon }}</div>
            <span class="grid-label">{{ g.label }}</span>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 限时秒杀 -->
      <div class="flash-card" @click="goCategory">
        <div class="flash-left">
          <span class="flash-title">限时秒杀</span>
          <span class="flash-end">距结束 {{ countdown }}</span>
        </div>
        <div class="flash-more">更多 ›</div>
      </div>

      <!-- 商品推荐 -->
      <div class="goods-section">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">为你推荐</span>
          <span class="title-sub">猜你喜欢 · 品质好物</span>
        </div>
        <div class="goods-grid">
          <div v-for="g in goodsList" :key="g.id" class="goods-card">
            <div class="goods-img" :style="{ background: g.bg }">
              <span class="goods-emoji">{{ g.emoji }}</span>
            </div>
            <div class="goods-body">
              <div class="goods-name text-ellipsis">{{ g.name }}</div>
              <div class="goods-price-row">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ g.price }}</span>
                <span class="origin-price">¥{{ g.originPrice }}</span>
              </div>
              <div class="goods-bottom">
                <span class="goods-sales">已售 {{ g.sales > 10000 ? (g.sales / 10000).toFixed(1) + '万' : g.sales }}</span>
                <button class="cart-btn" @click.stop="addToCart(g)">
                  <van-icon name="cart-o" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部留白 -->
    <div class="bottom-space"></div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ===== 顶部搜索 ===== */
.header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 85%, transparent 100%);
  padding: 8px 12px 28px;
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.search-wrap :deep(.van-search) {
  padding: 0;
}
.search-wrap :deep(.van-search__content) {
  border-radius: 22px;
  background: #fff;
}

/* ===== 主内容区 ===== */
.home-main {
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== 轮播 ===== */
.banner-wrap {
  margin: 10px 12px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}
.banner-swipe {
  border-radius: 12px;
  height: 130px;
}
.banner-card {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: #fff;
}
.banner-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
}
.banner-sub {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.9;
}
.banner-emoji {
  font-size: 52px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
}

/* ===== 金刚区 ===== */
.grid-card {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 6px 0;
}
.grid {
  background: transparent;
}
.grid-icon {
  font-size: 26px;
  margin-bottom: 4px;
}
.grid-label {
  font-size: 12px;
  color: #333;
}

/* ===== 秒杀 ===== */
.flash-card {
  margin: 0 12px 12px;
  background: linear-gradient(90deg, #ff2d4b, #ff5a3c);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
}
.flash-title {
  font-size: 16px;
  font-weight: 700;
}
.flash-end {
  margin-left: 10px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
  border-radius: 10px;
}
.flash-more {
  font-size: 13px;
  opacity: 0.9;
}

/* ===== 商品推荐 ===== */
.goods-section {
  margin: 0 12px;
}
.section-title {
  display: flex;
  align-items: center;
  padding: 12px 0 10px;
}
.title-bar {
  width: 4px;
  height: 16px;
  background: #ff4d2d;
  border-radius: 2px;
  margin-right: 8px;
}
.title-text {
  font-size: 17px;
  font-weight: 700;
  color: #222;
}
.title-sub {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.goods-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}
.goods-img {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.goods-emoji {
  font-size: 52px;
}
.goods-body {
  padding: 8px 10px 10px;
}
.goods-name {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  min-height: 36px;
}
.goods-price-row {
  margin-top: 6px;
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
.goods-bottom {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goods-sales {
  font-size: 11px;
  color: #999;
}
.cart-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d2d, #ff6034);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.bottom-space {
  height: 20px;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  /* 页面容器作为滚动容器，滚动条出现在 home-page 区域 */
  .home-page {
    height: 100%;
    overflow-y: auto;
    padding-bottom: 20px;
  }
  /* 顶部搜索栏由 PC 导航承担，隐藏页面内搜索栏 */
  .header {
    display: none;
  }
  .home-main {
    padding: 20px 24px;
    box-sizing: border-box;
  }
  /* 轮播更高 */
  .banner-wrap {
    margin: 0 0 16px;
  }
  .banner-swipe,
  .banner-card {
    height: 260px;
  }
  .banner-title {
    font-size: 32px;
  }
  .banner-sub {
    font-size: 16px;
  }
  .banner-emoji {
    font-size: 84px;
  }
  /* 金刚区、秒杀 */
  .grid-card {
    margin: 0 0 16px;
    padding: 12px 0;
  }
  .grid-icon {
    font-size: 30px;
  }
  .grid-label {
    font-size: 13px;
  }
  .flash-card {
    margin: 0 0 20px;
    padding: 14px 20px;
  }
  /* 商品网格自适应多列 */
  .goods-section {
    margin: 0;
  }
  .goods-grid {
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
  }
  .goods-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  .goods-img {
    height: 200px;
  }
  .goods-emoji {
    font-size: 68px;
  }
  .goods-name {
    font-size: 14px;
    min-height: 40px;
  }
  .bottom-space {
    height: 40px;
  }
}
</style>
