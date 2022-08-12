// pages/orderList/orderList.js
Page({
  data: {
    orderList: []
  },

  // 页面初始化
  onLoad(options) {
    console.log(options)

    // this.getOrderList(options.id)
  },

  // 获取订单列表
  getOrderList(id) {
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: { sellQrCodeId: id }
    }).then(res => {
      console.log(res)
    })
  }
})
