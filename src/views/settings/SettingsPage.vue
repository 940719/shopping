<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import { useUserStore } from '@/store/user';
import { updateMyProfile } from '@/api/user';

const router = useRouter();
const userStore = useUserStore();

const nickname = computed(() => userStore.userInfo?.nickname || '未登录');
const username = computed(() => userStore.userInfo?.username || '-');
const phone = computed(() => {
  const p = userStore.userInfo?.phone;
  if (!p) return '-';
  return p.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
});
const roleText = computed(() => (userStore.isAdmin ? '管理员' : '普通用户'));
const avatar = computed(() => userStore.userInfo?.avatar || '');

/* 修改昵称 */
const showNickForm = ref(false);
const nickForm = reactive({ nickname: '' });
const saving = ref(false);

const openNickForm = () => {
  nickForm.nickname = userStore.userInfo?.nickname || '';
  showNickForm.value = true;
};

const onSaveNick = async () => {
  if (!nickForm.nickname.trim()) return showToast('请输入昵称');
  saving.value = true;
  try {
    const res = await updateMyProfile({ nickname: nickForm.nickname.trim() });
    if (res.code === 200) {
      // 更新本地登录态
      const info = res.data;
      userStore.userInfo = {
        ...userStore.userInfo,
        nickname: info.nickname || info.name,
        phone: info.phone,
        avatar: info.avatar,
      };
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo));
      showToast('昵称已更新');
      showNickForm.value = false;
    }
  } catch (error) {
    showToast('保存失败');
  } finally {
    saving.value = false;
  }
};

/* 清除本地缓存（不影响登录态） */
const onClearCache = () => {
  showConfirmDialog({
    title: '清除缓存',
    message: '将清除本地缓存数据（不影响登录状态），确定吗？',
    confirmButtonColor: '#ff4d2d',
  })
    .then(() => {
      try {
        localStorage.removeItem('cartDraft');
        sessionStorage.clear();
        showToast('缓存已清除');
      } catch (error) {
        showToast('清除失败');
      }
    })
    .catch(() => {});
};

/* 退出登录 */
const onLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定退出当前账号吗？',
    confirmButtonColor: '#ff4d2d',
  })
    .then(() => {
      userStore.logout();
      showToast('已退出登录');
      router.push('/login');
    })
    .catch(() => {});
};

const goBack = () => router.back();
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="page-header-inner">
        <van-icon name="arrow-left" class="back-icon" @click="goBack" />
        <span class="header-title">设置</span>
      </div>
    </div>

    <div class="settings-main">
      <!-- 账号信息 -->
      <div class="info-card">
        <div class="info-avatar">
          <img v-if="avatar" :src="avatar" class="avatar-img" alt="" />
          <span v-else>🙂</span>
        </div>
        <div class="info-meta">
          <div class="info-nick">{{ nickname }}</div>
          <div class="info-desc">
            {{ username }} · {{ roleText }} · 📞 {{ phone }}
          </div>
        </div>
      </div>

      <!-- 设置项 -->
      <div class="menu-card">
        <div class="menu-item" @click="openNickForm">
          <span class="menu-icon">✏️</span>
          <span class="menu-label">修改昵称</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="onClearCache">
          <span class="menu-icon">🧹</span>
          <span class="menu-label">清除缓存</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item">
          <span class="menu-icon">📦</span>
          <span class="menu-label">关于优选商城</span>
          <span class="menu-value">v1.0.0</span>
        </div>
      </div>

      <!-- 退出登录 -->
      <van-button round block class="logout-btn" @click="onLogout">
        退出登录
      </van-button>
    </div>

    <!-- 修改昵称弹层 -->
    <van-popup v-model:show="showNickForm" position="bottom" round>
      <div class="form-title">修改昵称</div>
      <div class="form-body">
        <van-field
          v-model="nickForm.nickname"
          label="昵称"
          placeholder="请输入新昵称"
          maxlength="20"
        />
      </div>
      <div class="form-footer">
        <van-button round block type="danger" :loading="saving" class="save-btn" @click="onSaveNick">
          保 存
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.settings-page {
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
.settings-main {
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== 账号信息 ===== */
.info-card {
  margin: -20px 12px 0;
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14px;
}
.info-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info-meta {
  flex: 1;
  min-width: 0;
}
.info-nick {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}
.info-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* ===== 菜单 ===== */
.menu-card {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 4px 14px;
  position: relative;
  z-index: 2;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-icon {
  font-size: 20px;
  margin-right: 10px;
}
.menu-label {
  flex: 1;
  font-size: 14px;
  color: #333;
}
.menu-value {
  font-size: 13px;
  color: #c8c9cc;
  margin-right: 4px;
}
.menu-arrow {
  color: #c8c9cc;
  font-size: 16px;
}

/* ===== 退出 ===== */
.logout-btn {
  margin: 12px;
  background: #fff;
  color: #ff4d2d;
  border: 1px solid #ffd7d0;
  font-weight: 600;
  width: calc(100% - 24px);
  position: relative;
  z-index: 2;
}

/* ===== 弹层 ===== */
.form-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #222;
  padding: 16px 0 8px;
}
.form-body :deep(.van-cell) {
  padding: 14px 16px;
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
  .settings-page {
    height: 100%;
    overflow-y: auto;
  }
  .page-header {
    padding: 20px 24px 44px;
  }
  .settings-main {
    padding: 0 24px 24px;
    box-sizing: border-box;
  }
  .info-card {
    margin: -20px 0 0;
    padding: 24px 20px;
  }
  .menu-card {
    margin: 16px 0 0;
  }
  .logout-btn {
    margin: 16px 0 0;
    width: 100%;
  }
  .form-popup {
    width: 460px;
    border-radius: 16px;
  }
}
</style>
