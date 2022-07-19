// pages/selectProduct/selectProduct.js
let app = getApp();

const db = wx.cloud.database()
const productsCollection = db.collection('Product')
const ProductVideoImage = db.collection('ProductVideoImage')

let selectProductList = [] // 选中的商品
let selectProductId = [] // 回显时选中的商品id

Page({
  data: {
    productList: [],
    bottomLift: app.globalData.bottomLift, 
    pageIndex: 1,
    pageSize: 10,
    reachBottom: false,
    searchValue:'',
  },

  // 页面初始化
  onLoad(options) {
    selectProductId = JSON.parse(options.id)
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 500
    })
    this.getProductList()
  },

  search(e){
    this.setData({
      searchValue: e.detail.searchValue
    })
    this.setData({
      pageIndex: 1,
      productList: [],
      reachBottom: false
    })
    this.getProductList()
  },

  // 获取初始数据
  getProductList() {

    //查询条件
    let whereConditiion = {}
    if (this.data.searchValue) {
      whereConditiion.name = db.RegExp({
        regexp: this.data.searchValue,
        options: 'i',
      })
    }

    //skip(20 * (pageIndex - 1)).limit(20)
    const skin = this.data.pageSize * (this.data.pageIndex - 1);
    productsCollection.where(whereConditiion).skip(skin).limit(this.data.pageSize).orderBy('createTime', 'desc')
    .get().then(res => {
      
      //下一页没有数据了
      if(res.data.length == 0){
        this.setData({
          reachBottom: true,
          pageIndex: this.data.pageIndex -1
        })
        return
      }

      const promiseArr = [];
      // 获取到的商品数据
      let productList = res.data
      // 将每条数据的_id取出 用于查找对应的商品图片
      res.data.map(item => item._id).forEach(productId => {
        
        promiseArr.push(new Promise((reslove, reject) => {
          // 根据商品id获取商品图片
          ProductVideoImage.where({
            productId
          }).get()
          // 获取成功
          .then(({ data }) => {
            data.map(item => {
              // 获取成功后 选出上传时首图的第一张
              if (item.materialType == 0 && item.order == 0) {
                // 将图片追加到对应的对象中
                productList.forEach(product => {
                  if (product._id == productId) {
                    product.path = item.path
                  }
                })
              }
              reslove();
            })
          })
        }))
      })

      Promise.all(promiseArr).then(res => {
        // 赋值到 productList
        let oldProductListd = this.data.productList
        let newProductList = oldProductListd.concat(productList)

        // 将原本选中的标记出来
        selectProductId.forEach(id => {
          newProductList.map(item => {
            if(item._id === id) {
              item.isSelect = true
              return item
            }
          })
        })
        selectProductList = newProductList.filter(item => item.isSelect)

        this.setData({
          productList: newProductList
        })
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      })
    })
  },

  // 选中商品的处理函数
  selectProduct(event) {
    let newProductList = this.data.productList.map(item => {
      let isSelect = item.isSelect
      if(item._id === event.currentTarget.id) item.isSelect = !isSelect
      return item
    })
    selectProductList = newProductList.filter(item => item.isSelect)
    this.setData({
      productList: newProductList
    })
  },

  // 完成跳转
  complete() {
    wx.setStorageSync('selectProductList', JSON.stringify(selectProductList))
    wx.navigateBack({
      delta: 1
    })
  },
  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.info("onPullDownRefresh============")
    this.setData({
      pageIndex: 1,
      productList: [],
      reachBottom: false
    })
    this.getProductList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.info("onReachBottom============")

    if(this.data.reachBottom){
      console.info("no data============")
      return
    }

    this.setData({
      pageIndex: this.data.pageIndex + 1
    })

    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 500
    })
    this.getProductList()
  }
})
