import axios from 'axios'
import JSONBIGINT from 'json-bigint'
import store from '@/store'
import router from '@/router'

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
}, async err => {
  // 判断当前状态码是否为401，出现两种情况没登陆或者没有携带//token
  if (err.response && err.response.status === 401) {
    const loginConfig = { path: '/login',
      query: { redirectUrl: router.currentRoute.path
      } }
    const user = store.state.user
    if (!user || !user.token || !user.refresh_token) {
      return router.push(loginConfig)
    }
    // 再一次发起请求刷新token
    try {
      const { data: { data } } = await axios({
        url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        headers: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      store.commit('setUser', { token: data.token,
        refresh_token: user.refresh_token
      })
      return instance(err.config)
    } catch (e) {
      store.commit('delUser')
      return router.push(loginConfig)
    }
  }
  return Promise.reject(err)
})

// 调用接口（接口地址，请求参数，传参）
export default (url, method, data) => {
  // params 选项是 get传参
  // data选项是其他方式传参
  return instance({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
