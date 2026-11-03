<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '@/store/user';
import { getProductById } from '@/api/product';
import { getCartList, addToCart } from '@/api/cart';
import { getReviewList, postReview } from '@/api/review';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const productId = computed(() => Number(route.params.id));

/* ================= 商品数据 ================= */
const product = ref(null);
const loading = ref(true);

const isImg = (v) => !!v && /^(https?:|data:)/.test(v);

/* 展示价：秒杀价 > 售价（取 flashPrice 有值且非 0 时优先展示，否则用 price） */
const showPrice = computed(() => {
  const p = product.value;
  if (!p) return '0';
  const flash = Number(p.flashPrice);
  if (p.flashPrice && flash > 0) return flash;
  return p.price;
});

/* 轮播图：优先关联表图集（product_image），没有则用主表单图 emoji，都没有才回退 emoji 文本 */
const galleryImages = computed(() => {
  const p = product.value;
  const list = Array.isArray(p?.images) ? p.images.filter(isImg) : [];
  if (list.length) return list;
  return p && isImg(p.emoji) ? [p.emoji] : [];
});

const loadProduct = async () => {
  loading.value = true;
  try {
    const res = await getProductById(productId.value);
    if (res.code === 200) {
      product.value = res.data;
    } else {
      showToast(res.msg || '商品不存在');
      router.replace('/home');
    }
  } catch (error) {
    showToast('加载失败，请重试');
    router.replace('/home');
  } finally {
    loading.value = false;
  }
};

/* ================= 数量 ================= */
const quantity = ref(1);
const onQuantityChange = (v) => {
  quantity.value = Math.max(1, Math.min(v, product.value?.stock || 999));
};

/* ================= 购物车 ================= */
const cartCount = ref(0);
const loadCartCount = async () => {
  if (!userStore.isLogin) return;
  try {
    const res = await getCartList();
    if (res.code === 200) {
      cartCount.value = (res.data || []).reduce((s, i) => s + i.quantity, 0);
    }
  } catch (error) {
    /* 静默 */
  }
};

/* 未登录统一引导（保留回跳地址） */
const requireLogin = () => {
  if (userStore.isLogin) return true;
  showToast('请先登录');
  router.push({ path: '/login', query: { redirect: route.fullPath } });
  return false;
};

/* 加入购物车 */
const adding = ref(false);
const onAddCart = async () => {
  if (!requireLogin()) return;
  adding.value = true;
  try {
    const res = await addToCart({ productId: productId.value, quantity: quantity.value });
    if (res.code === 200) {
      showToast('已加入购物车');
      window.dispatchEvent(new CustomEvent('cart-changed'));
      loadCartCount();
    }
  } catch (error) {
    showToast('加入购物车失败');
  } finally {
    adding.value = false;
  }
};

/* 立即购买：加购后直接进入购物车结算 */
const onBuyNow = async () => {
  if (!requireLogin()) return;
  adding.value = true;
  try {
    const res = await addToCart({ productId: productId.value, quantity: quantity.value });
    if (res.code === 200) {
      window.dispatchEvent(new CustomEvent('cart-changed'));
      showToast('已加入，去结算');
      router.push('/cart');
    }
  } catch (error) {
    showToast('操作失败');
  } finally {
    adding.value = false;
  }
};

const goCart = () => {
  if (userStore.isLogin) {
    router.push('/cart');
  } else {
    router.push({ path: '/login', query: { redirect: '/cart' } });
  }
};

/* ================= 评价 ================= */
const reviews = ref([]);
const reviewTotal = ref(0);
const reviewAvg = ref(0);

const loadReviews = async () => {
  try {
    const res = await getReviewList(productId.value);
    if (res.code === 200) {
      reviews.value = res.data.list || [];
      reviewTotal.value = res.data.total || 0;
      reviewAvg.value = res.data.avgRating || 0;
    }
  } catch (error) {
    /* 静默 */
  }
};

/* 提交评价 */
const showReviewForm = ref(false);
const reviewRating = ref(5);
const reviewContent = ref('');
const submitting = ref(false);

const openReviewForm = () => {
  if (!requireLogin()) return;
  showReviewForm.value = true;
};

const onSubmitReview = async () => {
  if (!reviewContent.value.trim()) {
    showToast('请填写评价内容');
    return;
  }
  submitting.value = true;
  try {
    const res = await postReview({
      productId: productId.value,
      rating: reviewRating.value,
      content: reviewContent.value.trim(),
    });
    if (res.code === 200) {
      showToast('评价成功');
      showReviewForm.value = false;
      reviewContent.value = '';
      reviewRating.value = 5;
      loadReviews();
    }
  } catch (error) {
    showToast('提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

/* 时间显示：只保留年月日 */
const fmtTime = (t) => (t ? String(t).slice(0, 10) : '');

onMounted(() => {
  loadProduct();
  loadReviews();
  loadCartCount();
  window.addEventListener('cart-changed', loadCartCount);
});
</script>

<template>
  <div class="detail-page">
    <!-- 顶部：返回 + 标题 -->
    <div class="detail-header">
      <div class="detail-header-inner">
        <van-icon name="arrow-left" class="back-icon" @click="router.back()" />
        <span class="header-title">商品详情</span>
        <span class="header-spacer"></span>
      </div>
    </div>

    <div class="detail-main">
      <!-- 商品图：多图轮播（关联表 product_image），无图集则回退单图 -->
      <div class="goods-img-card" :style="{ background: product?.bg || '#f5f6f8' }">
        <van-swipe v-if="galleryImages.length" class="detail-swipe" indicator-color="#fff" lazy-render>
          <van-swipe-item v-for="(img, i) in galleryImages" :key="i">
            <img :src="img" class="goods-image" alt="" />
          </van-swipe-item>
        </van-swipe>
        <template v-else>
          <img v-if="product && isImg(product.emoji)" :src="product.emoji" class="goods-image" alt="" />
          <span v-else class="goods-emoji">{{ product?.emoji || '📦' }}</span>
        </template>
      </div>

      <!-- 商品信息 -->
      <div class="info-card">
        <div class="price-row">
          <span class="price-symbol">¥</span>
          <span class="price-num">{{ showPrice }}</span>
          <span v-if="product?.originPrice && Number(product.originPrice) > Number(showPrice)" class="origin-price">
            ¥{{ product.originPrice }}
          </span>
          <span v-if="product?.flashPrice && Number(product.flashPrice) > 0" class="flash-tag">秒杀价</span>
        </div>
        <div class="goods-name">{{ product?.name }}</div>
        <div v-if="product?.desc" class="goods-desc">{{ product.desc }}</div>
        <div class="meta-row">
          <span>销量 {{ product?.sales || 0 }}</span>
          <span v-if="product">库存 {{ product.stock }}</span>
        </div>
      </div>

      <!-- 数量选择 -->
      <div class="qty-card">
        <span class="qty-label">购买数量</span>
        <van-stepper
          :model-value="quantity"
          :min="1"
          :max="product?.stock || 999"
          integer
          theme="round"
          button-size="26"
          @update:model-value="onQuantityChange"
        />
      </div>

      <!-- 商品介绍（关联表 product_intro：文字/图片条目混排） -->
      <div v-if="product?.intro?.length" class="intro-card">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">商品介绍</span>
        </div>
        <div class="intro-body">
          <template v-for="(it, i) in product.intro" :key="i">
            <p v-if="it.type === 'text' && it.content" class="intro-text">{{ it.content }}</p>
            <img v-else-if="it.type === 'image' && isImg(it.imageUrl)" :src="it.imageUrl" class="intro-image" alt="" />
          </template>
        </div>
      </div>

      <!-- 评价区 -->
      <div class="review-card">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">商品评价</span>
          <span v-if="reviewTotal" class="review-count">({{ reviewTotal }})</span>
        </div>

        <!-- 平均分概览 -->
        <div v-if="reviewTotal" class="avg-row">
          <span class="avg-num">{{ reviewAvg }}</span>
          <van-rate
            :model-value="Math.round(reviewAvg)"
            readonly
            allow-half
            color="#ffb400"
            size="16"
          />
          <span class="avg-text">综合评分</span>
        </div>

        <!-- 评价列表 -->
        <div v-if="reviews.length" class="review-list">
          <div v-for="r in reviews" :key="r.id" class="review-item">
            <div class="review-top">
              <span class="review-user">👤 {{ r.userName }}</span>
              <van-rate :model-value="r.rating" readonly size="12" color="#ffb400" />
              <span class="review-time">{{ fmtTime(r.createTime) }}</span>
            </div>
            <div class="review-content">{{ r.content }}</div>
          </div>
        </div>
        <div v-else class="review-empty">
          <span>暂无评价，快来抢首评吧～</span>
        </div>

        <!-- 发表评价入口 / 表单 -->
        <div v-if="!showReviewForm" class="review-form-entry">
          <van-button round size="small" type="danger" plain class="review-open-btn" @click="openReviewForm">
            {{ userStore.isLogin ? '发表评价' : '登录后评价' }}
          </van-button>
        </div>
        <div v-else class="review-form">
          <div class="form-row">
            <span class="form-label">评分</span>
            <van-rate v-model="reviewRating" color="#ffb400" />
          </div>
          <van-field
            v-model="reviewContent"
            type="textarea"
            rows="2"
            maxlength="200"
            show-word-limit
            placeholder="说说这个商品的使用感受吧～"
            class="review-input"
          />
          <div class="form-actions">
            <van-button round size="small" @click="showReviewForm = false">取消</van-button>
            <van-button round size="small" type="danger" :loading="submitting" class="submit-btn" @click="onSubmitReview">
              提交评价
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="detail-footer">
      <div class="footer-cart" @click="goCart">
        <van-icon name="cart-o" class="cart-icon" />
        <span class="cart-label">购物车</span>
        <span v-if="cartCount" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
      </div>
      <van-button round class="add-btn" :loading="adding" @click="onAddCart">
        加入购物车
      </van-button>
      <van-button round class="buy-btn" :loading="adding" @click="onBuyNow">
        立即购买
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 76px; /* 底部操作栏高度 */
}
.detail-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 14px 16px 34px;
  color: #fff;
}
.detail-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}
.back-icon {
  font-size: 22px;
  padding: 4px;
  cursor: pointer;
}
.header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
}
.header-spacer {
  width: 30px;
}
.detail-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
  box-sizing: border-box;
}

/* 商品图 */
.goods-img-card {
  border-radius: 12px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 2;
}
.detail-swipe {
  width: 100%;
  height: 100%;
}
.goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.goods-emoji {
  font-size: 96px;
}

/* 信息卡 */
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.price-row {
  display: flex;
  align-items: baseline;
}
.price-symbol {
  font-size: 14px;
  color: #ff2d4b;
  font-weight: 700;
}
.price-num {
  font-size: 28px;
  color: #ff2d4b;
  font-weight: 700;
}
.origin-price {
  margin-left: 8px;
  font-size: 13px;
  color: #b0b0b0;
  text-decoration: line-through;
}
.flash-tag {
  margin-left: 8px;
  font-size: 11px;
  color: #fff;
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  padding: 2px 6px;
  border-radius: 4px;
}
.goods-name {
  font-size: 17px;
  font-weight: 700;
  color: #222;
  margin-top: 10px;
  line-height: 1.4;
}
.goods-desc {
  font-size: 13px;
  color: #888;
  margin-top: 8px;
  line-height: 1.6;
}
.meta-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f6f8;
}

/* 数量卡 */
.qty-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.qty-label {
  font-size: 14px;
  color: #333;
}

/* 介绍卡 */
.intro-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.intro-body {
  margin-top: 10px;
}
.intro-text {
  font-size: 14px;
  color: #444;
  line-height: 1.8;
  margin: 0 0 10px;
  word-break: break-word;
}
.intro-image {
  width: 100%;
  border-radius: 10px;
  display: block;
  margin-bottom: 10px;
}

/* 评价卡 */
.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.section-title {
  display: flex;
  align-items: center;
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
.review-count {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}
.avg-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff8f6;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 12px;
}
.avg-num {
  font-size: 22px;
  font-weight: 700;
  color: #ff4d2d;
}
.avg-text {
  font-size: 12px;
  color: #999;
}
.review-list {
  margin-top: 6px;
}
.review-item {
  padding: 12px 0;
  border-bottom: 1px solid #f5f6f8;
}
.review-item:last-child {
  border-bottom: none;
}
.review-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.review-user {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  flex-shrink: 0;
}
.review-time {
  margin-left: auto;
  font-size: 11px;
  color: #b0b0b0;
}
.review-content {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin-top: 6px;
}
.review-empty {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 24px 0;
}
.review-form-entry {
  margin-top: 10px;
  text-align: center;
}
.review-open-btn {
  border-color: #ff4d2d;
  color: #ff4d2d;
}
.review-form {
  margin-top: 10px;
  background: #f8f9fb;
  border-radius: 10px;
  padding: 12px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.form-label {
  font-size: 13px;
  color: #333;
}
.review-input {
  background: #fff;
  border-radius: 8px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
.submit-btn {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  font-weight: 600;
}

/* 底部操作栏 */
.detail-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 20;
  max-width: 1200px;
  margin: 0 auto;
}
.footer-cart {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 52px;
  flex-shrink: 0;
  cursor: pointer;
}
.cart-icon {
  font-size: 22px;
  color: #333;
}
.cart-label {
  font-size: 10px;
  color: #666;
}
.cart-badge {
  position: absolute;
  top: -6px;
  left: 26px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  background: #ff2d4b;
  color: #fff;
  font-size: 10px;
  border-radius: 8px;
  padding: 0 4px;
  box-sizing: border-box;
}
.add-btn {
  flex: 1;
  background: #fff;
  border: 1px solid #ff4d2d;
  color: #ff4d2d;
  font-weight: 600;
}
.buy-btn {
  flex: 1.2;
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  color: #fff;
  font-weight: 600;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .detail-page {
    height: 100%;
    overflow-y: auto;
  }
  .detail-header {
    padding: 16px 24px 44px;
  }
  .goods-img-card {
    height: 400px;
  }
  .detail-main {
    padding: 0 24px 24px;
  }
  .info-card,
  .qty-card,
  .intro-card,
  .review-card {
    margin-top: 16px;
  }
  .detail-footer {
    left: 0;
    right: 0;
    transform: none;
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
