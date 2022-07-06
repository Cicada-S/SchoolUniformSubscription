// pages/login/login、.js
const app = getApp()

Page({
  data: {
    stateheight: app.globalData.stateheight,
    icon: '/static/images/login/icon.png',
    coordinate: [
      {x: -20, y: 80},
      {x: 680, y: 150},
      {x: 300, y: 250},
      {x: -20, y: 450},
      {x: 580, y: 540},
      {x: 200, y: 700},
      {x: 450, y: 900},
      {x: 150, y: 1100},
      {x: 650, y: 1200},
      {x: 180, y: 1460},
    ],
    adminOpenId: [
      
    ]
  },

  login() {
    wx.getUserProfile({
      desc: "用于数据展示",
      success(res) {
        wx.setStorageSync('userInfo', res.userInfo)
        wx.navigateTo({
          url: '/pages/index/index'
        })
      },
      fail(err) {
        console.log('err', err)
      }
    }) 
  }
})