// pages/schoolAdmin/schoolAdmin.js
let app = getApp()

const db = wx.cloud.database()
const School = db.collection('School')

Page({
  data: {
    schoolList: [],
    bottomLift: app.globalData.bottomLift,
    pageIndex: 1,
    pageSize: 15,
    reachBottom: false,
    searchValue:''
  },

  onShow() {
    this.setData({
      pageIndex: 1,
      schoolList: [],
      reachBottom: false
    })
    this.getSchoolList()
  },

  search(e){
    
    this.setData({
      searchValue: e.detail.searchValue
    })
    this.setData({
      pageIndex: 1,
      schoolList: [],
      reachBottom: false
    })
    this.getSchoolList()
  },

  async getSchoolList() {

    //查询条件
    let whereConditiion = {}
    if (this.data.searchValue) {
      whereConditiion.name = db.RegExp({
        regexp: this.data.searchValue,
        options: 'i',
      })
    }

    whereConditiion.status = 0

    //skip(20 * (pageIndex - 1)).limit(20)
    const skin = this.data.pageSize * (this.data.pageIndex - 1);
    School.where(whereConditiion).skip(skin).limit(this.data.pageSize).orderBy('createTime', 'desc')
    .get().then(res => {

      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新

      //下一页没有数据了
      if(res.data.length == 0){
        this.setData({
          reachBottom: true,
          pageIndex: this.data.pageIndex -1
        })
        return
      }

      let oldSchoolList = this.data.schoolList
      let newSchoolList = oldSchoolList.concat(res.data)

      this.setData({
        schoolList: newSchoolList
      })
    })
  },

  toAddSchool(event) {
    wx.navigateTo({
      url: `/pages/addSchool/addSchool?id=${event.currentTarget.id}`
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.info("onPullDownRefresh============")
    this.setData({
      pageIndex: 1,
      schoolList: [],
      reachBottom: false
    })
    this.getSchoolList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.info("onReachBottom============")

    if(this.data.reachBottom){
      console.info("no data============")
      return
    }

    this.setData({
      pageIndex: this.data.pageIndex + 1
    })

    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 500
    })
    this.getSchoolList()
  }
})
