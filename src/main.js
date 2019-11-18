import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vant, { Lazyload } from 'vant'
import 'vant/lib/index.less'
import 'amfe-flexible'
import '@/styles/index.less'
import plugin from '@/utils/plugin'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)

Vue.use(vant)
Vue.use(plugin)
Vue.use(Lazyload)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
