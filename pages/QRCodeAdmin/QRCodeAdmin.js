// pages/QRCodeAdmin/QRCodeAdmin.js
let app = getApp()

const db = wx.cloud.database()
const SellQrCode = db.collection('SellQrCode')

Page({
  data: {
    QRCodelList: [],
    bottomLift: app.globalData.bottomLift,
    pageIndex: 1,
    pageSize: 15,
    reachBottom: false,
    searchValue:''
  },

  onShow() {
    this.setData({
      pageIndex: 1,
      QRCodelList: [],
      reachBottom: false
    })
    this.getQRCodelList()
  },

  search(e){
    this.setData({
      searchValue: e.detail.searchValue
    })
    this.setData({
      pageIndex: 1,
      QRCodelList: [],
      reachBottom: false
    })
    this.getQRCodelList()
  },

  getQRCodelList() {

    //查询条件
    let whereConditiion = {}
    if (this.data.searchValue) {
      whereConditiion.title = db.RegExp({
        regexp: this.data.searchValue,
        options: 'i',
      })
    }

    //skip(20 * (pageIndex - 1)).limit(20)
    const skin = this.data.pageSize * (this.data.pageIndex - 1);
    SellQrCode.where(whereConditiion).skip(skin).limit(this.data.pageSize).orderBy('createTime', 'desc')
        .get().then(res => {
      console.log('getQRCodelList', res)

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

      let oldQRCodelList = this.data.QRCodelList
      let newQRCodelList = oldQRCodelList.concat(res.data)
      this.setData({
        QRCodelList: newQRCodelList
      })

    })
  },

  toAddQRCode(event) {
    wx.navigateTo({
      url: `/pages/addQRCode/addQRCode?id=${event.currentTarget.id}`
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.info("onPullDownRefresh============")
    this.setData({
      pageIndex: 1,
      QRCodelList: [],
      reachBottom: false
    })
    this.getQRCodelList()
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
    this.getQRCodelList()
  }
})
