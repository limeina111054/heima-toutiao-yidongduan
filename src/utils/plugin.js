
const $sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout = (() => {
      resolve()
    }, 1000)
  })
}

export default {
  install (Vue) {
    Vue.prototype.$sleep = $sleep
  }
}
