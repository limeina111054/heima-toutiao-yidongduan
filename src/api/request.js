import axios from 'axios'
import JSONBIGINT from 'json-bigint'
import store from '@/store'

const instance = axios.create({
  // 基准值
  baseURL: 'http://ttapi.research.itcast.cn/',
  // 转换响应数据格式
  transformResponse: [(data) => {
    // data 是原始数据格式
    try {
      return JSONBIGINT.parse(data)
    } catch (e) {
      return data
    }
  }]
})

// 请求拦截器  追加token到请求头
instance.interceptors.request.use(config => {
  // 拦截成功
  // 获取token (vuex中的state中user中token)
  if (store.state.user.token) {
    // 追加token
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => Promise.reject(err))

// 响应拦截器
instance.interceptors.response.use(res => {
  try {
    return res.data.data
  } catch (e) {
    return res
  }
}, err => Promise.reject(err))

// 调用接口（接口地址，请求参数，传参）
export default (url, method, data) => {
  // params 选项是 get传参
  // data选项是其他方式传参
  instance({
    url,
    method,
    [method.toLowercase() === 'get' ? 'params' : 'data']: data
  })
}
