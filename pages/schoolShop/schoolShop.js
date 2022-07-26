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
      }
    ],
    ProductInfo: {
      id: '1',
      name: '夏季运动套装',
      unitPrice: '98.00', 
      path: '/static/images/schoolShop/clothes.png',
      specification: [
        {
          name: '颜色',
          value: ['蓝色', '红色'],
        },
        {
          name: '尺寸',
          value: ['120', '130'],
        }
      ]
    },
    shopCart: [
      {
        id: 1,
        title: '夏季运动套装',
        parameter: '女款, 160, 蓝色',
        price: '98.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 2,
        title: '夏季运动套装',
        parameter: ['女款', '160', '蓝色'],
        price: '98.00',
        path: '/static/images/schoolShop/clothes.png'
        }
    ],
    popupType: true,
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
  },

  // 选购
  choose() {
    this.setData({ 
      show: true,
      popupType: true
    })
  },
  
  // 购物车
  shopCart() {
    this.setData({ 
      show: true,
      popupType: false
    })
  },

  // 点击遮罩层时触发
  overlay() {
    this.setData({ show: false })
  }
})
