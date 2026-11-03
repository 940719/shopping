import { defineStore } from 'pinia';
import { login as loginRequest, restoreByToken } from '@/api/user';

/** 从 localStorage 恢复登录态 */
function readStored() {
  let userInfo = null;
  try {
    const raw = localStorage.getItem('userInfo');
    userInfo = raw ? JSON.parse(raw) : null;
  } catch {
    userInfo = null;
  }
  return {
    // 登录态以 admin_token（JWT）为准；token 键为跳转管理端令牌，做兼容回退
    token: localStorage.getItem('admin_token') || localStorage.getItem('token') || '',
    userInfo,
  };
}

export const useUserStore = defineStore('user', {
  state: () => readStored(),
  getters: {
    isLogin: (s) => !!s.token && !!s.userInfo,
    isAdmin: (s) => s.userInfo?.role === 'admin',
  },
  actions: {
    /**
     * 真实登录：调用后端 POST /api/auth/login 校验数据库账号密码
     * 后端返回角色数字码：1 超级管理员 / 2 管理员 / 3 普通用户
     * 前端映射：1、2 → admin（可进入管理后台），3 → user
     */
    async login(username, password) {
      try {
        const res = await loginRequest(username.trim(), password);
        const u = res.data;
        const role = u.role === 3 ? 'user' : 'admin';
        this.token = res.data.token;
        this.userInfo = {
          id: u.id, // 用户id：跳转管理端免登录令牌 token-{id} 使用
          username: u.name,
          nickname: u.nickname || u.name,
          phone: u.phone,
          avatar: u.avatar,
          role,
        };
        localStorage.setItem('admin_token', this.token);
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        return { ok: true, msg: '' };
      } catch (error) {
        return { ok: false, msg: error.message || '登录失败' };
      }
    },
    /**
     * 免登录恢复：管理端跳转时携带其登录的 JWT（?token={JWT}），
     * 交给后端 POST /api/auth/restore 校验签名并返回用户信息，写入商城登录态
     */
    async loginWithToken(token) {
      if (!token) return false;
      try {
        const res = await restoreByToken(token);
        if (res.code !== 200 || !res.data) return false;
        const u = res.data;
        const role = u.role === 3 ? 'user' : 'admin';
        this.token = token;
        this.userInfo = {
          id: u.id,
          username: u.name,
          nickname: u.nickname || u.name,
          phone: u.phone,
          avatar: u.avatar,
          role,
        };
        localStorage.setItem('admin_token', token);
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        return true;
      } catch (error) {
        console.error('token 恢复登录失败：', error);
        return false;
      }
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('userInfo');
    },
  },
});
