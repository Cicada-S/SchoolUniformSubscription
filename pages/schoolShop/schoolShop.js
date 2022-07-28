// pages/schoolShop/schoolShop.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    show: false,
    popupType: true,
    studentInfo: {
      id: 1,
      name: 'Cicada',
      Grade: '一年级 1班',
      school: '清华大学幼儿园',
      path: '/static/images/schoolShop/avatar.png',
    },
    ProductList: [
      {
        id: '1',
        name: '夏季运动套装',
        unitPrice: '68.00', 
        choice: '',
        operation: 1,
        path: '/static/images/schoolShop/clothes.png',
        specification: [
          {
            name: '颜色',
            value: [
              {
                text: '蓝色',
                isChoice: 0
              },
              {
                text: '红色',
                isChoice: 0
              }
            ],
          },
          {
            name: '尺寸',
            value: [
              {
                text: '120',
                isChoice: 0
              }, 
              {
                text: '130',
                isChoice: 0
              }
            ],
          }
        ]
      },
      {
        id: '2',
        name: '冬季运动套装',
        unitPrice: '98.88',
        choice: '', 
        operation: 1,
        path: '/static/images/schoolShop/clothes.png',
        specification: [
          {
            name: '颜色',
            value: [
              {
                text: '蓝色',
                isChoice: 0
              }, 
              {
                text: '红色',
                isChoice: 0
              }
            ],
          },
          {
            name: '尺寸',
            value: [
              {
                text: '120',
                isChoice: 0
              }, 
              {
                text: '130',
                isChoice: 0
              }
            ],
          }
        ]
      },
      {
        id: '3',
        name: '春季运动套装',
        unitPrice: '78.00',
        choice: '',
        operation: 1,
        path: '/static/images/schoolShop/clothes.png',
        specification: [
          {
            name: '颜色',
            value: [
              {
                text: '蓝色',
                isChoice: 0
              }, 
              {
                text: '红色',
                isChoice: 0
              }
            ],
          },
          {
            name: '尺寸',
            value: [
              {
                text: '120',
                isChoice: 0
              }, 
              {
                text: '130',
                isChoice: 0
              }
            ],
          }
        ]
      }
    ],
    ProductInfo: {}, // 选购
    shopCart: [], // 购物车
    cartNum: 0, // 购物车商品数量
    totalPrice: 0, // 总价
  },

  // 页面初始化
  onLoad(option) {
    // this.getProductList(option.id)

    // 获取本地存储的购物车数据
    this.setData({
      shopCart: wx.getStorageSync('shopCart')
    })
    this.countTotalPrice()
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
  choose(event) {
    let ProductInfo = this.data.ProductList.filter(item => item.id === event.currentTarget.id)
    this.setData({ 
      show: true,
      popupType: true,
      ProductInfo: ProductInfo[0]
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

  // 加入购物车
  addCart(event) {
    let id = event.currentTarget.id
    let { shopCart, ProductInfo } = this.data
    
    if(ProductInfo.choice.split('，').length === ProductInfo.specification.length) {

      let newShopCart = shopCart.map((item, index) => {
        // 如果购物车中有该商品且规格一样 则把数量加上去
        if(item.id === id && ProductInfo.choice === item.choice) {
          return item.operation += ProductInfo.operation
        }
        // 有bug待调试
        /* else if(index === shopCart.length - 1) {
          shopCart.unshift(ProductInfo)
        } */
        return item
      })

      console.log(newShopCart)

      this.setData({
        show: false,
        ProductInfo: [],
        shopCart
      })
      wx.setStorageSync('shopCart', shopCart)
      this.countTotalPrice()

    }else {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }
  },
  
  // 计算总价、购物车商品的数量
  countTotalPrice() {
    let { shopCart } = this.data
    let cartNum = 0
    let totalPrice = 0
    shopCart.forEach(item => {
      cartNum += item.operation
      totalPrice = (parseFloat(totalPrice) + parseFloat(item.unitPrice*item.operation)).toFixed(2)
    })
    this.setData({
      cartNum,
      totalPrice
    })
  },

  // 购物车
  shopCart() {
    this.setData({
      show: true,
      popupType: false
    })
  },

  // 监听Calculator组件的 减
  onReduce(event) {
    let index = parseFloat(event.detail.index)
    if(index) {
      let { shopCart } = this.data
      let operation = 1
      shopCart.forEach((item, idx) => {
        if(idx === index) {
          operation = item.operation <= 1 ? item.operation : --item.operation
        }
      })
      this.setData({
        [`shopCart[${index}].operation`]: operation
      })
      wx.setStorageSync('shopCart', shopCart)
      this.countTotalPrice()
    }else {
      let { operation } = this.data.ProductInfo
      operation <= 1 ? operation = 1 : --operation
      this.setData({
        ['ProductInfo.operation']: operation
      })
    }
  },

  // 监听Calculator组件的 加
  onIncrease(event) {
    let index = parseFloat(event.detail.index)
    if(index) {
      let { shopCart } = this.data
      let operation = 1
      shopCart.forEach((item, idx) => {
        if(idx === index) {
          operation = ++item.operation
        }
      })
      this.setData({
        [`shopCart[${index}].operation`]: operation
      })
      wx.setStorageSync('shopCart', shopCart)
      this.countTotalPrice()
    }else {
      let { operation } = this.data.ProductInfo
      this.setData({
        ['ProductInfo.operation']: ++operation
      })
    }
  },

  // 删除购物车的商品
  onDelete(event) {
    let id = parseFloat(event.currentTarget.id)
    let { shopCart } = this.data

    let newShopCart = shopCart.filter((item, index) => {
      if(index !== id) return item
    })
    this.setData({
      shopCart: newShopCart
    })
    wx.setStorageSync('shopCart', newShopCart)
    this.countTotalPrice()
  },

  // 点击遮罩层时触发
  overlay() {
    this.setData({
      show: false,
      ProductInfo: []
    })
  }
})
