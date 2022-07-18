// pages/QRCodeAdmin/QRCodeAdmin.js
let app = getApp()

const db = wx.cloud.database()
const SellQrCode = db.collection('SellQrCode')

Page({
  data: {
    QRCodelList: [
      {
        id: 1,
        title: '北大春校服订单',
        code: '/static/images/QRCodeAdmin/qrcode.png'
      },
      {
        id: 2,
        title: '北大春校服订单',
        code: '/static/images/QRCodeAdmin/qrcode.png'
      },
      {
        id: 3,
        title: '北大春校服订单',
        code: '/static/images/QRCodeAdmin/qrcode.png'
      },
      {
        id: 4,
        title: '北大春校服订单',
        code: '/static/images/QRCodeAdmin/qrcode.png'
      },
      {
        id: 5,
        title: '北大春校服订单',
        code: '/static/images/QRCodeAdmin/qrcode.png'
      }
    ],
    bottomLift: app.globalData.bottomLift,

  },

  onLoad() {
    // this.getQRCodelList()
  },

  async getQRCodelList() {
    await SellQrCode.get().then(res => {
      this.setData({
        QRCodelList: res.data
      })
    })
  },

  toAddQRCode(event) {
    wx.navigateTo({
      url: `/pages/QRCode/QRCode?id=${event.currentTarget.id}`
    })
  }
})
