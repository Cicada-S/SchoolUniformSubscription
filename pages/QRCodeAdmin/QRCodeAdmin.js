// pages/QRCodeAdmin/QRCodeAdmin.js
let app = getApp()

const db = wx.cloud.database()
const SellQrCode = db.collection('SellQrCode')

Page({
  data: {
    QRCodelList: [],
    bottomLift: app.globalData.bottomLift
  },

  onLoad() {
    this.getQRCodelList()
  },

  getQRCodelList() {
    SellQrCode.get().then(res => {
      console.log('getQRCodelList', res)
      this.setData({
        QRCodelList: res.data
      })
    })
  },

  toAddQRCode(event) {
    wx.navigateTo({
      url: `/pages/addQRCode/addQRCode?id=${event.currentTarget.id}`
    })
  }
})
