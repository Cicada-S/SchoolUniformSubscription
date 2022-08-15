// pages/orderList/orderList.js
Page({
  data: {
    orderList: [],
    gradeList: [],
    classList: [],
    spareClass: [],
    gradeValue: -1,
    classValue: -1,
    disabled: true
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
      data: { sellQrCodeId, schoolId }
    }).then(res => {
      let { gradeList, classList, order } = res.result.data

      gradeList.unshift({text: '全校', value: -1})
      classList = classList.map(item => {
        item.unshift({text: '全级', value: -1})
        return item
      })

      this.setData({
        gradeList,
        classList: classList[0],
        spareClass: classList,
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
  },

  // 选择年级
  onChangeGrade(event) {
    let spareClass = this.data.spareClass

    if(event.detail === -1) {
      this.setData({ 
        disabled: true,
        gradeValue: -1
      })
    } else {
      this.setData({
        disabled: false,
        classList: spareClass[event.detail],
        gradeValue: event.detail,
        classValue: -1
      })
    }
  },

  // 选择班级
  onChangeClass(event) {
    this.setData({
      classValue: event.detail
    })
  }
})
