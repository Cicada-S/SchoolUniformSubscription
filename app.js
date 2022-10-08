// app.js
import { checkUpdateVersion } from 'utils/checkUpdateVersion'

App({
  globalData: {
    stateheight: 0, // 手机状态栏高度
    navhegiht: 0, // 导航栏高度
    customheight: 0, // 自定以导航栏高度
    bottomLift: 0, // 底部距离
  },

  onLaunch() {

    //判断是否有更新版本
    checkUpdateVersion()

    wx.cloud.init({
      // env: 'cloud1-9ghc7y1j0db0f20d',
      env: 'prod-5gbrg2v163ae3d24',
      traceUser: true
    })

    // this.isLogin()
    this.getPhoneHeight()
    this.getSystemInfo()
  },

  // 判断用户是否登录
  /* isLogin() {
    if (!wx.getStorageSync('openid')) {
      wx.redirectTo({url: '/pages/login/login'})
    } else {
      wx.switchTab({url: '/pages/index/index'})
    }
  }, */

  // 获取 状态栏 导航栏 自定义导航栏 高度
  getPhoneHeight() {
    // 获取手机状态栏信息和高度
    const phoneinfo = wx.getSystemInfoSync()
    const stateheight = phoneinfo.statusBarHeight
    // 获取胶囊按钮的信息
    const button = wx.getMenuButtonBoundingClientRect()
    // 获取导航栏高度
    const navhegiht = button.height + (button.top - stateheight) * 2
    // 计算自定义导航栏高度
    const customheight = navhegiht + stateheight
    // 赋值
    this.globalData.stateheight = stateheight
    this.globalData.navhegiht = navhegiht
    this.globalData.customheight = customheight
  },

  // 获取 iPhoneX底部 高度
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.bottomLift = res.screenHeight - res.safeArea.bottom;
      }
    })
  }
})
