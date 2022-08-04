// pages/addStudent/addStudent.js
const db = wx.cloud.database()

Page({
  data: {
    id: '', // 学生id
    schoolId: '', // 学校id
    schoolName: '清华大学幼儿园', // 学校名
    studentName: '', // 学生姓名
    radio: '', // 性别
    phone: '', // 手机号
    multiIndex: [0, 0],
    multiArray: [], 
    classArray: [] // 班级
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
    console.log('添加/编辑学生')
  },

  // 点击确认时触发
  bindMultiPickerChange(event) {
    /* let { multiArray, multiIndex } = this.data
    let gradeVal = multiArray[0][multiIndex[event.detail.value[0]]]
    let classVal = multiArray[1][multiIndex[event.detail.value[1]]] */
    this.setData({
      multiIndex: event.detail.value,
      // gradeValue: `${gradeVal} ${classVal}`
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
