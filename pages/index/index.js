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
        title: '夏装礼服款',
        picUrl: '/static/images/home/clothes1.jpg',
        height: '380rpx'
      },
      {
        id: 2,
        title: '夏装运动款',
        picUrl: '/static/images/home/clothes2.jpg',
        height: '380rpx'
      },
      {
        id: 3,
        title: '秋冬装礼服款',
        picUrl: '/static/images/home/clothes3.jpg',
        height: '380rpx'
      },
      {
        id: 4,
        title: '秋冬装运动款',
        picUrl: '/static/images/home/clothes4.jpg',
        height: '380rpx'
      },
      {
        id: 5,
        title: '中小学秋装款',
        picUrl: '/static/images/home/clothes5.jpg',
        height: '450rpx'
      },
      {
        id: 6,
        title: '秋冬装英伦学院风',
        picUrl: '/static/images/home/clothes6.jpg',
        height: '450rpx'
      },
      {
        id: 7,
        title: '书包新款',
        picUrl: '/static/images/home/clothes7.jpg',
        height: '320rpx'
      },
      {
        id: 8,
        title: '被子新款',
        picUrl: '/static/images/home/clothes8.jpg',
        height: '320rpx'
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
