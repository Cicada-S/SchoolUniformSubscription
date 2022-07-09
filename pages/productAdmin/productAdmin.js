// pages/productAdmin.js
const db = wx.cloud.database()
const products = db.collection('Product')
const ProductVideoImage = db.collection('ProductVideoImage')

Page({
  data: {
    productList: [],
  },

  // 页面初始化
  onLoad(options) {
    console.log('页面初始化', options)

    this.getProductList()
  },

  // 获取初始数据
  async getProductList() {
    await products.get().then(res => {
      let productList = []

      let results = res.data.map(item => {
        productList.push(item)
        return item._id
      })

      results.forEach((productId, index) => {
        ProductVideoImage.where({
          productId: productId,
        }).get().then(({ data }) => {
          console.log('获取商品对应的图片:', productId, "index:", index, data)

          data.map(item => {
            if (item.type == 0 && item.order == 0) {
              productList.forEach(product => {
                if (product._id == productId) {
                  product.path = item.path
                }
              })
            }
          })
          this.setData({
            productList: productList,
          })
        })
      })
    })
  },

  // 删除商品
  delProduct(e) {
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

  // 添加商品
  toAddProduct() {
    wx.navigateTo({
      url: '/pages/addProduct/addProduct',
    })
  }
})