// pages/schoolAdmin/schoolAdmin.js
const db = wx.cloud.database()
const School = db.collection('School')

Page({
  data: {
    schoolList: [],
  },

  onLoad() {
    this.getSchoolList()
  },

  async getSchoolList() {
    await School.get().then(res => {
      this.setData({
        schoolList: res.data
      })
    })
  },

  toAddSchool() {
    wx.navigateTo({
      url: '/pages/addSchool/addSchool',
    })
  }
})
