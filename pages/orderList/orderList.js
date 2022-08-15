// pages/orderList/orderList.js
Page({
  data: {
    orderList: [],
    gradeList: [],
    classList: [],
    gradeValue: -1,
    classValue: -1,
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
      console.log(res.result.data)
      let { gradeList, classList, order } = res.result.data

      gradeList.unshift({text: '全校', value: -1})
      classList[0].unshift({text: '全级', value: -1})

      this.setData({
        gradeList,
        classList: classList[0],
        orderList: order
      })
    })
  },

  // 搜索
  search(event){
    this.setData({
      pageIndex: 1,
      QRCodelList: [],
      reachBottom: false,
      searchValue: event.detail.searchValue
    })
    this.getOrderList()
  }
})
