// pages/orderList/orderList.js
Page({
  data: {
    orderList: [], // 订单
    gradeList: [], // 年级
    classList: [], // 当前年级的班级
    spareClass: [], // 全部班级
    gradeValue: 0, // 年级默认值
    classValue: -1, // 班级默认值
    pageIndex: 1, // 当前分页
    reachBottom: false, // 是否到底
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
    let gradeName = ''
    let className = ''
    this.data.gradeList.forEach(item => {
      console.log('item', item)
      if (item.value == this.data.gradeValue) gradeName = item.text
    })

    wx.cloud.callFunction({
      name: 'getOrderList',
      data: { sellQrCodeId, schoolId }
    }).then(res => {
      let { gradeList, classList, order } = res.result.data

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
      orderList: [],
      reachBottom: false,
      searchValue: event.detail.searchValue
    })
    this.getOrderList()
  },

  // 选择年级
  onChangeGrade(event) {
    let spareClass = this.data.spareClass
    this.setData({
      classList: spareClass[event.detail],
      gradeValue: event.detail,
      classValue: -1
    })
  },

  // 选择班级
  onChangeClass(event) {
    this.setData({
      classValue: event.detail
    })
  }
})
