// pages/productAdmin.js
let app = getApp();

const db = wx.cloud.database()
const products = db.collection('Product')
const ProductVideoImage = db.collection('ProductVideoImage')

Page({
  data: {
    productList: [],
    bottomLift: app.globalData.bottomLift, 
  },

  // 页面初始化
  onLoad(options) {
    console.log('页面初始化', options)

    this.getProductList()
  },

  // 获取初始数据
  async getProductList() {
    await products.get().then(res => {
      // 获取到的商品数据
      let productList = res.data
      // 将每条数据的_id取出 用于查找对应的商品图片
      res.data.map(item => item._id).forEach(productId => {
        // 根据商品id获取商品图片
        ProductVideoImage.where({
          productId
        }).get()
        // 获取成功
        .then(({ data }) => {
          data.map(item => {
            // 获取成功后 选出上传时首图的第一张
            if (item.type == 0 && item.order == 0) {
              // 将图片追加到对应的对象中
              productList.forEach(product => {
                if (product._id == productId) {
                  product.path = item.path
                }
              })
            }
          })
          // 赋值到 productList
          this.setData({
            productList
          })
        })
      })
    })
  },

  // 删除商品
  delProduct(event) {
    console.log('删除商品', event.currentTarget.id)

    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  // 添加/修改 商品
  toAddProduct(event) {
    wx.navigateTo({
      url: `/pages/addProduct/addProduct?id=${event.currentTarget.id}`
    })
  }
})
