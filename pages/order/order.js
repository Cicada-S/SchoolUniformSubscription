// pages/order/order.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    schoolId: '', // 买家id
    schoolName: '', // 买家名
    studentInfo: {}, // 小朋友信息
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
      totalPrice = parseFloat(totalPrice) + parseFloat(item.unitPrice*item.operation)
    })

    this.setData({
      orderNum,
      totalPrice
    })
  },

  // 结算
  async settlement() {
    wx.showLoading({
      title: '正在支付...',
    })

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

    if(results.result.code == 1){
      wx.showToast({
        title: results.result.error,
        icon: 'none',
        duration: 3000
      })
    }

    let orderId = results.result.orderId
    this.pay(orderId)
  },

  // 发起微信支付
  pay(orderId){
    wx.cloud.callFunction({
      name: 'pay',
      data:{ orderId: orderId }
    }).then(res => {

      const payment = res.result.payment
      console.info(JSON.stringify(payment))
      wx.hideLoading()
      // 发起微信支付
      wx.requestPayment({...payment})
      .then(() => {
        wx.removeStorageSync('shopCart')
        wx.showToast({
          title: '下单成功！',
          icon: 'success',
          duration: 2000
        })
        setTimeout(()=> {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      })
      .catch(() => {
        wx.showToast({
          title: '支付失败！',
          icon: 'success',
          duration: 2000
        })
      })
    })
  }
})
