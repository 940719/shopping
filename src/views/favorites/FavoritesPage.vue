<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useUserStore } from '@/store/user';
import { getFavorites, removeFavorite } from '@/api/favorite';
import { addToCart } from '@/api/cart';

const router = useRouter();
const userStore = useUserStore();

const favList = ref([]);
const loading = ref(false);

const isImg = (v) => !!v && /^(https?:|data:)/.test(v);

const loadFavorites = async () => {
  loading.value = true;
  try {
    const res = await getFavorites();
    if (res.code === 200) favList.value = res.data || [];
  } catch (error) {
    // 401 由拦截器处理
  } finally {
    loading.value = false;
  }
};

onMounted(loadFavorites);

/* 取消收藏 */
const onRemove = (item) => {
  showConfirmDialog({
    title: '提示',
    message: `取消收藏「${item.name}」？`,
    confirmButtonColor: '#ff4d2d',
  })
    .then(async () => {
      try {
        const res = await removeFavorite(item.id);
        if (res.code === 200) {
          favList.value = favList.value.filter((i) => i.id !== item.id);
          showToast('已取消收藏');
          window.dispatchEvent(new CustomEvent('fav-changed'));
        }
      } catch (error) {
        showToast('操作失败');
      }
    })
    .catch(() => {});
};

/* 加入购物车 */
const onAddCart = async (item) => {
  if (!userStore.isLogin) {
    showToast('请先登录');
    router.push('/login');
    return;
  }
  try {
    const res = await addToCart({ productId: item.productId, quantity: 1 });
    if (res.code === 200) {
      showToast('已加入购物车');
      window.dispatchEvent(new CustomEvent('cart-changed'));
    }
  } catch (error) {
    showToast('加入失败');
  }
};

const goBack = () => router.back();
</script>

<template>
  <div class="fav-page">
    <div class="page-header">
      <div class="page-header-inner">
        <van-icon name="arrow-left" class="back-icon" @click="goBack" />
        <span class="header-title">我的收藏</span>
        <span v-if="favList.length" class="header-count">{{ favList.length }} 件</span>
      </div>
    </div>

    <div class="fav-main">
      <!-- 空态 -->
      <div v-if="!favList.length && !loading" class="empty-card">
        <van-empty description="还没有收藏商品">
          <van-button round type="danger" size="small" class="go-btn" @click="router.push('/home')">
            去逛逛
          </van-button>
        </van-empty>
      </div>

      <!-- 收藏列表 -->
      <div v-else class="fav-list">
        <div v-for="g in favList" :key="g.id" class="fav-card">
          <div class="fav-img" :style="{ background: g.bg || '#f5f6f8' }">
            <img v-if="isImg(g.emoji)" :src="g.emoji" class="fav-image" alt="" />
            <span v-else class="fav-emoji">{{ g.emoji || '📦' }}</span>
          </div>
          <div class="fav-body">
            <div class="fav-name text-ellipsis">{{ g.name }}</div>
            <div class="fav-sales">已售 {{ g.sales || 0 }}</div>
            <div class="fav-bottom">
              <div class="fav-price-row">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ g.price }}</span>
                <span v-if="g.originPrice" class="origin-price">¥{{ g.originPrice }}</span>
              </div>
              <div class="fav-btns">
                <van-button size="mini" round plain class="fav-cart-btn" @click="onAddCart(g)">
                  加购物车
                </van-button>
                <van-button size="mini" round plain class="fav-del-btn" @click="onRemove(g)">
                  取消收藏
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fav-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ===== 顶部 ===== */
.page-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 16px 16px 34px;
  color: #fff;
}
.page-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.back-icon {
  font-size: 20px;
  cursor: pointer;
}
.header-title {
  font-size: 17px;
  font-weight: 700;
}
.header-count {
  font-size: 12px;
  opacity: 0.9;
}
.fav-main {
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== 空态 ===== */
.empty-card {
  margin: 12px 12px 0;
  background: #fff;
  border-radius: 12px;
  position: relative;
  z-index: 2;
  padding: 24px 0;
}
.go-btn {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
}

/* ===== 收藏列表 ===== */
.fav-list {
  margin: 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;
  padding-bottom: 20px;
}
.fav-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.fav-img {
  width: 110px;
  height: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  overflow: hidden;
}
.fav-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fav-body {
  flex: 1;
  min-width: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.fav-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.fav-sales {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.fav-bottom {
  margin-top: 8px;
}
.fav-price-row {
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
.fav-btns {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.fav-cart-btn {
  border-color: #ff4d2d;
  color: #ff4d2d;
  font-size: 12px;
}
.fav-del-btn {
  border-color: #c8c9cc;
  color: #969799;
  font-size: 12px;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .fav-page {
    height: 100%;
    overflow-y: auto;
  }
  .page-header {
    padding: 20px 24px 44px;
  }
  .fav-main {
    padding: 0 24px 24px;
    box-sizing: border-box;
  }
  .fav-list {
    margin: 12px 0 0;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  .fav-card {
    flex: 1 1 320px;
    max-width: 480px;
  }
}
</style>
