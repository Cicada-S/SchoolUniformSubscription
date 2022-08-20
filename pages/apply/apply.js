// pages/apply/apply.js
const db = wx.cloud.database()
const School = db.collection('School')
const SchoolManager = db.collection('SchoolManager')

Page({
  data: {
    school: {},
    show: false,
    actions: []
  },

  // 页面初始化
  onLoad() {
    this.getSchool()
  },

  // 获取买家
  getSchool() {
    School.where({status: 0}).get().then(res => {
      this.setData({
        actions: res.data
      })
    })
  },

  // 选择买家
  isActionSheet() {
    this.setData({
      show: true,
    })
  },

  // 关闭弹出层时触发
  onClose() {
    this.setData({
      show: false
    })
  },

  // 选中选项时触发
  onSelect(event) {
    this.setData({
      show: false,
      school: event.detail
    })
  },

  // 立即申请
  async onApply() {
    let { _id } = this.data.school
    let { _openid, nickName, avatarUrl } = wx.getStorageSync('currentUser')

    let results = await SchoolManager.where({
      managerOpenid: _openid
    }).get()

    if(results.data.length) {
      wx.showToast({
        title: '您已经申请！',
        icon: 'none',
        duration: 2000
      })
      return
    } else if(!results.data.length && !_id) {
      wx.showToast({
        title: '请选择买家',
        icon: 'none',
        duration: 2000
      })
    } else {
      SchoolManager.add({
        data: {
          schoolId: _id,
          managerOpenid: _openid,
          nickName,
          avatarUrl,
          status: 1
        }
      }).then(() => {
        wx.showToast({
          title: '已提交申请！',
          icon: 'success',
          duration: 1000
        })
        setTimeout(()=> {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      })
    }
  }
})
