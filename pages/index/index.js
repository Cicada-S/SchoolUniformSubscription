// pages/index/index.js
const db = wx.cloud.database();
const user = db.collection('User');

Page({
  data: {
    hiddenFunctionManage: true,
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

    this.getUserInfo()
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
      code: 'QRCodeAdmin',
      school: 'schoolAdmin',
    }
    const page = type[event.target.id]
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    })
  },

  getUserInfo() {
    let _this = this
    user.get({
      success(res) {
        if (res.data.length == 1) {
          try {
            // console.info('currentUser = ' + JSON.stringify(res.data[0]))
            wx.setStorageSync('currentUser', res.data[0]);

            //管理员才可以管理产品等信息
            const _ = db.command
            let whereConditiion = {'key': 'adminOpenIds',  'value': _.in([res.data[0]._openid]) };
            db.collection('SystemConfig').where(whereConditiion).get().then(systemConfig => {
              console.info('systemConfig = ' + JSON.stringify(systemConfig))
              if(systemConfig.data.length > 0){
                _this.setData({
                  hiddenFunctionManage: false
                })
              }
            })

          } catch (err) {
            console.log(err)
          }
        } else {
          wx.navigateTo({
            url: `/pages/login/login`
          })
        }
      }
    })
  }
})
