// pages/productAdmin.js
Page({
  data: {
    productList: [
      {
        id: 1,
        title: '夏季运动套装',
        image: '/static/images/productAdmin/product.png',
        price: '98.00',
      },
      {
        id: 2,
        title: '夏季运动套装',
        image: '/static/images/productAdmin/product.png',
        price: '98.00',
      },
      {
        id: 3,
        title: '夏季运动套装',
        image: '/static/images/productAdmin/product.png',
        price: '98.00',
      },
      {
        id: 4,
        title: '夏季运动套装',
        image: '/static/images/productAdmin/product.png',
        price: '98.00',
      },
    ],
  },

  // 页面初始化
  onLoad() {
    // getProductList()
  },

  // 获取初始数据
  getProductList() {
    wx.request({
      url: 'http://localhost:8080/product/getProductList',
      method: 'GET',
      success (res) {
        console.log(res.data)
      }
    })
  },

  // 删除商品
  delProduct(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  // 添加商品
  toAddProduct() {
    wx.navigateTo({
      url: '/pages/addProduct/addProduct',
    })
  }
})