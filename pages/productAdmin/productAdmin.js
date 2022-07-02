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

  onLoad: function (options) {
    // getProductList()
  },

  toAddProduct: function () {
    wx.navigateTo({
      url: '/pages/addProduct/addProduct',
    })
  },

  delProduct: function (e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  getProductList() {
    wx.request({
      url: 'http://localhost:8080/product/getProductList',
      method: 'GET',
      success: function (res) {
        console.log(res.data)
      }
    })
  }
})