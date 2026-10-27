<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getCouponCenter, receiveCoupon, getMyCoupons } from '@/api/coupon';

const router = useRouter();

const activeTab = ref('center');
const centerList = ref([]);
const myList = ref([]);
const loading = ref(false);

const loadCenter = async () => {
  try {
    const res = await getCouponCenter();
    if (res.code === 200) centerList.value = res.data || [];
  } catch (error) {
    // 401 由拦截器处理
  }
};

const loadMine = async () => {
  loading.value = true;
  try {
    const status = activeTab.value === 'all' ? '' : activeTab.value;
    const res = await getMyCoupons(status ? { status } : {});
    if (res.code === 200) myList.value = res.data || [];
  } catch (error) {
    // ignore
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCenter();
  loadMine();
});
watch(activeTab, loadMine);

/* 领取 */
const onReceive = async (item) => {
  try {
    const res = await receiveCoupon(item.id);
    if (res.code === 200) {
      showToast('领取成功');
      loadCenter();
      loadMine();
    }
  } catch (error) {
    showToast(error.message || '领取失败');
  }
};

const statusText = (s) => (s === 0 ? '未使用' : s === 1 ? '已使用' : '已过期');

const goBack = () => router.back();
</script>

<template>
  <div class="coupon-page">
    <div class="page-header">
      <div class="page-header-inner">
        <van-icon name="arrow-left" class="back-icon" @click="goBack" />
        <span class="header-title">优惠券</span>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" class="coupon-tabs" color="#ff4d2d" line-width="24">
      <van-tab name="center" title="领券中心" />
      <van-tab name="all" title="我的券" />
      <van-tab name="0" title="未使用" />
      <van-tab name="1" title="已使用" />
      <van-tab name="2" title="已过期" />
    </van-tabs>

    <div class="coupon-main">
      <!-- 领券中心 -->
      <div v-if="activeTab === 'center'" class="coupon-list">
        <div v-for="c in centerList" :key="c.id" class="coupon-card">
          <div class="coupon-left">
            <template v-if="c.type === 1">
              <span class="cp-symbol">¥</span>
              <span class="cp-amount">{{ c.amount }}</span>
            </template>
            <template v-else>
              <span class="cp-amount">{{ c.discount * 10 }}</span>
              <span class="cp-symbol">折</span>
            </template>
            <div class="cp-threshold">
              {{ c.threshold > 0 ? `满${c.threshold}可用` : '无门槛' }}
            </div>
          </div>
          <div class="coupon-right">
            <div class="cp-name">{{ c.name }}</div>
            <div class="cp-time">有效期至 {{ (c.endTime || '').slice(0, 10) }}</div>
            <div class="cp-receive">
              <van-button
                v-if="!c.receivedByMe"
                size="small"
                round
                type="danger"
                class="receive-btn"
                @click="onReceive(c)"
              >
                立即领取
              </van-button>
              <span v-else class="cp-got">已领取</span>
            </div>
          </div>
        </div>
        <van-empty v-if="!centerList.length" description="暂无可领取的优惠券" />
      </div>

      <!-- 我的券 -->
      <div v-else class="coupon-list">
        <div
          v-for="c in myList"
          :key="c.userCouponId"
          class="coupon-card"
          :class="'cp-st-' + c.ucStatus"
        >
          <div class="coupon-left">
            <template v-if="c.type === 1">
              <span class="cp-symbol">¥</span>
              <span class="cp-amount">{{ c.amount }}</span>
            </template>
            <template v-else>
              <span class="cp-amount">{{ c.discount * 10 }}</span>
              <span class="cp-symbol">折</span>
            </template>
            <div class="cp-threshold">
              {{ c.threshold > 0 ? `满${c.threshold}可用` : '无门槛' }}
            </div>
          </div>
          <div class="coupon-right">
            <div class="cp-name">{{ c.name }}</div>
            <div class="cp-time">有效期至 {{ (c.endTime || '').slice(0, 10) }}</div>
            <div class="cp-state">{{ statusText(c.ucStatus) }}</div>
          </div>
        </div>
        <van-empty v-if="!myList.length && !loading" description="暂无相关优惠券" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupon-page {
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
.coupon-tabs {
  margin: -18px 12px 0;
  background: #fff;
  border-radius: 12px;
  position: relative;
  z-index: 3;
}
.coupon-tabs :deep(.van-tab) {
  font-size: 13px;
}

.coupon-main {
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== 券卡片 ===== */
.coupon-list {
  margin: 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;
  padding-bottom: 20px;
}
.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.coupon-left {
  width: 100px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #ff4d2d, #ff7a3d);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 14px 0;
}
.cp-symbol {
  font-size: 13px;
  font-weight: 700;
}
.cp-amount {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
}
.cp-threshold {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 4px;
}
.coupon-right {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cp-name {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}
.cp-time {
  font-size: 11px;
  color: #999;
}
.cp-receive {
  margin-top: 4px;
}
.receive-btn {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
}
.cp-got {
  font-size: 13px;
  color: #999;
}
.cp-state {
  font-size: 13px;
  color: #ff9f1a;
  font-weight: 600;
  margin-top: 4px;
}
/* 已使用/已过期置灰 */
.cp-st-1 .coupon-left,
.cp-st-2 .coupon-left {
  background: #c8c9cc;
}
.cp-st-1 .cp-state,
.cp-st-2 .cp-state {
  color: #999;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .coupon-page {
    height: 100%;
    overflow-y: auto;
  }
  .page-header {
    padding: 20px 24px 44px;
  }
  .coupon-tabs {
    margin: -18px 0 0;
  }
  .coupon-main {
    padding: 0 24px 24px;
    box-sizing: border-box;
  }
  .coupon-list {
    margin: 12px 0 0;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  .coupon-card {
    flex: 1 1 30%;
    max-width: 460px;
  }
}
</style>
