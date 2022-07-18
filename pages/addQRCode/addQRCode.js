// pages/QRCode/QRCode.js
const app = getApp()

const db = wx.cloud.database()
const School = db.collection('School')

import { toDates } from '../../utils/util'

Page({
  data: {
    titleValue: '', // 标题
    school: '请选择学校', // 学校
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
    goodsDataList: [
      {
        id: 1,
        title: '夏季运动套装',
        imageURL: '/static/images/productAdmin/product.png',
      },
      {
        id: 2,
        title: '夏季运动套装',
        imageURL: '/static/images/productAdmin/product.png',
      },
    ],
    bottomLift: app.globalData.bottomLift,
  },

  // 页面初始化
  onLoad(options) {
    console.log(JSON.parse(options.data))

    this.getSchoolList()
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
    console.log(event.detail.name, 'onSelect');
    this.setData({
      school: event.detail.name,
    });
  },

  // 学校选择器 关闭时 的回调函数
  onClose(event) {
    this.setData({
      schoolShow: false
    });
  },

  // 时间选择器 点击确定 的回调函数
  onConfirm(event) {
    console.log(event, 'onConfirm');
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
    });
  },
  
  // 选择商品 的回调函数
  isProduct() {
    wx.navigateTo({
      url: '/pages/selectProduct/selectProduct'
    })
  },

  // 删除商品 的回调函数
  onDelete(event) {
    console.log(event, 'onDelete');
    let id = event.target.id
  },

  // 获取学校
  async getSchoolList() {
    console.log('getSchool')
    await School.get().then(res => {
      this.setData({
        actions: res.data
      })
    })
  },


  // 生成二维码
  addQRCode() {
    console.log('生成')
  }
})
