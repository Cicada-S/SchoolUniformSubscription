// pages/family/family.js
const app = getApp()

const db = wx.cloud.database()
const student = db.collection('Student')

Page({
  data: {
    bottomLift: app.globalData.bottomLift, 
    schoolId: '', // 学校id
    schoolName: '', // 学校名
    family: [], // 学生
  },

  // 页面初始化
  onLoad(options) {
    let { schoolId, schoolName } = options
    this.setData({
      schoolId,
      schoolName
    })
    this.getStudent(schoolId)
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
    let { schoolId, schoolName } = this.data
    let studentInfo = event.currentTarget.dataset.studentinfo

    wx.navigateTo({
      url: `/pages/addStudent/addStudent?schoolId=${schoolId}&schoolName=${schoolName}&studentInfo=${JSON.stringify(studentInfo)}`
    })
  }
})
