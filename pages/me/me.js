// pages/me/me.js
const app = getApp()

Page({
  data: {
    stateheight: app.globalData.stateheight,
    customheight: app.globalData.customheight,
    userInfo: {}
  },

  // 页面初始化
  onLoad() {
    let userInfo = wx.getStorageSync('currentUser')
    this.setData({
      userInfo
    })
  },

  // 跳转到申请管理员
  toApply(event) {
    console.log(event)
    wx.navigateTo({
      url: '/pages/apply/apply'
    })
  }
})
