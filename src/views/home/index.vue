<template>
  <div class="container">
    <!-- 主页的基础布局 -->
    <van-tabs  swipeable v-model="activeIndex" :lazy-render="false" @change="changeChannel" >
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <div class="scroll-wrapper" ref="scroll-wrapper" @scroll="remember($event)">
          <van-cell-group>
            <van-pull-refresh
              v-model="activeChannel.downLoading"
              @refresh="onRefresh"
              :success-text="refreshSuccessText"
            >
              <van-list
                v-model="activeChannel.upLoading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onload"
              >
                <van-cell v-for="article in activeChannel.articles" :key="article.art_id.toString()">
                  <!-- 三张图 -->
                  <div class="article_item">
                    <h3 class="van-ellipsis">{{article.title}}</h3>
                    <div class="img_box" v-if="article.cover.type === 3">
                      <van-image class="w33" fit="cover" lazy-load :src="article.cover.images[0]" />
                      <van-image class="w33" fit="cover" lazy-load :src="article.cover.images[1]" />
                      <van-image class="w33" fit="cover" lazy-load :src="article.cover.images[2]" />
                    </div>s
                    <div class="img_box" v-if="article.cover.type === 1">
                      <van-image class="w100" fit="cover" lazy-load :src="article.cover.images[0]" />
                    </div>
                    <div class="info_box">
                  <span>{{article.aut_name}}</span>
                    <span>{{article.comm_count}} 评论</span>
                    <span>{{article.pubdate}}</span>
                    <span v-if="user.token" class="close" @click ="opnMoreAction"><van-icon name="cross"></van-icon></span>
                    </div>
                  </div>
                </van-cell>
              </van-list>
            </van-pull-refresh>
          </van-cell-group>
        </div>
      </van-tab>
    </van-tabs>
    <span class="bar_btn" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <more-action v-model="show"></more-action>
  </div>
</template>

<script>
// import { log } from 'util'
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './componments/MoreAction'
export default {
  name: 'home-index',
  // 挂在
  components: { MoreAction },
  data () {
    return {
      upLoading: false,
      finished: false,
      downLoading: false,
      refreshSuccessText: '',
      // 刷新完毕后的提示文字|暂无更新|更新成功:注：更新最新数据
      articles: [],
      myChannels: [],
      // 激活索引为0的频道
      activeIndex: 0,
      // 显示更多操作
      show: false

    }
  },
  computed: {
    // 用计算属性写一个激活频道的方法
    activeChannel () {
      return this.myChannels[this.activeIndex]
    },
    ...mapState(['user'])
  },
  watch: {
    user () {
      this.activeIndex = 0
      this.getMyChannels()
      this.onload()
    }

  },
  created () {
    // 获取频道数据e
    this.getMyChannels()
  },

  methods: {
    opnMoreAction () {
      this.show = true
    },
    // 自己来加载数据（当前频道没有文章数据时)
    changeChannel () {
      if (!this.activeChannel.articles.length) {
        this.activeChannel.upLoading = true
        this.onload()
      } else {
        // 根据当前频道记录位置进行滚动(覆盖tab滚动到顶部的功能)
        this.$nextTick(() => {
          const dom = this.$refs['scroll-wrapper'][this.activeIndex]
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },
    remember (e) {
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 组件缓存时才有，组件激活的钩子函数
    activated () {
      if (this.$refs['scroll-wrapper']) {
        const dom = this.$refs['scroll-wrapper'][this.activeIndex]
        dom.scrollTop = this.activeChannel.scrollTop
      }
    },
    async getMyChannels () {
      const data = await getMyChannels()
      // 渲染频道（标签页 tabs组件）
      this.myChannels = data.channels
      this.myChannels = []// 清除tabs组件的缓存
      this.$nextTick(() => {
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            articles: [],
            upLoading: false,
            downLoading: false,
            finished: false,
            timestamp: Date.now(),
            scrollTop: 0
          }
        })
      })
    },
    async onRefresh () {
      // 下拉的时候松手触发
      // window.setTimeout(() => {
      //   this.downLoading = false
      //   // 模拟数据
      //   const data = [1, 2, 3, 4]
      //   // 判断是否有数据
      //   if (data.length) {
      //     this.articles = data
      //     this.refreshSuccessText = '更新成功'
      //     // 更新数据后，造成只有四条数据的结果，重新加载
      //     this.onload()
      //     this.finished = false
      //   } else {
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 800)
      // 下拉刷新
      // 注：因为每次都要刷新新的数据
      this.activeChannel.timestamp = Date.now()
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 结束下拉刷新结果
      this.activeChannel.downLoading = false

      // 判断是否有数据
      if (data.results.length) {
        this.activeChannel.articles = data.results
        // 加载有数据的文案
        this.refreshSuccessText = '更新成功'
        this.activeChannel.finished = false
        this.activeChannel.timestamp = data.pre_timestamp
        this.onload()
      } else {
        // 加载没有数据的文案
        this.refreshSuccessText = '暂无更新'
      }
    },
    async onload () {
      // 模拟加载数据
      // window.setTimeout(() => {
      //   this.upLoading = false
      //   // 模拟数
      //   const data = []
      //   // 每次加载一次就追加十条数据
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   this.articles.push(...data)
      //   // 如果article数据中一共有条，追加到50 条就显示加载完成
      //   if (this.articles.length >= 10) {
      //     this.finished = false
      //   }
      // }, 800)
      // 更改模拟数据真实的数据
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 把获取的数据累加到当前频道下的文章列表中
      this.activeChannel.articles.push(...data.results)
      // 结束上拉效果
      this.activeChannel.upLoading = false
      // 判断是不是返回当前的时间戳
      if (!data.pre_timestamp) {
        // 第一种是如果请求与响应的时间戳相等时，代表数据没有了
        // 第二种当数据的时间戳为空时，代表数据更新完毕
        this.activeChannel.finished = true
      } else {
        // 把后端返回的时间戳记录下来，继续请求数据
        this.activeChannel.timestamp = data.pre_timestamp
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}

// 图片的样式
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
