<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address';

const router = useRouter();

const addressList = ref([]);
const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = reactive({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
});

const loadList = async () => {
  try {
    const res = await getAddressList();
    if (res.code === 200) addressList.value = res.data || [];
  } catch (error) {
    // 401 已由拦截器处理
  }
};

onMounted(loadList);

/* 打开新增 */
const openAdd = () => {
  editingId.value = null;
  Object.assign(form, { receiver: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false });
  showForm.value = true;
};

/* 打开编辑 */
const openEdit = (item) => {
  editingId.value = item.id;
  Object.assign(form, {
    receiver: item.receiver,
    phone: item.phone,
    province: item.province || '',
    city: item.city || '',
    district: item.district || '',
    detail: item.detail,
    isDefault: !!item.isDefault,
  });
  showForm.value = true;
};

/* 保存 */
const onSave = async () => {
  if (!form.receiver.trim()) return showToast('请填写收货人');
  if (!/^1\d{10}$/.test(form.phone)) return showToast('请填写正确的手机号');
  if (!form.detail.trim()) return showToast('请填写详细地址');
  saving.value = true;
  try {
    const payload = { ...form, receiver: form.receiver.trim(), detail: form.detail.trim() };
    const res = editingId.value
      ? await updateAddress(editingId.value, payload)
      : await addAddress(payload);
    if (res.code === 200) {
      showToast('保存成功');
      showForm.value = false;
      loadList();
    }
  } catch (error) {
    showToast('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

/* 设为默认 */
const onSetDefault = async (item) => {
  try {
    const res = await setDefaultAddress(item.id);
    if (res.code === 200) {
      showToast('已设为默认');
      loadList();
    }
  } catch (error) {
    showToast('操作失败');
  }
};

/* 删除 */
const onDelete = (item) => {
  showConfirmDialog({
    title: '提示',
    message: `确定删除「${item.receiver}」的地址吗？`,
    confirmButtonColor: '#ff4d2d',
  })
    .then(async () => {
      try {
        const res = await deleteAddress(item.id);
        if (res.code === 200) {
          showToast('已删除');
          loadList();
        }
      } catch (error) {
        showToast('删除失败');
      }
    })
    .catch(() => {});
};

const goBack = () => router.back();
</script>

<template>
  <div class="address-page">
    <div class="page-header">
      <div class="page-header-inner">
        <van-icon name="arrow-left" class="back-icon" @click="goBack" />
        <span class="header-title">收货地址</span>
      </div>
    </div>

    <div class="page-main">
      <!-- 空态 -->
      <div v-if="!addressList.length" class="empty-card">
        <van-empty description="还没有收货地址">
          <van-button round type="danger" size="small" class="go-btn" @click="openAdd">
            新增地址
          </van-button>
        </van-empty>
      </div>

      <!-- 地址列表 -->
      <div v-else class="addr-list">
        <div v-for="item in addressList" :key="item.id" class="addr-card">
          <div class="addr-top">
            <span class="addr-receiver">{{ item.receiver }}</span>
            <span class="addr-phone">{{ item.phone }}</span>
            <span v-if="item.isDefault" class="addr-default">默认</span>
          </div>
          <div class="addr-detail">
            {{ item.province }}{{ item.city }}{{ item.district }} {{ item.detail }}
          </div>
          <div class="addr-actions">
            <div
              class="addr-action"
              :class="{ 'action-active': item.isDefault }"
              @click="!item.isDefault && onSetDefault(item)"
            >
              <van-icon name="location-o" />
              {{ item.isDefault ? '默认地址' : '设为默认' }}
            </div>
            <div class="addr-action" @click="openEdit(item)">
              <van-icon name="edit" />
              编辑
            </div>
            <div class="addr-action addr-del" @click="onDelete(item)">
              <van-icon name="delete-o" />
              删除
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部新增按钮 -->
    <div class="addr-footer">
      <van-button round block type="danger" class="add-btn" @click="openAdd">
        <van-icon name="plus" /> 新增收货地址
      </van-button>
    </div>

    <!-- 表单弹层 -->
    <van-popup v-model:show="showForm" position="bottom" round class="form-popup">
      <div class="form-title">{{ editingId ? '编辑地址' : '新增地址' }}</div>
      <div class="form-body">
        <van-field v-model="form.receiver" label="收货人" placeholder="请输入收货人姓名" />
        <van-field v-model="form.phone" label="手机号" type="tel" maxlength="11" placeholder="请输入手机号" />
        <div class="region-row">
          <van-field v-model="form.province" label="省" placeholder="省" />
          <van-field v-model="form.city" label="市" placeholder="市" />
          <van-field v-model="form.district" label="区" placeholder="区" />
        </div>
        <van-field
          v-model="form.detail"
          label="详细地址"
          type="textarea"
          rows="2"
          autosize
          maxlength="120"
          show-word-limit
          placeholder="街道、门牌号等"
        />
        <div class="default-row">
          <span class="default-label">设为默认地址</span>
          <van-switch v-model="form.isDefault" size="22" active-color="#ff4d2d" />
        </div>
      </div>
      <div class="form-footer">
        <van-button round block type="danger" :loading="saving" class="save-btn" @click="onSave">
          保 存
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.address-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

/* ===== 顶部 ===== */
.page-header {
  background: linear-gradient(180deg, #ff4d2d 0%, #ff6034 80%, transparent 100%);
  padding: 16px 16px 34px;
  color: #fff;
  position: relative;
  z-index: 2;
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
.page-main {
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

/* ===== 地址卡片 ===== */
.addr-list {
  margin: 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;
}
.addr-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.addr-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.addr-receiver {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}
.addr-phone {
  font-size: 13px;
  color: #666;
}
.addr-default {
  font-size: 11px;
  color: #ff4d2d;
  background: #fff1ef;
  border: 1px solid #ffd7d0;
  padding: 1px 6px;
  border-radius: 4px;
}
.addr-detail {
  font-size: 13px;
  color: #555;
  margin: 8px 0 10px;
  line-height: 1.5;
}
.addr-actions {
  display: flex;
  gap: 20px;
  border-top: 1px solid #f2f3f5;
  padding-top: 10px;
}
.addr-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}
.action-active {
  color: #ff4d2d;
}
.addr-del {
  color: #969799;
}

/* ===== 底部按钮 ===== */
.addr-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 20;
}
.add-btn {
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  font-weight: 600;
}

/* ===== 表单弹层 ===== */
.form-popup {
  max-height: 85vh;
  overflow-y: auto;
}
.form-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #222;
  padding: 16px 0 8px;
}
.form-body {
  padding: 4px 0;
}
.form-body :deep(.van-cell) {
  padding: 14px 16px;
}
.form-body :deep(.van-field__label) {
  width: 68px;
}
.region-row {
  display: flex;
}
.region-row .van-cell {
  flex: 1;
}
.region-row :deep(.van-cell:nth-child(1) .van-field__label) {
  width: 40px;
}
.region-row :deep(.van-cell:nth-child(2) .van-field__label) {
  width: 40px;
}
.region-row :deep(.van-cell:nth-child(3) .van-field__label) {
  width: 40px;
}
.default-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #ebedf0;
}
.default-label {
  font-size: 14px;
  color: #333;
}
.form-footer {
  padding: 12px 16px 24px;
}
.save-btn {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  font-weight: 600;
  letter-spacing: 2px;
}

/* ========== PC 响应式（≥768px） ========== */
@media (min-width: 768px) {
  .address-page {
    height: 100%;
    overflow-y: auto;
  }
  .page-header {
    padding: 20px 24px 44px;
  }
  .page-main {
    padding: 0 24px 24px;
    box-sizing: border-box;
  }
  .addr-list {
    margin: 12px 0 0;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  .addr-card {
    flex: 1 1 340px;
    max-width: 560px;
  }
  .addr-footer {
    padding: 12px 24px;
  }
  .form-popup {
    width: 480px;
    border-radius: 16px;
  }
}
</style>
