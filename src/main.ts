import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
// 引入全局样式
import '@/assets/css/global.css'
// 引入BaseTable组件
import BaseTable from '@/components/BaseTable/index.vue'

const app = createApp(App);
// 全局挂载
app.component('BaseTable', BaseTable);
app.use(createPinia()); // ✅ 状态管理
app.use(router); // ✅ 挂载路由
app.use(Vant);   // ✅ 注册 Vant 组件库
app.mount('#app');
