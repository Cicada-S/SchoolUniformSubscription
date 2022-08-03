// pages/addStudent/addStudent.js
const db = wx.cloud.database()
/* const school = db.collection('School')
const grade = db.collection('Grade') */

Page({
  data: {
    id: '', // 学生id
    schoolId: '', // 学校id
    schoolName: '清华大学幼儿园', // 学校名
    studentName: '', // 学生姓名
    radio: '', // 性别
    phone: '', // 手机号
    multiIndex: [],
    multiArray: [
      ['一年级', '二年级'], 
      ['1班', '2班', '3班', '4班', '5班'] // 一年级对应的班级
    ],
  },

  // 页面初始化
  onLoad(options) {
    console.log(options)
    let { id, schoolId } = options
    this.setData({ 
      id,
      schoolId 
    })

    if(id) {
      wx.setNavigationBarTitle({
        title: '编辑学生'
      })
    }

    this.getSchool(schoolId)
  },

  // 获取学校列表
  getSchool(schoolId) {
    /* school.doc(schoolId).get().then(res => {
      console.log('学校', res)
    })

    grade.where({ schoolId }).get().then(res => {
      console.log('年级', res)
    }) */

    wx.cloud.callFunction({
      name: 'getGrade',
      data: { schoolId }
    }).then(res => {
      console.log('获取学校年级', res)
    })
  },

  // 监听输入框的值
  onChangeValue(event) {
    this.setData({
      [event.currentTarget.id]: event.detail
    })
  },

  //选择性别
  onChange(event) {
    this.setData({
      radio: event.detail
    });
  },

  // 添加/编辑 学生
  addStudent() {
    console.log('添加/编辑学生')
  },

  // value 改变时触发
  bindMultiPickerChange(event) {
    console.log('picker发送选择改变，携带值为', event.detail.value)
    this.setData({
      multiIndex: event.detail.value
    })
  },

  // 列改变时触发
  bindMultiPickerColumnChange(event) {
    console.log('修改的列为', event.detail.column, '，值为', event.detail.value)
    const data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[event.detail.column] = event.detail.value
    if(event.detail.column === 0) {
      switch (data.multiIndex[0]) {
        case 0:
          data.multiArray[1] = ['1班', '2班', '3班', '4班', '5班']
          break
        case 1:
          data.multiArray[1] = ['1班', '2班', '3班', '4班', '5班']
          break
      }
      data.multiIndex[1] = 0
    }
    console.log(data.multiIndex)
    this.setData(data);
  }
})
