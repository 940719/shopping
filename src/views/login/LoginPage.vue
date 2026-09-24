<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

const onLogin = async () => {
  if (!username.value.trim() || !password.value) {
    showToast('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    // 真实登录：调用后端接口校验数据库账号密码
    const res = await userStore.login(username.value, password.value)
    if (!res.ok) {
      showToast(res.msg)
      return
    }
    showToast(`欢迎，${userStore.userInfo?.nickname}`)
    // 支持登录后回跳来源页
    const redirect = route.query.redirect as string | undefined
    if (redirect && redirect.startsWith('/')) {
      router.push(redirect)
    } else {
      router.push(userStore.isAdmin ? '/admin' : '/home')
    }
  } finally {
    loading.value = false
  }
}

const goHome = () => router.push('/home')
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo" @click="goHome">
        <span class="logo-icon">🛍️</span>
        <span class="logo-text">优选商城</span>
      </div>
      <div class="login-title">账号登录</div>
      <div class="login-sub">登录后享受会员权益与管理能力</div>

      <van-form @submit="onLogin">
        <van-cell-group inset class="form-group">
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>

        <div class="login-btn-wrap">
          <van-button
            round
            block
            type="danger"
            :loading="loading"
            native-type="submit"
            class="login-btn"
          >
            登 录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #ff4d2d 0%, #ff8a3d 60%, #f5f7fa 60%, #f5f7fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
}
.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 24px;
}
.logo-icon {
  font-size: 34px;
}
.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #ff4d2d;
}
.login-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1b1c;
  text-align: center;
}
.login-sub {
  font-size: 13px;
  color: #8c8c8c;
  text-align: center;
  margin: 6px 0 20px;
}
.form-group {
  margin: 0 0 20px;
}
.form-group :deep(.van-cell) {
  border-radius: 8px;
}
.login-btn-wrap {
  padding: 0 16px;
}
.login-btn {
  background: linear-gradient(90deg, #ff4d2d, #ff6034);
  border: none;
  font-weight: 600;
  letter-spacing: 4px;
}
</style>
