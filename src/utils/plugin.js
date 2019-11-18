
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)

const $sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout = (() => {
      resolve()
    }, 1000)
  })
}
// 写一个过滤器的方法：获取相对时间
// value时使用过滤器管道前，js表达式执行的结果
const relTime = (time) => {
  // 以来dayjs的插件R
  return dayjs().locale('zh-cn').from(time)
}
export default {
  install (Vue) {
    Vue.prototype.$sleep = $sleep
    Vue.filter('relTime', relTime)
  }
}
