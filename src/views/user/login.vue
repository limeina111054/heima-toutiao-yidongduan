<template>
  <div class="page-login">
    <van-nav-bar left-arrow @click-left="$router.back()" title="登 录"></van-nav-bar>
    <van-cell-group>
        <van-field @blur="validMobile" :error-message="errMsg.mobile" v-model="loginForm.mobile"  label="手机号" placeholder="请输入手机号" />
        <van-field @blur="validCode" :error-message="errMsg.code"  v-model="loginForm.code" label="验证码" placeholder="请输入验证码">
            <van-button class="p5" slot="button" size="mini" type="primary">
                发送验证码
            </van-button>
        </van-field>
    </van-cell-group>
    <div class="btn_box">
        <van-button type="info" @click="login" block round>登 录</van-button>
    </div>
</div>
</template>

<script>
import { login } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  name: 'user-login',
  data () {
    return {
      loginForm: {
        mobile: '',
        code: ''
      },
      errMsg: {
        mobile: '',
        code: ''
      }
    }
  },
  methods: {
    validMobile () {
      // 输入框是否有值
      if (!this.loginForm.mobile) {
        this.errMsg.mobile = '请输入手机号'
        return false
      }
      // 输入框有值，验证存在的值是否正确
      if (!/^1[3-9]\d{9}$/.test(this.loginForm.mobile)) {
        this.errMsg.mobile = '请输入正确的手机号'
        return false
      }
      // 输入正确的手机号后将什么都不显示
      this.errMsg.mobile = ''
    },
    validCode () {
      // 输入框是否有值
      if (!this.loginForm.code) {
        this.errMsg.code = '请输入验证码'
        return false
      }
      // 输入框有值，验证存在的值是否正确
      if (!/^\d{6}$/.test(this.loginForm.code)) {
        this.errMsg.code = '请输入正确的验证码'
        return false
      }
      // 输入正确的验证码后将什么都不显示
      this.errMsg.code = ''
    },
    // 点击登录验证
    async login () {
      this.validMobile()
      this.validCode()
      if (this.errMsg.mobile || this.errMsg.code) {
        return false
      }
      // 进行登录
      try {
        const data = await login(this.loginForm)
        this.setUser(data)
        const { redirectUrl } = this.$route.query
        this.$router.push(redirectUrl || '/user')
      } catch (e) {
        this.$toast.fail('手机号或验证码错误')
      }
    },
    ...mapMutations(['setUser'])
  }
}
</script>

<style scoped lang='less'>

.p5{
  padding: 0 5px;
}
.btn_box{
  padding: 10px;
  .van-button{
    height: 32px;
    line-height: 30px;
  }
}</style>
