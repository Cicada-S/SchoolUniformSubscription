// pages/QRCode/QRCode.js
const app = getApp() 

Page({
  data: {
    titleValue: '', // 标题
    school: '请选择学校', // 学校
    timeType: '', // 时间类型
    time: { // 时间
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
    actions: [
      {name: '清华大学'},
      {name: '北京大学'},
      {name: '复旦大学'},
      {name: '上海交通大学'},
      {name: '华东师范大学'},
      {name: '上海大学'},
      {name: '上海理工大学'},
    ],
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
    let time = {
      startTime: '',
      endTime: ''
    }
    // 判断当前时间选择器的是不是开始时间
    let type = this.data.timeType === 'startTime' ? true : false
    type ? time.startTime = newDate : time.endTime = newDate
    this.setData({
      // 代码只是写给机器运行的 顺带给人看一下 看不懂也没关系
      ['time.' + this.data.timeType]: time[this.data.timeType],
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
  isProduct(event) {
    console.log(event, 'isProduct');
  },

  // 删除商品 的回调函数
  onDelete(event) {
    console.log(event, 'onDelete');
    let id = event.target.id
  }
});
