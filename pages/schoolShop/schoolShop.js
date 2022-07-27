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
        choice: [],
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
        choice: [], 
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
        choice: [],
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
    totalPrice: 0, // 总价
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
  addCart() {
    let { shopCart, ProductInfo } = this.data
    shopCart.push(ProductInfo)
    this.setData({
      show: false,
      ProductInfo: [],
      shopCart
    })
    this.countTotalPrice()
  },

  // 计算总价
  countTotalPrice() {
    let { shopCart } = this.data
    let totalPrice = 0
    shopCart.forEach(item => {
      totalPrice = (parseFloat(totalPrice) + parseFloat(item.unitPrice)).toFixed(2)
    })
    this.setData({
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

  // 点击遮罩层时触发
  overlay() {
    this.setData({
      show: false,
      ProductInfo: []
    })
  }
})
