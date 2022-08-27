// pages/orderList/orderList.js
Page({
  data: {
    searchValue: '', // 搜索框的值
    gradeText: '', // 年级所选text
    classText: '', // 班级所选text
    orderList: [], // 订单
    gradeList: [], // 年级
    classList: [], // 当前年级的班级
    spareClass: [], // 全部班级
    gradeValue: 0, // 年级默认值
    classValue: 0, // 班级默认值
    pageIndex: 1, // 当前分页
    reachBottom: false, // 是否到底
    sellQrCodeId: ''
  },

  // 页面初始化
  onLoad(options) {
    console.log(options)
    let sellQrCodeId = options.sellQrCodeId
    let schoolId = options.schoolId
    this.setData({
      'sellQrCodeId': sellQrCodeId,
    })
    this.getOrderGrade(sellQrCodeId, schoolId)
  },

  // 获取订单 年级
  getOrderGrade(sellQrCodeId, schoolId) {
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: { sellQrCodeId, schoolId }
    }).then(res => {
      let { gradeList, classList, order } = res.result.data

      this.setData({
        gradeList,
        gradeText: gradeList[0].text,
        classList: classList[0],
        spareClass: classList,
        orderList: order
      })
    })
  },

  // 筛选订单
  screenOrder(sellQrCodeId) {
    let { searchValue, gradeText, classText } = this.data
    // 筛选条件
    let screen = {
      studentName: searchValue,
      studentGradeName: gradeText,
      studentClassName: classText
    }

    let newScreen = {}
    for(let key in screen) {
      if(screen[key] !== '') {
        newScreen[key] = screen[key]
      }
    }

    console.info('newScreen==='+ JSON.stringify(newScreen))
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: { sellQrCodeId, newScreen }
    }).then(res => {
      this.setData({
        orderList: res.result.data.order
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
    this.screenOrder(this.data.sellQrCodeId)
  },

  // 选择年级
  onChangeGrade(event) {
    let { spareClass, gradeList } = this.data
    let gradeText = ''
    gradeList.forEach(item => {
      if(item.value === event.detail) gradeText = item.text
    })

    this.setData({
      classList: spareClass[event.detail],
      gradeValue: event.detail,
      classValue: 0,
      gradeText,
      classText: spareClass[event.detail][0].text
    })
    this.screenOrder(this.data.sellQrCodeId)
  },

  // 选择班级
  onChangeClass(event) {
    let { classList } = this.data
    let classText = ''
    classList.forEach(item => {
      if(item.value === event.detail) classText = item.text
    })

    this.setData({
      classValue: event.detail,
      classText
    })
    this.screenOrder(this.data.sellQrCodeId)
  }
})
