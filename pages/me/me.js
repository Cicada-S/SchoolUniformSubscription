// pages/me/me.js
const app = getApp()

Page({
  data: {
    stateheight: app.globalData.stateheight,
    customheight: app.globalData.customheight,
    userInfo: {},
    /* orderManage: [
      {
        icon: 'icon-dingdan-daifukuan',
        text: '待付款',
      },
      {
        icon: 'icon-daifahuo',
        text: '待发货',
      },
      {
        icon: 'icon-daishouhuo',
        text: '待收货',
      },
      {
        icon: 'icon-pingjiax',
        text: '待评价',
      },
      {
        icon: 'icon-tuikuan',
        text: '退款/售后',
      }
    ], */
  },

  // 页面初始化
  onLoad() {
    let userInfo = wx.getStorageSync('currentUser')
    this.setData({
      userInfo
    })
  }
})
