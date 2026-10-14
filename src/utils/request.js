import axios from 'axios';
import router from '../router';
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'any';
    // 商城登录态存 admin_token（JWT）；token 键为商城跳转管理端用的令牌，不能用于接口鉴权
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      if (res.code === 401) {
        // token过期或未登录，跳转到登录页
        router.push({ path: '/login' });
      }
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const get = (url, config) => request.get(url, config);

export const post = (url, data, config) => request.post(url, data, config);

export const put = (url, data, config) => request.put(url, data, config);

export const del = (url, config) => request.delete(url, config);

export default request;
