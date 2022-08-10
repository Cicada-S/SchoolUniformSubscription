// pages/addSchool/addSchool.js
const app = getApp()

const uuid = require('../../utils/uuid.js');
import { pathOfDate } from '../../utils/util'

let id = '' // 编辑学校的id
const db = wx.cloud.database()
const SchoolManager = db.collection('SchoolManager')

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    name: '',
    address: '',
    grade: [
      {
        name: '',
        className: [''],
      }
    ],
    fileList: [],
    showSchoolManageButton: false,
    type: 0, //0: '新增学校', 1: '修改学校', 2: '删除学校'
    editLogo: false,
    adminList: [] // 申请成为管理员
  },

  // 页面初始化
  onLoad(options) {
    id = options.id
    if(id) {
      wx.setNavigationBarTitle({
        title: '编辑学校'
      })
      this.getSchoolInfo(id)
      this.getSchoolManager(id)

      //如果没有关联二维码则允许修改
      db.collection('SellQrCode').where({
        schoolId: id
      }).get().then(res => {
        if(res.data.length == 0){
          this.setData({  type: 1 })
        }else{
          this.setData({ type: 2 })
        }
        this.setData({
          showSchoolManageButton: true
        })
      })

    }else{
      this.setData({
        type: 0, 
        showSchoolManageButton: true
      })
    }
  },

  // 编辑学校时回填数据
  async getSchoolInfo(id) {
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

  // 获取申请成为管理员的列表
  getSchoolManager(id) {
    SchoolManager.where({ 
      schoolId: id, status: 1
    }).get().then(res => {
      this.setData({
        adminList: res.data
      })
    })
  },

  // 点击同意成为管理员 的回调函数
  onAgree(event) {
    console.log(event.currentTarget.id)
    let id = event.currentTarget.id
    let that = this

    wx.showModal({
      title: '提示',
      content: '确定将该用户升级为学校管理员吗？',
      success (res) {
        if (res.confirm) {
          SchoolManager.doc(id).update({data: {status:0}})
          .then(() => {
            wx.showToast({
              title: '成功',
              icon: 'success',
              duration: 1000
            })

            // 删除数组中的 _id等于id 的元素
            let adminList = that.data.adminList.filter(item => item._id != id)

            that.setData({
              adminList
            })
          })
        }
      }
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

  manageSchool(){
    if(this.data.type === 2){//delete 
      this.deleteSchool()
    }else{
      this.addSchool()
    }
  },

  deleteSchool(){
    let _this = this
    wx.showModal({
      title: '提示',
      content: '确定要删除该学校吗？',
      success(res) {
        if (res.confirm) {
          let user = wx.getStorageSync('currentUser');
          db.collection('School').doc(id).update({
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

  // 添加学校的处理函数
  async addSchool() {
    let text = this.data.type === 0 ? '添加' : '修改'
    let { name, address, fileList, grade} = this.data;
    let schoolInfo = {
      name,
      address,
      grade,
      logo: fileList.length > 0 ? fileList[0].url : '',
      remark: '',
    }

    //内容检验
    if(!this.check(schoolInfo)){
      return;
    }

    wx.showLoading({
      title: `${text}中...`
    })

    if(this.data.editLogo) {
      let cloudPath = "schoolUniformSubscription/school/" + pathOfDate() + uuid.uuid() + fileList[0].url.match(/.[^.]+$/)[0]
      // 将图片上传到云存储
      await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: fileList[0].url
      }).then(res => {
        schoolInfo.logo = res.fileID
      })
    }

    // 添加/修改 学校
    let results = this.data.type === 0 ? this.request('addSchool', schoolInfo) : this.request('editSchool', schoolInfo)

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

  check(schoolInfo){
    if(!schoolInfo.name){
      wx.showToast({
        title: `学校名不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if(!schoolInfo.address){
      wx.showToast({
        title: `学校地址不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    let gradeCheck = true
    schoolInfo.grade.forEach(item => {
      if(!item.name){
        wx.showToast({
          title: `年级不能为空`,
          icon: 'none',
          duration: 1000
        })
        gradeCheck = false
        return;
      }

      item.className.forEach(c => {
        if(!c){
          wx.showToast({
            title: `班级不能为空`,
            icon: 'none',
            duration: 1000
          })
          gradeCheck = false
          return;
        }
      })

    })

    if(!gradeCheck){
      return false
    }

    if(this.data.fileList.length == 0){
      wx.showToast({
        title: `LOGO不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false
    }

    return true;
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
