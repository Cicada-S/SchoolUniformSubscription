// pages/family/family.js
const app = getApp()

const db = wx.cloud.database()
const student = db.collection('Student')

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    schoolId: '', // 买家id
    schoolName: '', // 买家名
    family: [], // 小朋友
    flag: 0
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
  onShow(){
    //新增或者修改家人信息后需要刷新列表
    this.setData({
      flag: this.data.flag + 1
    })
    
    console.info('this.data.flag .........' + this.data.flag)
    if(this.data.flag > 1 && this.data.schoolId){
      console.info('refresh .........')
      this.getStudent(this.data.schoolId)
    }
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
    let studentInfo = event.currentTarget.dataset.item
    wx.setStorageSync('studentInfo', studentInfo)
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
