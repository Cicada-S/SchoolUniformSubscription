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

    this.getSchool(schoolId, studentInfo)
  },

  // 编辑学生时 数据回填 
  backfillData(studentInfo) {
    studentInfo = JSON.parse(studentInfo)

    let { multiArray, classArray } = this.data
    let { gradeName, classNmae } = studentInfo
    
    let gradeIndex = multiArray[0].indexOf(gradeName)
    let classIndex = classArray[gradeIndex].indexOf(classNmae)
    multiArray[0] = multiArray[0]
    multiArray[1] = classArray[gradeIndex]

    this.setData({
      studentId: studentInfo._id,
      studentName: studentInfo.name,
      radio: studentInfo.gender,
      phone: studentInfo.phoneNumber,
      multiIndex: [gradeIndex, classIndex],
      multiArray
    })
    wx.setNavigationBarTitle({
      title: '编辑学生'
    })
  },

  // 获取学校列表
  getSchool(schoolId, studentInfo) {
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

      if(studentInfo !== 'undefined') this.backfillData(studentInfo)
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
    let text = this.data.studentId ? '编辑' : '添加'

    wx.showLoading({
      title: `${text}中...`,
    })
    let { studentName, radio, phone, schoolId, multiArray, multiIndex, studentId } = this.data
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

    let results = !studentId ? this.request('addStudent', data) : this.request('editStudent', data, studentId)

    results.then(() => {
      wx.hideLoading()
      wx.navigateBack({
        delta: 1
      })
    }).catch(() => {
      wx.showToast({
        title: `${text}失败`,
        icon: 'error',
        duration: 2000
      })
    })
  },

  // 添加/编辑学生的请求
  async request(surface, data, studentId) {
    data.studentId = studentId
    return await wx.cloud.callFunction({
      name: surface,
      data
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
