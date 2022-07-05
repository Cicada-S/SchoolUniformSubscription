Page({
  data: {
    chart: '/static/images/home/chart.png',
    moreUrl: [
      '/static/images/home/more1.png',
      '/static/images/home/more2.png',
    ],
    dataList: [
      {
        id: 1,
        title: '冬季园服新款（演示）qweq',
        picUrl: '/static/images/home/clothes1.png',
      },
      {
        id: 2,
        title: '冬季园服新款（演示）',
        picUrl: '/static/images/home/clothes1.png',
      },
      {
        id: 3,
        title: '冬季园服新款（演示）',
        picUrl: '/static/images/home/clothes1.png',
      },
      {
        id: 4,
        title: '冬季园服新款（演示）qweq',
        picUrl: '/static/images/home/clothes1.png',
      }
    ]
  },

  // 页面初始化
  onLoad() {
    // this.getDataList()
  },

  // 获取初始数据
  getDataList() {
    wx.request({
      url: 'http://localhost:8080/product/getProductList',
      method: 'GET',
      success: function (res) {
        console.log(res.data)
      }
    })
  },

  // 功能栏跳转
  onJump(event) {
    let type = {
      product: 'productAdmin',
      code: 'QRCode',
      school: 'schoolAdmin',
    }
    const page = type[event.target.id]
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    })
  }
})
