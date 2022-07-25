// pages/schoolShop/schoolShop.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    show: false,
    studentInfo: {
      id: 1,
      name: 'Cicada',
      Grade: '一年级 1班',
      school: '清华大学幼儿园',
      path: '/static/images/schoolShop/avatar.png',
    },
    ProductList: [
      {
        id: 1,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 2,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 3,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 4,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      }
    ],
    totalPrice: '198.00',
    productNum: 1,
    
  },

  // 页面初始化
  onload(option) {
    console.log(option)

    // this.getProductList(option.id)
  },

  // 获取商品列表
  getProductList(id) {
    console.log(id)
    let result = wx.cloud.callFunction({
      name: '',
      data: {id}
    })
  },

  // 切换学生
  toFamily(event) {
    console.log('toFamily', event)
    wx.navigateTo({
      url: '/pages/family/family'
    })
  }
})
