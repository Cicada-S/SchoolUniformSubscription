// pages/schoolAdmin/schoolAdmin.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    schoolList: [
      {
        id: 1,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
      {
        id: 2,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
      {
        id: 3,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
      {
        id: 4,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
      {
        id: 5,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
      {
        id: 6,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
      {
        id: 7,
        name: '清华大学幼儿园',
        image: '/static/images/schoolAdmin/logo.png',
      },
    ],
  },

  onLoad: function (options) {
    // getSchoolList()
  },

  getSchoolList() {
    wx.request({
      url: 'http://localhost:8080/school/getSchoolList',
      method: 'GET',
      success: function (res) {
        console.log(res.data)
      }
    })
  },

  toAddSchool() {
    wx.navigateTo({
      url: '/pages/addSchool/addSchool',
    })
  }
})