<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useUserStore } from '@/store/user';
import { getCartList, updateCartQty, deleteCartItem } from '@/api/cart';
import { getAddressList } from '@/api/address';
import { createOrder } from '@/api/order';
import { getProductList } from '@/api/product';

const router = useRouter();
const userStore = useUserStore();

/* ---------- 购物车数据（真实接口） ---------- */
const cartList = ref([]);
const loading = ref(false);

/* 猜你喜欢（真实商品：取商品列表前 2 个） */
const recommend = ref([]);

const isImg = (v) => !!v && /^(https?:|data:)/.test(v);

const loadCart = async () => {
  if (!userStore.isLogin) return;
  loading.value = true;
  try {
    const res = await getCartList();
    if (res.code === 200) {
      cartList.value = (res.data || []).map((i) => ({ ...i, checked: true }));
    }
  } catch (error) {
    // 401 已由拦截器跳登录；其余静默
  } finally {
    loading.value = false;
  }
};

const loadRecommend = async () => {
  try {
    const res = await getProductList({ pageNum: 1, pageSize: 2 });
    if (res.code === 200) {
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.list || [];
      recommend.value = list.slice(0, 2);
    }
  } catch (error) {
    // 静默
  }
};

onMounted(() => {
  loadCart();
  loadRecommend();
});

/* ---------- 选中与合计 ---------- */
const allChecked = computed(
  () => cartList.value.length > 0 && cartList.value.every((i) => i.checked)
);
const toggleAll = (v) => cartList.value.forEach((i) => (i.checked = v));

const checkedItems = computed(() => cartList.value.filter((i) => i.checked));
const totalCount = computed(() => checkedItems.value.reduce((s, i) => s + i.quantity, 0));
const totalPrice = computed(() =>
  checkedItems.value.reduce((s, i) => s + i.quantity * Number(i.price), 0)
);

/* ---------- 数量修改 ---------- */
const onQuantityChange = async (item, v) => {
  const prev = item.quantity;
  item.quantity = v;
  try {
    const res = await updateCartQty(item.id, v);
    if (res.code !== 200) item.quantity = prev;
  } catch (error) {
    item.quantity = prev;
  }
};

/* ---------- 删除 ---------- */
const onDelete = (item) => {
  showConfirmDialog({
    title: '提示',
    message: `确定删除「${item.name}」吗？`,
    confirmButtonColor: '#ff4d2d',
  })
    .then(async () => {
      try {
        const res = await deleteCartItem(item.id);
        if (res.code === 200) {
          cartList.value = cartList.value.filter((i) => i.id !== item.id);
          showToast('已删除');
          window.dispatchEvent(new CustomEvent('cart-changed'));
        }
      } catch (error) {
        showToast('删除失败');
      }
    })
    .catch(() => {});
};

/* ---------- 跳转 ---------- */
const goShopping = () => router.push('/home');
const goLogin = () => router.push('/login');

/* ---------- 结算下单 ---------- */
const checkoutShow = ref(false);
const addressList = ref([]);
const selectedAddrId = ref(null);
const submitting = ref(false);

/* 结算：加载收货地址，有地址弹确认层，无地址引导去添加 */
const onCheckout = async () => {
  if (checkedItems.value.length === 0) {
    showToast('请先选择商品');
    return;
  }
  try {
    const res = await getAddressList();
    if (res.code === 200 && res.data.length > 0) {
      addressList.value = res.data;
      const def = res.data.find((a) => a.isDefault) || res.data[0];
      selectedAddrId.value = def.id;
      checkoutShow.value = true;
    } else {
      showToast('请先添加收货地址');
      router.push('/address');
    }
  } catch (error) {
    showToast('加载地址失败');
  }
};

const goAddressManage = () => router.push('/address');

/* 提交订单：生成待付款订单并清空已结算购物车 */
const onSubmitOrder = async () => {
  if (!selectedAddrId.value) {
    showToast('请选择收货地址');
    return;
  }
  submitting.value = true;
  try {
    const cartIds = checkedItems.value.map((i) => i.id);
    const res = await createOrder({ addressId: selectedAddrId.value, cartIds });
    if (res.code === 200) {
      showToast('下单成功');
      checkoutShow.value = false;
      cartList.value = cartList.value.filter((i) => !i.checked);
      window.dispatchEvent(new CustomEvent('cart-changed'));
      router.push('/orders?status=1');
    }
  } catch (error) {
    showToast('下单失败，请重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="cart-page">
    <div class="cart-header">
      <div class="cart-header-inner">
        <span class="header-title">购物车</span>
        <span v-if="cartList.length" class="header-count">{{ cartList.length }} 件商品</span>
      </div>
    </div>

    <div class="cart-main">
      <!-- 未登录 -->
      <div v-if="!userStore.isLogin" class="empty-card">
        <van-empty description="登录后查看购物车">
          <van-button round type="danger" size="small" class="go-btn" @click="goLogin">
            去登录
          </van-button>
        </van-empty>
      </div>

      <!-- 空购物车 -->
      <div v-else-if="!cartList.length && !loading" class="empty-card">
        <van-empty description="购物车还是空的">
          <van-button round type="danger" size="small" class="go-btn" @click="goShopping">
            去逛逛
          </van-button>
        </van-empty>
      </div>

      <!-- 购物车列表 -->
      <div v-else class="cart-list-card">
        <div v-for="item in cartList" :key="item.id" class="cart-item">
          <van-checkbox
            :model-value="item.checked"
            class="item-check"
            checked-color="#ff4d2d"
            @update:model-value="item.checked = $event"
          />
          <div class="item-img" :style="{ background: item.bg || '#f5f6f8' }">
            <img v-if="isImg(item.emoji)" :src="item.emoji" class="item-image" alt="" />
            <span v-else class="item-emoji">{{ item.emoji || '📦' }}</span>
          </div>
          <div class="item-body">
            <div class="item-name text-ellipsis">{{ item.name }}</div>
            <div class="item-price-row">
              <span class="price-symbol">¥</span>
              <span class="price-num">{{ item.price }}</span>
              <span v-if="item.originPrice" class="origin-price">¥{{ item.originPrice }}</span>
            </div>
            <div class="item-bottom">
              <van-stepper
                :model-value="item.quantity"
                min="1"
                :max="item.stock || 999"
                integer
                theme="round"
                button-size="22"
                @update:model-value="(v) => onQuantityChange(item, v)"
              />
              <van-icon name="delete-o" class="item-del" @click="onDelete(item)" />
            </div>
          </div>
        </div>
      </div>

      <!-- 猜你喜欢（真实商品） -->
      <div class="recommend-section">
        <div class="section-title">
          <span class="title-bar"></span>
          <span class="title-text">猜你喜欢</span>
        </div>
        <div class="recommend-grid">
          <div v-for="g in recommend" :key="g.id" class="rec-card" @click="goShopping">
            <div class="rec-img" :style="{ background: g.bg || '#f5f6f8' }">
              <img v-if="isImg(g.emoji)" :src="g.emoji" class="rec-image" alt="" />
              <span v-else>{{ g.emoji || '📦' }}</span>
            </div>
            <div class="rec-body">
              <div class="rec-name text-ellipsis">{{ g.name }}</div>
              <div class="rec-price-row">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ g.price }}</span>
                <span v-if="g.originPrice" class="origin-price">¥{{ g.originPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结算栏 -->
    <div v-if="cartList.length" class="checkout-bar">
      <van-checkbox
        :model-value="allChecked"
        class="checkout-all"
        checked-color="#ff4d2d"
        @update:model-value="toggleAll"
        >全选</van-checkbox
      >
      <div class="checkout-total">
        <span class="total-label">合计：</span>
        <span class="total-symbol">¥</span>
        <span class="total-num">{{ totalPrice.toFixed(2) }}</span>
      </div>
      <van-button round type="danger" class="checkout-btn" @click="onCheckout">
        结算({{ totalCount }})
      </van-button>
    </div>

    <!-- 结算确认弹层 -->
    <van-popup v-model:show="checkoutShow" position="bottom" round class="checkout-popup">
      <div class="co-title">确认订单</div>
      <div class="co-body">
        <!-- 收货地址 -->
        <div class="co-section">
          <div class="co-section-title">收货地址</div>
          <van-radio-group v-model="selectedAddrId">
            <div
              v-for="a in addressList"
              :key="a.id"
              class="co-addr-item"
              :class="{ active: selectedAddrId === a.id }"
              @click="selectedAddrId = a.id"
            >
              <van-radio :name="a.id" checked-color="#ff4d2d" />
              <div class="co-addr-info">
                <div class="co-addr-top">
                  <span class="co-addr-name">{{ a.receiver }}</span>
                  <span class="co-addr-phone">{{ a.phone }}</span>
                  <span v-if="a.isDefault" class="co-addr-default">默认</span>
                </div>
                <div class="co-addr-text">
                  {{ a.province }}{{ a.city }}{{ a.district }} {{ a.detail }}
                </div>
              </div>
            </div>
          </van-radio-group>
          <div class="co-addr-manage" @click="goAddressManage">+ 管理收货地址</div>
        </div>

        <!-- 商品清单 -->
        <div class="co-section">
          <div class="co-section-title">商品清单</div>
          <div v-for="item in checkedItems" :key="item.id" class="co-item">
            <div class="co-item-name text-ellipsis">{{ item.name }}</div>
            <div class="co-item-price">¥{{ item.price }} ×{{ item.quantity }}</div>
          </div>
        </div>

        <div class="co-total-row">
          <span>共 {{ totalCount }} 件，合计：</span>
          <span class="co-total-symbol">¥</span>
          <span class="co-total-num">{{ totalPrice.toFixed(2) }}</span>
        </div>
      </div>
      <div class="co-footer">
        <van-button round block type="danger" :loading="submitting" class="co-submit" @click="onSubmitOrder">
          提交订单
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px; /* 给结算栏留空间 */
}
.cart-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 16px 16px 34px;
  color: #fff;
}
.cart-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.header-title {
  font-size: 17px;
  font-weight: 700;
}
.header-count {
  font-size: 12px;
  opacity: 0.9;
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

/* ===== 购物车列表 ===== */
.cart-list-card {
  margin: 12px 12px 0;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}
.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f2f3f5;
}
.cart-item:last-child {
  border-bottom: none;
}
.item-check {
  margin-right: 10px;
  flex-shrink: 0;
}
.item-img {
  width: 84px;
  height: 84px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  overflow: hidden;
}
.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-body {
  flex: 1;
  min-width: 0;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 84px;
}
.item-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.item-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 4px;
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
.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.item-del {
  font-size: 20px;
  color: #c8c9cc;
  padding: 4px;
}

/* ===== 猜你喜欢 ===== */
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
  overflow: hidden;
}
.rec-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* ===== 结算栏 ===== */
.checkout-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 50px; /* 移动端底部导航高度 */
  background: #fff;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 20;
}
.checkout-all {
  flex-shrink: 0;
  font-size: 13px;
  color: #333;
}
.checkout-total {
  flex: 1;
  text-align: right;
  margin-right: 12px;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
}
.total-label {
  font-size: 12px;
  color: #333;
}
.total-symbol {
  font-size: 13px;
  color: #ff2d4b;
  font-weight: 700;
}
.total-num {
  font-size: 20px;
  color: #ff2d4b;
  font-weight: 700;
}
.checkout-btn {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  flex-shrink: 0;
  min-width: 104px;
}

/* ===== 结算弹层 ===== */
.checkout-popup {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.co-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #222;
  padding: 16px 0 8px;
  flex-shrink: 0;
}
.co-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}
.co-section {
  margin-bottom: 16px;
}
.co-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}
.co-addr-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f8f9fb;
  border-radius: 10px;
  border: 1px solid transparent;
  margin-bottom: 8px;
  cursor: pointer;
}
.co-addr-item.active {
  border-color: #ff4d2d;
  background: #fff5f3;
}
.co-addr-info {
  flex: 1;
  min-width: 0;
}
.co-addr-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.co-addr-name {
  font-size: 14px;
  font-weight: 700;
  color: #222;
}
.co-addr-phone {
  font-size: 13px;
  color: #666;
}
.co-addr-default {
  font-size: 10px;
  color: #ff4d2d;
  background: #ffe9e5;
  padding: 1px 5px;
  border-radius: 3px;
}
.co-addr-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.5;
}
.co-addr-manage {
  font-size: 12px;
  color: #ff4d2d;
  text-align: center;
  padding: 6px 0;
  cursor: pointer;
}
.co-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed #f2f3f5;
}
.co-item:last-child {
  border-bottom: none;
}
.co-item-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #333;
}
.co-item-price {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}
.co-total-row {
  text-align: right;
  font-size: 13px;
  color: #333;
  padding: 4px 0 12px;
}
.co-total-symbol {
  font-size: 13px;
  color: #ff2d4b;
  font-weight: 700;
}
.co-total-num {
  font-size: 20px;
  color: #ff2d4b;
  font-weight: 700;
}
.co-footer {
  padding: 10px 16px 20px;
  flex-shrink: 0;
  border-top: 1px solid #f2f3f5;
}
.co-submit {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  font-weight: 600;
  letter-spacing: 2px;
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
  .cart-list-card {
    margin: 12px 0 0;
  }
  .cart-item {
    padding: 16px;
  }
  .item-img {
    width: 96px;
    height: 96px;
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
  .checkout-bar {
    bottom: 0;
    max-width: 1200px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 14px 14px 0 0;
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
    padding: 10px 24px;
  }
  .total-num {
    font-size: 22px;
  }
}
</style>
