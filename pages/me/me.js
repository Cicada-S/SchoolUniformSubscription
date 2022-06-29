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
        icon: '/static/images/me/order1.png',
        text: '待付款',
      },
      {
        icon: '/static/images/me/order2.png',
        text: '待发货',
      },
      {
        icon: '/static/images/me/order3.png',
        text: '待收货',
      },
      {
        icon: '/static/images/me/order4.png',
        text: '待评价',
      },
      {
        icon: '/static/images/me/order5.png',
        text: '退款/售后',
      }
    ],
  }
})