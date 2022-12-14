// pages/QRCode/QRCode.js
const app = getApp()

const db = wx.cloud.database()
const School = db.collection('School')

import { toDates } from '../../utils/util'

let selectProductId = [] // 选中的商品id

Page({
  data: {
    titleValue: '', // 标题
    school: {
      id: '',
      name: '请选择买家'
    }, // 买家
    timeType: '', // 时间类型 开始 结束
    time: { // 时间戳
      startTime: '',
      endTime: '',
    },
    date: { // 显示在页面的日期
      startTime: '',
      endTime: '',
    },
    timeShow: false, // 时间选择器显示状态
    schoolShow: false, // 买家选择器显示状态
    // 时间选择器
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date(2050, 12, 31).getTime(),
    currentDate: new Date().getTime(),
    // 买家选择器
    actions: [],
    // 商品数据
    goodsDataList: [],
    bottomLift: app.globalData.bottomLift,
    type: true, // 当前状态  true新增  false 删除
    id:'',
    qrCodePath:'', // 二维码
    fileUrl: '' // 购买清单
  },

  // 页面初始化
  onLoad(options) {
    console.log(options.id)

    this.getSchoolList()

    if(options.id) {
      this.setData({
        type: false,
        id: options.id
      })
      wx.setNavigationBarTitle({
        title: '二维码'
      })
      this.getQRCodeInfo(options.id)
    }
  },

  // 页面显示
  onShow() {
    try {
      let data = JSON.parse(wx.getStorageSync('selectProductList'))
      wx.removeStorageSync('selectProductList')
      selectProductId = data?.map(item => item._id)
      this.setData({
        goodsDataList: data
      })
    }
    catch(err) {}
  },

  // 查看二维码时 数据回填
  async getQRCodeInfo(id) {
    await wx.cloud.callFunction({
      name: 'getQRCodeInfo',
      data: {id}
    }).then(res => {
      let { title, schoolName, schoolId, beginTime, endTime, qrCodePath} = res.result.data.sellQrCode
      this.setData({
        qrCodePath: qrCodePath,
        titleValue: title,
        ['school.name']: schoolName,
        ['school.id']: schoolId,
        ['date.startTime']: toDates(beginTime),
        ['date.endTime']: toDates(endTime),
        goodsDataList: res.result.data.product
      })
    })
  },

  // 点击图片放大预览
  preview(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: [event.currentTarget.dataset.current]
    })
  },

  // 导出购买清单
  exportOrderList() {
    wx.showLoading({
      title: '正在导出...',
    })
    let id = this.data.id
    wx.cloud.callFunction({
      name: 'exportOrderList',
      data: { id }
    }).then(res => {
      wx.hideLoading()
      this.getFileUrl(res.result.data.fileID)
    })
  },

  // 获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        this.setData({
          fileUrl: res.fileList[0].tempFileURL
        })
      }
    })
  },

  // 复制excel文件下载链接
  copyFileUrl() {
    wx.setClipboardData({
      data: this.data.fileUrl,
      success: () => {
        wx.getClipboardData({
          success: () => {
            wx.showToast({
              title: '复制成功',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  },

  // 标题
  onChange(event) {
    this.setData({
      titleValue: event.detail
    })
  },

  // 点击 弹出选择框 的回调函数
  isActionSheet(event) {
    if (event.target.id === 'school') {
      this.setData({
        schoolShow: true,
      })
    }else {
      this.setData({
        timeShow: true,
        timeType: event.target.id
      })
    }
  },

  // 买家选择器 选择时 的回调函数
  onSelect(event) {
    let school = {
      id: event.detail._id,
      name: event.detail.name
    }
    this.setData({
      school: school
    })
  },

  // 买家选择器 关闭时 的回调函数
  onClose(event) {
    this.setData({
      schoolShow: false
    })
  },

  // 时间选择器 点击确定 的回调函数
  onConfirm(event) {
    let newDate = event.detail
    this.setData({
      // 代码只是写给机器运行的 顺带给人看一下
      ['time.' + this.data.timeType]: newDate,
      ['date.' + this.data.timeType]: toDates(newDate),
      timeShow: false
    })
  },

  // 时间选择器 点击取消和遮罩层 的回调函数
  onCancel(event) {
    this.setData({
      timeShow: false,
    })
  },

  // 选择商品 的回调函数
  isProduct() {
    wx.navigateTo({
      url: `/pages/selectProduct/selectProduct?id=${JSON.stringify(selectProductId)}`
    })
  },

  // 删除商品 的回调函数
  onDelete(event) {
    let newGoodsDataList = this.data.goodsDataList.filter(item => {
      if(item._id === event.target.id) {
        selectProductId.splice(selectProductId.indexOf(item._id), 1)
      }
      return item._id !== event.target.id
    })
    this.setData({
      goodsDataList: newGoodsDataList
    })
  },

  // 获取买家
  async getSchoolList() {
    await School.where({status: 0}).orderBy('createTime', 'desc').get().then(res => {
      this.setData({
        actions: res.data
      })
    })
  },

  manageQRCode(){
    if(this.data.type){
      this.addQRCode()
    }else{
      //删除二维码
      this.deleteQRCode()
    }
  },

  deleteQRCode(){
    let _this = this
    wx.showModal({
      title: '提示',
      content: '确定要删除该二维码吗？',
      success(res) {
        if (res.confirm) {
          let user = wx.getStorageSync('currentUser');
          db.collection('SellQrCode').doc(_this.data.id).update({
            data: {
              status: -1,
              lastModifiedTime: new Date(),
              lastModifiedOpenid: user._openid,
            },
            success: res => {
              console.info('delete info ==' +  JSON.stringify(res))
              wx.hideLoading()
              wx.showToast({
                title: `删除成功`,
                icon: 'success',
                duration: 1000
              })

              setTimeout(function () {
                wx.hideToast();
                wx.navigateBack({
                  delta: 1
                })
              }, 1500);

            }
          })
        }
      }
    })
  },

  // 生成二维码
  async addQRCode() {

    //内容检验
    if(!this.check()){
      return;
    }

    wx.showLoading({
      title: '上传中...'
    })

    let { titleValue, time, school} = this.data

    await wx.cloud.callFunction({
      name: 'addQRCode',
      data: {
        title: titleValue,
        beginTime: time.startTime,
        endTime: time.endTime,
        schoolId: school.id,
        schoolName: school.name,
        selectProductId: selectProductId
      }
    }).then(res => {
      console.log('生成成功', res)
      wx.hideLoading()
      wx.navigateBack({
        delta: 1
      })
    }).catch(err => {
      console.log('生成失败', err)
      wx.hideLoading()
    })
  },
  check() {
    if(!this.data.titleValue){
      wx.showToast({
        title: `标题不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if(!this.data.school.id){
      wx.showToast({
        title: `请选择买家`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if(!this.data.date.startTime){
      wx.showToast({
        title: `请选择开始时间`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if(!this.data.date.endTime){
      wx.showToast({
        title: `请选择结束时间`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }


    if(this.data.goodsDataList.length == 0){
      wx.showToast({
        title: `请选择商品`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    return true;

  },
  onUnload() {
    selectProductId = []
  }
})
