// pages/addSchool/addSchool.js
import h from '../../utils/hashCode';

let id = '' // 编辑学校的id

Page({
  data: {
    name: '',
    address: '',
    grade: [
      {
        name: '',
        className: [''],
      }
    ],
    fileList: [],
    // 当前的状态 true(添加学校) false(编辑学校)
    type: true,
    editLogo: false,
  },

  // 页面初始化
  onLoad(options) {
    id = options.id
    if(id) {
      this.setData({
        type: false
      })
      wx.setNavigationBarTitle({
        title: '编辑学校'
      })
      this.getSchoolInfo(id)
    }
  },

  // 编辑学校时回填数据
  async getSchoolInfo(id) {
    console.log(id)
    await wx.cloud.callFunction({
      name: 'getSchoolInfo',
      data: { id }
    }).then(res => {
      console.log(res.result.data)
      let { school, grade } = res.result.data
      let fileList = [{
        type: 'image',
        name: 'logo',
        url: school.logo,
        thumb: school.logo
      }]

      this.setData({
        name: school.name,
        address: school.address,
        fileList,
        grade
      })
    })
  },

  // 监听输入框的值
  onChange(event) {
    this.setData({
      [event.target.id]: event.detail
    })
  },

  // 监听年级中输入框的值
  onChangeSpec(event) {
    // index 为年级的索引 id 为年级中选项的索引
    let { index, id } = event.currentTarget.dataset
    // 不能直接使用 !id 因为 id=0 时为 false
    if(!id && id !== 0) {
      this.setData({
        [`grade[${index}].name`]: event.detail
      })
    } else {
      this.setData({
        [`grade[${index}].className[${id}]`]: event.detail
      })
    }
  },

  // 添加年级中的选项
  addSpecValue(event) {
    let { id } = event.target
    let className = this.data.grade[id].className
    className.push('')
    this.setData({
      [`grade[${id}].className`]: className
    })
  },

  // 添加年级
  addSpec() {
    let grade = this.data.grade
    grade.push({
      name: '',
      className: ['']
    })
    this.setData({
      grade
    })
  },

  // 文件读取完成后
  afterRead(event) {
    this.setData({
      editLogo: true,
      fileList: [event.detail.file]
    })
  },

  // 添加学校的处理函数
  async addSchool() {
    let text = this.data.type ? '添加' : '修改'
    wx.showLoading({
      title: `${text}中...`
    })
    let { name, address, fileList, grade} = this.data;
    console.log(grade)

    let schoolInfo = {
      name,
      address,
      grade,
      logo: fileList[0].url,
      remark: '',
    }

    if(this.data.editLogo) {
      let imageName = h() + fileList[0].url.match(/.[^.]+$/)[0]
      // 将图片上传到云存储
      await wx.cloud.uploadFile({
        cloudPath: imageName,
        filePath: fileList[0].url
      }).then(res => {
        schoolInfo.logo = res.fileID
      })
    }

    // 添加/修改 学校
    let results = this.data.type ? this.request('addSchool', schoolInfo) : this.request('editSchool', schoolInfo)

    results.then(res => {
      wx.hideLoading()
      wx.showToast({
        title: `${text}成功`,
        icon: 'success',
        duration: 1000
      })

      setTimeout(function () {
        wx.hideToast();
        wx.navigateBack({
          delta: 1
        })
      }, 1500);

    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: `${text}失败`,
        icon: 'error',
        duration: 1000
      })
    })
  },

  // 添加/修改商品的请求
  async request(surface, data) {
    data.id = id
    return await wx.cloud.callFunction({
      name: surface,
      data
    })
  }
})
