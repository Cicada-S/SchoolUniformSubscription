// pages/reselection/reselection.js
const db = wx.cloud.database()
const orderProduct = db.collection('OrderProduct')

Page({
  data: {
    ProductInfo: {}
  },

  // 页面初始化
  onLoad(options) {
    console.log(options.id)
    this.getOrderProduct(options.id)
  },

  // 获取商品
  getOrderProduct(id) {
    wx.cloud.callFunction({
      name: 'getProductInfo',
      data: { id }
    }).then(res => {
      let product = res.result.data
      // 将第一张图片取出来 放到 product 中
      product.ProductVideoImage.first.forEach(item => {
        if(item.order === 0) {
          product.product.path = item.path
          delete product.ProductVideoImage
        }
      })

      // 处理商品规格
      let specification = []
      product.ProductSpecification.forEach(item => {
        // 将规格value的每一项 改成 对象
        item.value = item.value.map(valItem => {
          return valItem = {
            text: valItem,
            isChoice: 0
          }
        })
        specification.push(item)
      })

      product = {
        specification,
        ...product.product
      }

      this.setData({
        ProductInfo: product
      })
    })
  },

  // 点击规格
  choice(event) {
    let { idx, name_index } = event.currentTarget.dataset
    let { ProductInfo } = this.data

    let newProductInfo = ProductInfo.specification.map((item, index) => {
      if(index === name_index) {
        item.value.map((valItem, valIndex) => {
          valItem.isChoice = 0
          if(valIndex === idx) {
            valItem.isChoice = 1
          }
          return valItem
        })
      }
      return item
    })

    let choice = []
    newProductInfo.forEach(item => {
      item.value.forEach(valItem => {
        if(valItem.isChoice === 1) {
          choice.push(valItem.text)
        }
      })
    })
    choice = choice.join('，')

    this.setData({
      ['ProductInfo.specification']: newProductInfo,
      ['ProductInfo.choice']: choice,
    })
  },

  // 确认修改
  editSpecification() {
    let { _id, specification, choice } = this.data.ProductInfo
    // 是否选择规格
    if(choice?.split('，').length === specification.length) {
      // 修改规格
      orderProduct.where({productId: _id}).update({data: { specification: choice }})
      .then(() => {
        wx.navigateBack({ delta: 1 })
      })
    }else {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }
  }
})
