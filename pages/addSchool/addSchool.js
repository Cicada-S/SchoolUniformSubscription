// pages/addSchool/addSchool.js
Page({
  data: {
    form: {
      schoolName: '',
      schoolAddress: '',
    },
    fileList: []
  },

  // 监听输入框的值
  onChange(event) {
    const type = {
      name: 'schoolName',
      address: 'schoolAddress',
    }
    this.setData({
      ['form.' + type[event.target.id]]: event.detail
    })
  },

  // 文件读取完成后
  afterRead(event) {
    this.setData({
      fileList: [event.detail.file]
    })
  },

  // 添加学校的处理函数
  addSchool() {
    let { form, fileList } = this.data;
    let schoolInfo = {
      form,
      fileList
    }
  }
})
