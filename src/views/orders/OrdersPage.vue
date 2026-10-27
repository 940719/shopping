<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { getOrderList, payOrder, confirmOrder, cancelOrder } from '@/api/order';

const router = useRouter();
const route = useRoute();

const TABS = [
  { name: 'all', label: '全部', status: '' },
  { name: 'unpaid', label: '待付款', status: '1' },
  { name: 'unship', label: '待发货', status: '2' },
  { name: 'unreceive', label: '待收货', status: '3' },
  { name: 'unevaluate', label: '待评价', status: '4' },
];

/* 从 URL query 恢复默认 tab（如 /orders?status=2 -> 待发货） */
const initial = route.query.status ? String(route.query.status) : '';
const activeName = ref(
  TABS.find((t) => t.status === initial)?.name || 'all'
);

const orderList = ref([]);
const loading = ref(false);

const loadOrders = async () => {
  loading.value = true;
  try {
    const tab = TABS.find((t) => t.name === activeName.value);
    const params = tab.status ? { status: tab.status } : {};
    const res = await getOrderList(params);
    if (res.code === 200) orderList.value = res.data || [];
  } catch (error) {
    // 401 由拦截器处理
  } finally {
    loading.value = false;
  }
};

onMounted(loadOrders);
watch(activeName, loadOrders);

const isImg = (v) => !!v && /^(https?:|data:)/.test(v);

/* 付款 */
const onPay = (order) => {
  showConfirmDialog({
    title: '确认支付',
    message: `订单 ${order.orderNo}，需支付 ¥${order.totalPrice}，确认支付吗？`,
    confirmButtonColor: '#ff4d2d',
    confirmButtonText: '确认支付',
  })
    .then(async () => {
      try {
        const res = await payOrder(order.id);
        if (res.code === 200) {
          showToast('支付成功，商家将尽快发货');
          loadOrders();
        }
      } catch (error) {
        showToast('支付失败');
      }
    })
    .catch(() => {});
};

/* 取消订单 */
const onCancel = (order) => {
  showConfirmDialog({
    title: '提示',
    message: '确定取消该订单吗？',
    confirmButtonColor: '#ff4d2d',
  })
    .then(async () => {
      try {
        const res = await cancelOrder(order.id);
        if (res.code === 200) {
          showToast('订单已取消');
          loadOrders();
        }
      } catch (error) {
        showToast('取消失败');
      }
    })
    .catch(() => {});
};

/* 确认收货 */
const onConfirm = (order) => {
  showConfirmDialog({
    title: '提示',
    message: '确认已收到货？',
    confirmButtonColor: '#ff4d2d',
  })
    .then(async () => {
      try {
        const res = await confirmOrder(order.id);
        if (res.code === 200) {
          showToast('已确认收货');
          loadOrders();
        }
      } catch (error) {
        showToast('操作失败');
      }
    })
    .catch(() => {});
};

/* 提醒发货 */
const onRemind = () => showToast('已提醒商家发货');

const goBack = () => router.back();
</script>

<template>
  <div class="orders-page">
    <div class="page-header">
      <div class="page-header-inner">
        <van-icon name="arrow-left" class="back-icon" @click="goBack" />
        <span class="header-title">我的订单</span>
      </div>
    </div>

    <van-tabs v-model:active="activeName" class="order-tabs" color="#ff4d2d" line-width="24">
      <van-tab v-for="t in TABS" :key="t.name" :name="t.name" :title="t.label" />
    </van-tabs>

    <div class="orders-main">
      <!-- 空态 -->
      <div v-if="!orderList.length && !loading" class="empty-card">
        <van-empty description="暂无相关订单">
          <van-button round type="danger" size="small" class="go-btn" @click="router.push('/home')">
            去逛逛
          </van-button>
        </van-empty>
      </div>

      <!-- 订单列表 -->
      <div v-else class="order-list">
        <div v-for="order in orderList" :key="order.id" class="order-card">
          <div class="order-head">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-status" :class="'st-' + order.status">{{ order.statusText }}</span>
          </div>

          <div class="order-items">
            <div v-for="it in order.items" :key="it.id" class="order-item">
              <div class="item-img" :style="{ background: it.bg || '#f5f6f8' }">
                <img v-if="isImg(it.emoji)" :src="it.emoji" class="item-image" alt="" />
                <span v-else class="item-emoji">{{ it.emoji || '📦' }}</span>
              </div>
              <div class="item-info">
                <div class="item-name text-ellipsis">{{ it.goodsName }}</div>
                <div class="item-price-row">
                  <span class="price-symbol">¥</span>
                  <span class="price-num">{{ it.price }}</span>
                  <span class="item-qty">×{{ it.num }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-addr" v-if="order.address">
            <van-icon name="location-o" class="addr-icon" />
            {{ order.receiver }} {{ order.phone }} · {{ order.address }}
          </div>

          <div class="order-foot">
            <div class="order-total">
              共 {{ order.items.reduce((s, i) => s + i.num, 0) }} 件 合计：
              <span class="total-symbol">¥</span>
              <span class="total-num">{{ order.totalPrice }}</span>
            </div>
            <div class="order-btns">
              <!-- 待付款 -->
              <template v-if="order.status === 1">
                <van-button size="small" plain round class="op-btn" @click="onCancel(order)">
                  取消订单
                </van-button>
                <van-button size="small" round type="danger" class="op-btn op-primary" @click="onPay(order)">
                  立即付款
                </van-button>
              </template>
              <!-- 待发货 -->
              <template v-else-if="order.status === 2">
                <van-button size="small" round plain class="op-btn" @click="onRemind">
                  提醒发货
                </van-button>
              </template>
              <!-- 待收货 -->
              <template v-else-if="order.status === 3">
                <van-button size="small" round type="danger" class="op-btn op-primary" @click="onConfirm(order)">
                  确认收货
                </van-button>
              </template>
              <!-- 待评价 -->
              <template v-else-if="order.status === 4">
                <van-button size="small" round type="danger" class="op-btn op-primary" @click="showToast('评价功能开发中')">
                  去评价
                </van-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
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
  align-items: center;
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

/* ===== tabs ===== */
.order-tabs {
  margin: -18px 12px 0;
  background: #fff;
  border-radius: 12px;
  position: relative;
  z-index: 3;
}
.order-tabs :deep(.van-tab) {
  font-size: 14px;
}

.orders-main {
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

/* ===== 订单卡片 ===== */
.order-list {
  margin: 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 2;
  padding-bottom: 20px;
}
.order-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f2f3f5;
}
.order-no {
  font-size: 12px;
  color: #999;
}
.order-status {
  font-size: 13px;
  font-weight: 600;
}
.st-1 { color: #ff4d2d; }
.st-2 { color: #ff9f1a; }
.st-3 { color: #1677ff; }
.st-4 { color: #00b578; }
.st-5 { color: #999; }
.st-6 { color: #999; }

.order-items {
  padding: 4px 14px;
}
.order-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #f2f3f5;
}
.order-item:last-child {
  border-bottom: none;
}
.item-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  overflow: hidden;
}
.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-info {
  flex: 1;
  min-width: 0;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-name {
  font-size: 13px;
  color: #333;
}
.item-price-row {
  display: flex;
  align-items: baseline;
}
.price-symbol {
  font-size: 11px;
  color: #ff2d4b;
  font-weight: 700;
}
.price-num {
  font-size: 15px;
  color: #ff2d4b;
  font-weight: 700;
}
.item-qty {
  margin-left: 6px;
  font-size: 12px;
  color: #999;
}

.order-addr {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 12px;
  color: #666;
  background: #f8f9fb;
  margin: 0 14px 8px;
  padding: 8px 10px;
  border-radius: 8px;
  line-height: 1.5;
}
.addr-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 14px;
  border-top: 1px solid #f2f3f5;
}
.order-total {
  font-size: 12px;
  color: #666;
}
.total-symbol {
  font-size: 12px;
  color: #ff2d4b;
  font-weight: 700;
}
.total-num {
  font-size: 17px;
  color: #ff2d4b;
  font-weight: 700;
}
.order-btns {
  display: flex;
  gap: 8px;
}
.op-btn {
  border-color: #ff4d2d;
  color: #ff4d2d;
}
.op-primary {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  color: #fff;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .orders-page {
    height: 100%;
    overflow-y: auto;
  }
  .page-header {
    padding: 20px 24px 44px;
  }
  .order-tabs {
    margin: -18px 0 0;
  }
  .orders-main {
    padding: 0 24px 24px;
    box-sizing: border-box;
  }
  .order-list {
    margin: 12px 0 0;
  }
  .item-img {
    width: 76px;
    height: 76px;
  }
}
</style>
