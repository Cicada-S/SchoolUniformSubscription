// pages/QRCode/QRCode.js
const app = getApp()

const db = wx.cloud.database()
const School = db.collection('School')

import { toDates } from '../../utils/util'

let selectProductId = [] // 选中的商品id

Page({
  data: {
    titleValue: '', // 标题
    school: {
      id: '',
      name: '请选择学校'
    }, // 学校
    timeType: '', // 时间类型 开始 结束
    time: { // 时间戳
      startTime: '',
      endTime: '',
    },
    date: { // 显示在页面的日期
      startTime: '',
      endTime: '',
    },
    timeShow: false, // 时间选择器显示状态
    schoolShow: false, // 学校选择器显示状态
    // 时间选择器
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date(2050, 12, 31).getTime(),
    currentDate: new Date().getTime(),
    // 学校选择器 
    actions: [],
    // 商品数据
    goodsDataList: [],
    bottomLift: app.globalData.bottomLift,
    type: true, // 当前状态  true新增  false查看
  },

  // 页面初始化
  onLoad(options) {
    if(options.id) {
      this.setData({
        type: false
      })
      wx.setNavigationBarTitle({
        title: '二维码'
      })
    }
    this.getSchoolList()
    this.getQRCodeInfo(options.id)
  },

  // 页面显示
  onShow() {
    try {
      let data = JSON.parse(wx.getStorageSync('selectProductList'))
      wx.removeStorageSync('selectProductList')
      selectProductId = data?.map(item => item._id)
      this.setData({
        goodsDataList: data
      })
    }
    catch(err) {}
  },

  // 查看二维码时 数据回填
  async getQRCodeInfo(id) {
    await wx.cloud.callFunction({
      name: 'getQRCodeInfo',
      data: {id}
    }).then(res => {
      console.log('请求成功', res.result.data)

      let { title, schoolName, schoolId, beginTime, endTime } = res.result.data.SellQrCode

      this.setData({
        titleValue: title,
        ['school.name']: schoolName,
        ['school.id']: schoolId,
        ['date.startTime']: toDates(beginTime),
        ['date.endTime']: toDates(endTime),
        goodsDataList: res.result.product
      })
    })
  },

  // 标题
  onChange(event) {
    this.setData({
      titleValue: event.detail
    })
  },
 
  // 点击 弹出选择框 的回调函数
  isActionSheet(event) {
    if (event.target.id === 'school') {
      this.setData({
        schoolShow: true,
      })
    }else {
      this.setData({
        timeShow: true,
        timeType: event.target.id
      })
    }
  },

  // 学校选择器 选择时 的回调函数
  onSelect(event) {
    let school = {
      id: event.detail._id,
      name: event.detail.name
    }
    this.setData({
      school: school
    })
  },

  // 学校选择器 关闭时 的回调函数
  onClose(event) {
    this.setData({
      schoolShow: false
    })
  },

  // 时间选择器 点击确定 的回调函数
  onConfirm(event) {
    let newDate = event.detail
    this.setData({
      // 代码只是写给机器运行的 顺带给人看一下
      ['time.' + this.data.timeType]: newDate,
      ['date.' + this.data.timeType]: toDates(newDate),
      timeShow: false
    })
  },

  // 时间选择器 点击取消和遮罩层 的回调函数
  onCancel(event) {
    this.setData({
      timeShow: false,
    })
  },
  
  // 选择商品 的回调函数
  isProduct() {
    wx.navigateTo({
      url: `/pages/selectProduct/selectProduct?id=${JSON.stringify(selectProductId)}`
    })
  },

  // 删除商品 的回调函数
  onDelete(event) {
    let newGoodsDataList = this.data.goodsDataList.filter(item => {
      if(item._id === event.target.id) {
        selectProductId.splice(selectProductId.indexOf(item._id), 1)
      }
      return item._id !== event.target.id
    })
    this.setData({
      goodsDataList: newGoodsDataList
    })
  },

  // 获取学校
  async getSchoolList() {
    await School.get().then(res => {
      this.setData({
        actions: res.data
      })
    })
  },

  // 生成二维码
  async addQRCode() {
    console.log('生成二维码')
    
    wx.showLoading({
      title: '上传中...'
    })

    let { titleValue, time, school} = this.data

    await wx.cloud.callFunction({
      name: 'addQRCode',
      data: {
        title: titleValue,
        beginTime: time.startTime,
        endTime: time.endTime,
        schoolId: school.id,
        schoolName: school.name,
        createTime: new Date(),
        selectProductId: selectProductId
      }
    }).then(res => {
      console.log('生成成功', res)
      wx.hideLoading()
      wx.navigateBack({
        delta: 1
      })
    }).catch(err => {
      console.log('生成失败', err)
      wx.hideLoading()
    })
  },

  onUnload() {
    selectProductId = []
  }
})
