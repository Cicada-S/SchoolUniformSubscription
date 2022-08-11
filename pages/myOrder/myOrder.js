// pages/myOrder/myOrder.js
const db = wx.cloud.database()
const Order = db.collection('Order')

Page({
  data: {
    orderList: []
  },

  onLoad() {
    this.getOrderList()
  },

  // 获取
  getOrderList() {
    let { _openid } = wx.getStorageSync("currentUser")

    console.log(_openid)

    /* Order.where({_openid}).get()
    .then(res => {
      console.log(res)
    }) */

    wx.cloud.callFunction({
      name: 'getOrderProduct',
      data: { _openid }
    })
  }
})
