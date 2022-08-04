// pages/family/family.js
const app = getApp()

const db = wx.cloud.database()
const student = db.collection('Student')

Page({
  data: {
    bottomLift: app.globalData.bottomLift, 
    schoolId: '',
    schoolName: '清华大学幼儿园',
    family: []
  },  

  // 页面初始化
  onLoad(options) {
    this.setData({
      schoolId: options.schoolId
    })
    this.getStudent(options.schoolId)
  },

  // 获取家人列表
  getStudent(id) {
    let { _openid } = wx.getStorageSync('currentUser')
    student.where({ schoolId: id, _openid }).get()
    .then(res => {
      this.setData({
        family: res.data
      })
    })
  },

  // 选中孩子 
  onSelect(event) {
    let item = event.currentTarget.dataset.item

    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    prevPage.setData({
      studentInfo: item
    })
    wx.navigateBack({
      delta: 1
    })
  },

  // 编辑
  toEditStudentInfo(event) {
    let { id, schoolid } = event.currentTarget.dataset
    console.log(id, schoolid)
    wx.navigateTo({
      url: `/pages/addStudent/addStudent?schoolId=${schoolid}&id=${id}`
    })
  }
})
