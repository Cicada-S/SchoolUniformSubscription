// pages/login/login.js
const app = getApp()

const db = wx.cloud.database();
const userCollection = db.collection('User');

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
    adminOpenId: []
  },

  // 登录的回调函数
  getUserProfile() {
    // 获取用户信息
    wx.getUserProfile({
      desc: "用于个人信息展示",
      // 允许授权
      success: res => {

        console.info('userInfo', res.userInfo)
        let user = {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
          gender: res.userInfo.gender,
          mobile: '',
          createDate: new Date()
        }

        userCollection.add({
          data: user,
          success: function(res) {
            wx.reLaunch({
              url: '../index/index'
            })
          }
        })
      },
      // 拒绝授权
      fail: err => {
        console.log('解决授权', err)
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    }) 
  },

  // 获取openId
  /* getOpenId() {
    wx.cloud.callFunction({
      name: 'getOpenId',
    })
    // 获取成功
    .then(res => {
      wx.setStorageSync('openid', res.result.openid)
      
      let userInfo = {
        nickName: wx.getStorageSync('userInfo').nickName,
        avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
        openid: res.result.openid,
      }
      // 将用户添加到数据库
      user.add({data: userInfo})
    })
    // 获取失败
    .catch(err => {
      console.log('err', err)
    })
  }, */
})