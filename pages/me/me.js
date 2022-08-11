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

  // 跳转到我的订单
  toMyOrder() {
    wx.navigateTo({
      url: '/pages/myOrder/myOrder'
    })
  },

  // 跳转到申请管理员
  toApply(event) {
    wx.navigateTo({
      url: '/pages/apply/apply'
    })
  }
})
