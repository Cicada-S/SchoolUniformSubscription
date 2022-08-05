// pages/addStudent/addStudent.js
const db = wx.cloud.database()

Page({
  data: {
    studentId: '', // 学生id
    schoolId: '', // 学校id
    schoolName: '', // 学校名
    studentName: '', // 学生姓名
    radio: '', // 性别
    phone: '', // 手机号
    multiIndex: [0, 0],
    multiArray: [], 
    classArray: [], // 班级
    studentInfo: {} // 编辑时显示
  },

  // 页面初始化
  onLoad(options) {
    let { studentInfo, schoolId, schoolName } = options
    this.setData({
      schoolId,
      schoolName
    })

    // 编辑学生时 数据回填
    if(studentInfo !== 'undefined') {
      studentInfo = JSON.parse(studentInfo)
      this.setData({
        studentName: studentInfo.name,
        radio: studentInfo.gender,
        phone: studentInfo.phoneNumber
      })
      wx.setNavigationBarTitle({
        title: '编辑学生'
      })
    }

    this.getSchool(schoolId)
  },

  // 获取学校列表
  getSchool(schoolId) {
    wx.cloud.callFunction({
      name: 'getGrade',
      data: { schoolId }
    }).then(res => {
      let { school, grade } = res.result.data

      let multiArray = grade.slice(0, 2)
      let classArray = grade.slice(1, grade.length)
      
      this.setData({
        schoolName: school.name,
        multiArray,
        classArray
      })
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
    wx.showLoading({
      title: '添加中...',
    })
    let { studentName, radio, phone, schoolId, multiArray, multiIndex } = this.data
    let gradeName = multiArray[0][multiIndex[0]]
    let classNmae = multiArray[1][multiIndex[1]]

    let data = {
      name: studentName,
      gender: radio,
      phoneNumber: phone,
      schoolId: schoolId,
      gradeName,
      classNmae
    }

    wx.cloud.callFunction({
      name: 'addStudent',
      data
    }).then(res => {
      wx.hideLoading()
      wx.navigateBack({
        delta: 1
      })
    }).catch(err => {
      wx.showToast({
        title: '添加失败',
        icon: 'error',
        duration: 2000
      })
    })
  },

  // 点击确认时触发
  bindMultiPickerChange(event) {
    this.setData({
      multiIndex: event.detail.value,
    })
  },

  // 列改变时触发
  bindMultiPickerColumnChange(event) {
    const data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[event.detail.column] = event.detail.value

    this.data.classArray.forEach((item, index) => {
      if(event.detail.column === 0) {
        if(data.multiIndex[0] === index) {
          data.multiArray[1] = item
        }
        data.multiIndex[1] = 0
      }
      this.setData(data);
    })
  }
})
