
import request from '@/utils/request'
// 频道的请求 方法函数
export const getMyChannels = () => {
  return request('/app/v1_0/user/channels', 'get')
}
// 导入到： src/vies/home/index.vue
