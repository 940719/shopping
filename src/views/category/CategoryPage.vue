<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getCategoryList } from '@/api/category';
import { getProductList } from '@/api/product';
import { addToCart } from '@/api/cart';
import { isImgUrl } from '@/utils/img';
import { useUserStore } from '@/store/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

/* ================= 分类数据：来自商品类型接口 ================= */
const categories = ref([]);
const active = ref(0);
const goodsList = ref([]);
const loading = ref(false);

const current = computed(() => categories.value[active.value] || {});

/* 左侧分类底色（按索引循环取色） */
const categoryBg = [
  'linear-gradient(135deg,#ff4d2d,#ff6034)',
  'linear-gradient(135deg,#1890ff,#36cfc9)',
  'linear-gradient(135deg,#9254de,#b37feb)',
  'linear-gradient(135deg,#ff85c0,#ffadd2)',
  'linear-gradient(135deg,#52c41a,#95de64)',
  'linear-gradient(135deg,#fa8c16,#ffc53d)',
];

/* 根据类型 id 关联查询商品 */
const loadGoods = async (type) => {
  loading.value = true;
  try {
    const { code, data } = await getProductList(type);
    if (code === 200) {
      goodsList.value = data;
    } else {
      goodsList.value = [];
    }
  } catch (error) {
    console.error('获取商品失败：', error);
    goodsList.value = [];
  } finally {
    loading.value = false;
  }
};

/* 切换分类：按所选类型加载商品 */
const onSelect = (index) => {
  active.value = index;
  const c = categories.value[index];
  if (c) loadGoods(String(c.id));
};

/* ===== PC「更多」二级菜单：超过 6 个分类时收起为「更多」按钮 ===== */
const PC_BREAKPOINT = 768;
const isPC = ref(false);
const moreOpen = ref(false);

const updatePC = () => {
  isPC.value = window.innerWidth >= PC_BREAKPOINT;
};

/* 左侧列表：PC 只展示前 6 个，移动端展示全部 */
const sidebarList = computed(() => (isPC.value ? categories.value.slice(0, 6) : categories.value));
/* 「更多」菜单里的剩余分类 */
const restCategories = computed(() => categories.value.slice(6));
/* 当前选中的分类在剩余列表里时，「更多」按钮保持高亮 */
const moreActive = computed(() => isPC.value && active.value >= 6);

const selectFromMore = (index) => {
  active.value = index;
  const c = categories.value[index];
  if (c) loadGoods(String(c.id));
  moreOpen.value = false;
};

/* ===== 商品卡片：点击进详情 ===== */
const goDetail = (g) => {
  router.push(`/product/${g.id}`);
};

/* ===== 商品卡片：加入购物车 ===== */
const addingId = ref(null);
const onAddCart = async (g, e) => {
  e && e.stopPropagation();
  if (!userStore.isLogin) {
    showToast('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  addingId.value = g.id;
  try {
    const res = await addToCart({ productId: g.id, quantity: 1 });
    if (res.code === 200) {
      showToast('已加入购物车');
      window.dispatchEvent(new CustomEvent('cart-changed'));
    }
  } catch (error) {
    showToast('加入失败');
  } finally {
    addingId.value = null;
  }
};

/* 点击「更多」菜单外部时收起 */
const closeMore = (e) => {
  if (moreOpen.value && !e.target.closest('.sidebar-wrap')) {
    moreOpen.value = false;
  }
};

onMounted(async () => {
  updatePC();
  window.addEventListener('resize', updatePC);
  document.addEventListener('click', closeMore);
  try {
    const { code, data } = await getCategoryList({ pageNum: 1, pageSize: 100 });
    if (code === 200 && data.list?.length) {
      categories.value = data.list;
      // 默认加载第一个分类的商品
      loadGoods(String(data.list[0].id));
    }
  } catch (error) {
    console.error('获取分类失败：', error);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePC);
  document.removeEventListener('click', closeMore);
});
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
      <div class="sidebar-wrap">
        <van-sidebar v-model="active" class="sidebar" @change="onSelect">
          <van-sidebar-item v-for="c in sidebarList" :key="c.id" :title="c.name" />
        </van-sidebar>

        <!-- PC：分类超过 6 个时，收起为「更多」按钮 -->
        <div
          v-if="isPC && categories.length > 6"
          class="more-btn"
          :class="{ active: moreActive }"
          @click="moreOpen = !moreOpen"
        >
          <span>更多</span>
          <i class="more-arrow" :class="{ open: moreOpen }"></i>
        </div>

        <!-- 「更多」二级菜单：展示剩余分类 -->
        <div v-if="moreOpen" class="more-panel">
          <div
            v-for="(c, i) in restCategories"
            :key="c.id"
            class="more-item"
            :class="{ selected: active === i + 6 }"
            @click="selectFromMore(i + 6)"
          >
            {{ c.name }}
          </div>
        </div>
      </div>

      <!-- 右侧商品 -->
      <div class="goods-panel">
        <div class="panel-title">
          <span class="title-bar"></span>
          <span>{{ current.name }}</span>
        </div>
        <div class="panel-grid">
          <div v-for="g in goodsList" :key="g.id" class="cat-goods" @click="goDetail(g)">
            <div
              class="cat-goods-img"
              :style="{ background: categoryBg[active % categoryBg.length] }"
            >
              <img v-if="isImgUrl(g.emoji)" :src="g.emoji" class="cat-goods-image" alt="" />
              <span v-else>{{ g.emoji }}</span>
            </div>
            <div class="cat-goods-name text-ellipsis">{{ g.name }}</div>
            <div class="cat-goods-bottom">
              <div class="cat-goods-price">¥{{ g.price }}</div>
              <van-icon
                name="cart-o"
                class="cat-goods-cart"
                :class="{ loading: addingId === g.id }"
                @click.stop="onAddCart(g, $event)"
              />
            </div>
          </div>
          <div v-if="loading" class="cat-empty">加载中...</div>
          <div v-else-if="!goodsList.length" class="cat-empty">该分类暂无商品</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 移动端（默认）：整页锁定视口高度，滚动收敛到左侧列表 / 右侧商品区 ========== */
.category-page {
  height: calc(100vh - 50px); /* 视口高度减去底部 TabBar(50px)，整页不滚动 */
  min-height: 0;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.category-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 16px 16px 34px;
  color: #fff;
  flex-shrink: 0; /* 头部不压缩，不参与滚动 */
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
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%!important;
  box-sizing: border-box;
}
/* 左侧分类列表：独立滚动，不再带动整页滚动 */
.sidebar-wrap {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin; /* Firefox：细滚动条 */
  scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
}
/* 自定义虚拟滚动条：细条 + 半透明圆角，替代原生粗滚动条 */
.sidebar-wrap::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.sidebar-wrap::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-wrap::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 4px;
}
.sidebar-wrap::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.32);
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
/* 右侧商品区：商品多时独立滚动 */
.goods-panel {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin; /* Firefox：细滚动条 */
  scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
}
.goods-panel::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.goods-panel::-webkit-scrollbar-track {
  background: transparent;
}
.goods-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 4px;
}
.goods-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.32);
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
  cursor: pointer;
  transition: transform 0.15s;
}
.cat-goods:active {
  transform: scale(0.97);
}
.cat-goods-img {
  height: 72px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  overflow: hidden;
}
.cat-goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cat-goods-name {
  font-size: 12px;
  color: #333;
  margin-top: 6px;
}
.cat-goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.cat-goods-price {
  font-size: 14px;
  color: #ff2d4b;
  font-weight: 700;
}
.cat-goods-cart {
  font-size: 18px;
  color: #ff4d2d;
  background: #ffece8;
  border-radius: 50%;
  padding: 5px;
  box-sizing: content-box;
}
.cat-goods-cart.loading {
  opacity: 0.5;
  pointer-events: none;
}
.cat-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 32px 0;
  font-size: 13px;
  color: #999;
}

/* ========== PC 响应式（≥768px）：恢复整页内部滚动布局 ========== */
@media (min-width: 768px) {
  .category-page {
    height: 100%;
    min-height: 0;
    display: block; /* 撤销移动端 flex 纵向布局，恢复 PC 整页内部滚动 */
    overflow-y: auto;
  }
  .category-header {
    padding: 20px 24px 44px;
    flex-shrink: 0;
  }
  .category-body {
    display: flex;
    overflow: visible; /* 撤销移动端内部滚动，PC 页面整体滚动 */
    padding: 0 24px 24px;
    min-height: 480px;
  }
  .sidebar {
    width: 160px;
    border-radius: 12px;
    overflow: hidden;
  }
  .sidebar-wrap {
    height: auto; /* 撤销移动端撑满+滚动，PC 随内容 */
    overflow: visible;
    position: relative; /* 二级菜单浮层定位锚点 */
    flex-shrink: 0;
    align-self: flex-start;
  }
  .more-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 14px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
  }
  .more-btn.active {
    color: #ff4d2d;
    font-weight: 600;
  }
  .more-arrow {
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    transition: transform 0.2s;
  }
  .more-arrow.open {
    transform: rotate(180deg);
  }
  .more-panel {
    position: absolute;
    top: 20px;
    left: 100%; /* 从侧边栏右侧展开，避免向下超出视口 */
    margin-left: 8px;
    z-index: 30;
    width: 160px;
    max-height: 360px;
    overflow-y: auto; /* 剩余分类较多时菜单内独立滚动 */
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    padding: 6px 0;
  }
  .more-panel::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .more-panel::-webkit-scrollbar-track {
    background: transparent;
  }
  .more-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.18);
    border-radius: 4px;
  }
  .more-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .more-item:hover {
    background: #f5f7fa;
    color: #ff4d2d;
  }
  .more-item.selected {
    color: #ff4d2d;
    font-weight: 600;
    background: #fff5f3;
  }
  .sidebar :deep(.van-sidebar-item) {
    padding: 18px 14px;
    font-size: 14px;
  }
  .goods-panel {
    margin: 16px 0 0 16px;
    padding: 20px;
    height: 100%;
    min-height: 0;
    overflow-y: auto; /* 商品多时独立滚动 */
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
  }
}
</style>
