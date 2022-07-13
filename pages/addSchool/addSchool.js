// pages/addSchool/addSchool.js
import h from '../../utils/hashCode';

Page({
  data: {
    name: '',
    address: '',
    fileList: []
  },

  // 监听输入框的值
  onChange(event) {
    this.setData({
      [event.target.id]: event.detail
    })
  },

  // 文件读取完成后
  afterRead(event) {
    this.setData({
      fileList: [event.detail.file]
    })
  },

  // 添加学校的处理函数
  async addSchool() {
    wx.showLoading({
      title: '加载中'
    })
    let { name, address, fileList } = this.data;
    let schoolInfo = {
      name,
      address,
      logo: '',
      remark: ''
    }

    let imageName = h() + fileList[0].url.match(/.[^.]+$/)[0]
    // 将图片上传到云存储
    await wx.cloud.uploadFile({
      cloudPath: imageName,
      filePath: fileList[0].url
    }).then(res => {
      schoolInfo.logo = res.fileID
    })

    // 添加学校
    await wx.cloud.callFunction({
      name: 'addSchool',
      data: schoolInfo
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 1000
      })
      wx.navigateBack({
        delta: 1,
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '上传失败',
        icon: 'error',
        duration: 1000
      })
    })
  }
})
