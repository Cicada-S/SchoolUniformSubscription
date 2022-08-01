// pages/me/me.js
const app = getApp()

Page({
  data: {
    stateheight: app.globalData.stateheight,
    customheight: app.globalData.customheight,
    userInfo: {
      avatarUrl: '/static/images/me/avatar.png',
      nickName: 'Cicada'
    },
    orderManage: [
      {
        icon: 'icon-dingdan-daifukuan',
        text: '待付款',
      },
      {
        icon: 'icon-daifahuo',
        text: '待发货',
      },
      {
        icon: 'icon-daishouhuo',
        text: '待收货',
      },
      {
        icon: 'icon-pingjiax',
        text: '待评价',
      },
      {
        icon: 'icon-tuikuan',
        text: '退款/售后',
      }
    ],
  },

  pay(){
    let orderId = 'f6e08a6462e69f500ea5ced51118354c'
    wx.showLoading({
      title: '正在支付',
    })
    wx.cloud.callFunction({
      name: 'pay',  //云函数的名称
      data:{
        orderId: orderId
      },
      success: res => {
        const payment = res.result.payment
        console.info(JSON.stringify(payment))
        wx.hideLoading();
        wx.requestPayment({
          ...payment, //...这三点是 ES6的展开运算符，用于对变量、数组、字符串、对象等都可以进行解构赋值。
          success (res) {
             //这里success回调函数只有用户点击了“完成”或者返回键才会被触发
             //所以不要在这里写改变订单为已支付的业务逻辑
             //万一用户支付完成，但不点击"完成"或者返回键，那会造成数据不一致性的问题
            console.log('支付成功', res)
            wx.showToast({
              title: '下单成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail (err) {
            console.error('支付失败', err) //支付失败之后的处理函数，写在这后面
          },
        })
      },
      fail(err){
          //为了节省数据库的空间，支付失败的订单可以删除
      },
    })
  },
})