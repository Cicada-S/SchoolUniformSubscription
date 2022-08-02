// pages/addStudent/addStudent.js
const db = wx.cloud.database()
const school = db.collection('School')

const areaList = {
  province_list: {
    110000: '北京市',
    120000: '天津市',
  },
  city_list: {
    110100: '北京市',
    120100: '天津市',
  },
  county_list: {
    110101: '东城区',
    110102: '西城区',
  },
}

Page({
  data: {
    schoolId: '', // 学校id
    studentName: '', // 学生姓名
    radio: '', // 性别
    phone: '', // 手机号
    show: false, // 选择班级
    areaList: {}
  },

  // 页面初始化
  onLoad(options) {
    let id = options.id
    this.setData({ schoolId: id })
    if(id) {
      wx.setNavigationBarTitle({
        title: '编辑学生'
      })
    }

    // this.getSchool()
  },

  // 获取学校列表
  getSchool() {
    school.get().then(res => {
      console.log(res)
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

  // 打开弹出层
  showPopup() {
    this.setData({ show: true });
  },

  // 关闭弹出层
  onClose() {
    this.setData({ show: false });
  }
})
