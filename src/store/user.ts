import { defineStore } from 'pinia'

export interface UserInfo {
  username: string
  nickname: string
  role: 'admin' | 'user'
}

interface UserState {
  token: string
  userInfo: UserInfo | null
}

/** 从 localStorage 恢复登录态 */
function readStored(): UserState {
  let userInfo: UserInfo | null = null
  try {
    const raw = localStorage.getItem('userInfo')
    userInfo = raw ? (JSON.parse(raw) as UserInfo) : null
  } catch {
    userInfo = null
  }
  return {
    token: localStorage.getItem('token') || '',
    userInfo
  }
}

export const useUserStore = defineStore('user', {
  state: (): UserState => readStored(),
  getters: {
    isLogin: (s) => !!s.token && !!s.userInfo,
    isAdmin: (s) => s.userInfo?.role === 'admin'
  },
  actions: {
    /**
     * 演示登录：内置两个测试账号
     * - admin / admin123 → 管理员
     * - user / user123   → 普通用户
     * 后续可替换为真实接口调用
     */
    login(username: string, password: string): { ok: boolean; msg: string } {
      const name = username.trim()
      if (name === 'admin' && password === 'admin123') {
        this.token = 'mock-token-admin'
        this.userInfo = { username: 'admin', nickname: '系统管理员', role: 'admin' }
      } else if (name === 'user' && password === 'user123') {
        this.token = 'mock-token-user'
        this.userInfo = { username: 'user', nickname: '商城会员', role: 'user' }
      } else {
        return { ok: false, msg: '用户名或密码错误' }
      }
      localStorage.setItem('token', this.token)
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      return { ok: true, msg: '' }
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
