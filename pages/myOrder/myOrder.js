// pages/myOrder/myOrder.js
Page({
  data: {
    orderList: []
  },

  // 页面初始化
  onLoad() {
    this.getOrderList()
  },

  // 获取订单商品列表
  getOrderList() {
    let { _openid } = wx.getStorageSync("currentUser")

    wx.cloud.callFunction({
      name: 'getOrderProduct',
      data: { _openid }
    }).then(res => {
      this.setData({
        orderList: res.result.data
      })
    })
  }
})
