// pages/order/order.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    schoolId: '', // 学校id
    schoolName: '', // 学校名
    studentInfo: {}, // 学生信息
    productList: [], // 商品
    remarksVlaue: '', // 备注内容
    orderNum: 0, // 商品数量
    totalPrice: 0, // 总价
    sellQrCodeId: '', // 二维码id
    sellQrCodeTitle: '' // 二维码标题
  },

  // 页面初次渲染
  onLoad(options) {
    let { schoolName, schoolId, QrCodeId, QrCodeTitle } = options

    let shopCart = wx.getStorageSync('shopCart')
    let studentInfo = wx.getStorageSync('studentInfo')

    this.setData({
      schoolName: schoolName,
      schoolId: schoolId,
      studentInfo,
      productList: shopCart,
      sellQrCodeId: QrCodeId,
      sellQrCodeTitle: QrCodeTitle
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
  async settlement() {
    console.log('settlement')

    let { sellQrCodeId, sellQrCodeTitle, schoolId, schoolName, studentInfo, totalPrice, productList, remarksVlaue } = this.data


    let order = {
      sellQrCodeId,
      sellQrCodeTitle,
      schoolId,
      schoolName,
      studentName: studentInfo.name,
      studentGender: studentInfo.gender,
      studentGradeName: studentInfo.gradeName,
      studentClassName: studentInfo.className,
      totalPrice,
      remark: remarksVlaue
    }

    let results = await wx.cloud.callFunction({
      name: 'addOrder',
      data: {
        order,
        productList
      }
    })

    let orderId = results.result.orderId
    console.log(orderId)
    
  }
})
