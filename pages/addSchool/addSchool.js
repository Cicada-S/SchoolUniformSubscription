// pages/addSchool/addSchool.js
import h from '../../utils/hashCode';

let editLogo = false  // 是否修改logo
let id = '' // 编辑学校的id

Page({
  data: {
    name: '',
    address: '',
    fileList: [],
    // 当前的状态 true(添加学校) false(编辑学校)
    type: true
  },

  // 页面初始化
  onLoad(options) {
    id = options.id
    if(id) {
      this.setData({
        type: false
      })
      wx.setNavigationBarTitle({
        title: '编辑商品'
      })
      this.getSchoolInfo(id)
    }
  },

  // 编辑学校时回填数据
  async getSchoolInfo(id){
    await wx.cloud.callFunction({
      name: 'getSchoolInfo',
      data: {id}
    }).then(res => {
      let {name, address, logo} = res.result.data
      let fileList = [{
        type: 'image',
        name: 'logo',
        url: logo,
        thumb: logo
      }]

      this.setData({
        name,
        address,
        fileList
      })
    })
  },

  // 监听输入框的值
  onChange(event) {
    this.setData({
      [event.target.id]: event.detail
    })
  },

  // 文件读取完成后
  afterRead(event) {
    editLogo = true
    this.setData({
      fileList: [event.detail.file]
    })
  },

  // 添加学校的处理函数
  async addSchool() {
    let text = this.data.type ? '添加' : '修改'
    wx.showLoading({
      title: `${text}中...`
    })
    let { name, address, fileList } = this.data;
    let schoolInfo = {
      name,
      address,
      logo: fileList[0].url,
      remark: ''
    }

    if(editLogo) {
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
      wx.navigateBack({
        delta: 1,
      })
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
