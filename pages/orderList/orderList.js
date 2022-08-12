// pages/orderList/orderList.js
Page({
  data: {
    orderList: [],
    option1: [
      { text: '全校', value: 0 },
      { text: '一年级', value: 1 },
      { text: '二年级', value: 2 },
    ],
    option2: [
      { text: '全年级', value: 'a' },
      { text: '1班', value: 'b' },
      { text: '2班', value: 'c' },
    ],
    value1: 0,
    value2: 'a',
  },

  // 页面初始化
  onLoad(options) {
    console.log(options)
    let sellQrCodeId = '0a4ec1f962f45b2c19049662135c755d'
    let schoolId = '8f75309d62ea237d102837180c8273de'

    this.getOrderList(sellQrCodeId, schoolId)
  },

  // 获取订单列表
  getOrderList(sellQrCodeId, schoolId) {
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: { sellQrCodeId, schoolId}
    }).then(res => {
      console.log(res)
    })
  }
})
