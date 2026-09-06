import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
// 引入全局样式
import '@/assets/css/global.css'

const app = createApp(App)
app.use(router) // ✅ 挂载路由
app.use(Vant)   // ✅ 注册 Vant 组件库
app.mount('#app')
