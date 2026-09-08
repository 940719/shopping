<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
// import { useGoodsStore, type Goods } from '@/store/goods'
import { getProductList ,type Product } from '@/api/product'
const router = useRouter()
// const goodsStore = useGoodsStore()

/* ---------- 响应式视口（PC / 移动） ---------- */
const isPc = ref(false)
let mq: MediaQueryList | null = null

const updateViewport = () => {
  isPc.value = mq ? mq.matches : window.innerWidth >= 768
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 768px)');
  updateViewport();
  mq.addEventListener('change', updateViewport);
  initProductList();
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', updateViewport)
})

/* 金刚区列数：移动端 4 列，PC 端 8 列一行 */
const gridColumns = computed(() => (isPc.value ? 8 : 4))

/* ---------- 推荐商品（来自全局 store，管理后台修改后实时生效） ---------- */
// const goodsList = computed(() => goodsStore.goodsList)

const goodsList = ref<Product[]>([]);


const initProductList= async() =>{
  try {
    const {code, data} = await getProductList()

    if(code !== 200) {
      console.error('获取商品列表失败，状态码：', code);
            return;
        }
    goodsList.value = data;
    console.log('商品列表：', data);
    } catch (error) {
        console.error('获取商品列表失败：', error);
    }
};

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

/* ---------- 秒杀倒计时（演示用静态值） ---------- */
const countdown = '12:30:00'

const goCategory = () => router.push('/category')
const addToCart = (goods: Product) => {
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
            <div class="goods-img">
              <img v-if="g.image" :src="g.image" class="goods-image" alt="" />
              <span v-else class="goods-emoji">📦</span>
            </div>
            <div class="goods-body">
              <div class="goods-name text-ellipsis">{{ g.name }}</div>
              <div class="goods-price-row">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ g.price }}</span>
                <span v-if="g.seckillPrice" class="seckill-tag">秒杀 ¥{{ g.seckillPrice }}</span>
              </div>
              <div class="goods-bottom">
                <span class="goods-type">{{ g.type || '好物' }}</span>
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

/* ===== 秒杀商品 ===== */
.flash-goods {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin: 0 12px 12px;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.flash-goods::-webkit-scrollbar {
  display: none;
}
.flash-item {
  flex: 0 0 108px;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  box-sizing: border-box;
}
.flash-img {
  height: 78px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}
.flash-name {
  font-size: 12px;
  color: #333;
  margin-top: 6px;
}
.flash-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 4px;
}
.flash-symbol {
  font-size: 11px;
  color: #ff2d4b;
  font-weight: 700;
}
.flash-price {
  font-size: 16px;
  color: #ff2d4b;
  font-weight: 700;
}
.flash-origin {
  margin-left: 6px;
  font-size: 10px;
  color: #b0b0b0;
  text-decoration: line-through;
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
  overflow: hidden;
}
.goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
.seckill-tag {
  margin-left: 6px;
  font-size: 11px;
  color: #fff;
  background: #ff2d4b;
  border-radius: 8px;
  padding: 1px 6px;
}
.goods-type {
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
