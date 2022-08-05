// pages/order/order.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    schoolNmae: '',
    studentInfo: {},
    productList: [],
    remarksVlaue: '', // 备注内容
    orderNum: 0,
    totalPrice: 0,
  },

  // 页面初次渲染
  onLoad(options) {
    let { student, school } = options
    let shopCart = wx.getStorageSync('shopCart')

    this.setData({
      schoolName: school,
      studentInfo: JSON.parse(student),
      productList: shopCart
    })

    this.countTotalPrice()
  },

  // 监听备注输入框的值
  onChange(event) {
    this.setData({ remarksVlaue: event.detail })
  },

  // 计算总价和数量
  countTotalPrice() {
    let { productList } = this.data
    let orderNum = 0
    let totalPrice = 0
    if(productList.length) productList.forEach(item => {
      orderNum += item.operation
      totalPrice = (parseFloat(totalPrice) + parseFloat(item.unitPrice*item.operation)).toFixed(2)
    })

    this.setData({
      orderNum,
      totalPrice
    })
  },

  // 结算
  settlement() {
    console.log('结算')
  }
})
