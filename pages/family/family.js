// pages/family/family.js
const app = getApp()

const db = wx.cloud.database()
const student = db.collection('Student')

Page({
  data: {
    bottomLift: app.globalData.bottomLift, 
    schoolId: '',
    family: [
      {
        id: 1,
        name: 'Cicada',
        path: '/static/images/family/1.jpg',
        schoolInfo: {
          school: '清华大学幼儿园',
          grade: '一年级',
          class: '1班'
        }
      },
      {
        id: 2,
        name: 'Ting',
        path: '/static/images/family/2.jpg',
        schoolInfo: {
          school: '清华大学幼儿园',
          grade: '一年级',
          class: '1班'
        }
      }
    ]
  },  

  // 页面初始化
  onLoad(options) {
    console.log('页面初始化', options)
    this.setData({
      schoolId: options.schoolId
    })
    let id = '16db756f62ce61f80ac247284ecff688'

    // this.getStudent(id)
  },

  getStudent(id) {
    student.where({  }).get()
    then(res => {
      console.log(res)
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
