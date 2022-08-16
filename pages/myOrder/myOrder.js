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
  async getOrderList() {
    let { result } = await wx.cloud.callFunction({name: 'getOrderProduct'})
    this.setData({
      orderList: result.data
    })
  }
})
