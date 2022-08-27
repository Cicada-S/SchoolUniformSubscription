// pages/schoolShop/schoolShop.js
const app = getApp()
const db = wx.cloud.database()
const SchoolManager = db.collection('SchoolManager')

import { toDates } from '../../utils/util'

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    show: false, // 显示popup弹窗
    popupType: true, // popup弹窗的类型 选购/购物车
    schoolId: '', // 买家id
    schoolName: '', // 买家名
    sellQrCodeId: '', // 二维码id
    sellQrCodeTitle: '', // 二维码标题
    allowToOperate: false, //允许操作
    studentInfo: {}, // 小朋友信息
    ProductList: [], // 商品
    ProductInfo: {}, // 选购
    shopCart: [], // 购物车
    cartNum: 0, // 购物车商品数量
    totalPrice: 0, // 总价
    endDate: '', // 结束时间
    isSchoolAdmin: false, // 是否为管理员
    canViewAllOrderList: false, //是否能查看所有订单列表
  },

  // 页面初始化
  onLoad(options) {
    console.log('onLoad----------', options)

    let scene = options.scene
    this.setData({ sellQrCodeId: scene })
    this.getUserInfo(scene)
    this.getProductList(scene).then(() => {
      this.getIdentity()
    })

    this.countTotalPrice()
  },

  getUserInfo(scene) {
    db.collection('User').get({
      success(res) {
        if (res.data.length == 1) {
          try {
            // console.info('currentUser = ' + JSON.stringify(res.data[0]))
            wx.setStorageSync('currentUser', res.data[0]);
          } catch (err) {
            console.log(err)
          }
        } else {
          wx.navigateTo({
            url: '/pages/login/login?scene='+scene
          })
        }
      }
    })
  },

  // 页面显示
  onShow() {
    console.log('onShow------------')
    let studentInfo = wx.getStorageSync('studentInfo')
    // 获取本地存储的购物车数据
    let shopCart = []
    if(wx.getStorageSync('shopCart')) {
      shopCart = wx.getStorageSync('shopCart')
    }
    this.setData({
      studentInfo,
      shopCart
    })
    
    this.countTotalPrice()
  },

  // 获取商品列表
  getProductList(scene) {

    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getSellQRCode',
        data: { 'id': scene }
      }).then(res => {
        let { sellQrCode, ProductList } = res.result.data
        let endDate = toDates(sellQrCode.endTime)
        this.setData({
          schoolId: sellQrCode.schoolId,
          schoolName: sellQrCode.schoolName,
          sellQrCodeTitle: sellQrCode.title,
          endDate,
          ProductList,
          allowToOperate: sellQrCode.allowToOperate
        })
        resolve(res);
      })
    })

  },

  // 判断是否为管理员
  async getIdentity() {
    let schoolId = this.data.schoolId
    console.log('schoolId ===' + schoolId)
    let res = await SchoolManager.where({'schoolId': schoolId, 'status': 0, '_openid': wx.getStorageSync('currentUser')._openid}).get()
    if(res.data.length > 0){
      this.setData({
        canViewAllOrderList: true,
      })
    }
    console.log(res)
  },

  // 切换小朋友
  toFamily() {
    let { schoolId, schoolName } = this.data
    wx.navigateTo({
      url: `/pages/family/family?schoolId=${schoolId}&schoolName=${schoolName}`
    })
  },

  // 跳转到订单列表
  toOrderList() {
    let {schoolId, sellQrCodeId} = this.data
    wx.navigateTo({
      url: `/pages/orderList/orderList?schoolId=${schoolId}&sellQrCodeId=${sellQrCodeId}`
    })
  },

  // 跳转到商品详情
  toProductDetails(event) {
    let { schoolName, schoolId, sellQrCodeId, sellQrCodeTitle, allowToOperate } = this.data

    let orderInfo = {
      schoolName,
      schoolId,
      sellQrCodeId,
      sellQrCodeTitle,
    }
    wx.setStorageSync('orderInfo', orderInfo)
    wx.setStorageSync('allowToOperate', allowToOperate)

    let ProductInfo = this.data.ProductList.filter(item => {
      if(item._id === event.currentTarget.id) {
        return item
      }
    })
    wx.setStorageSync('ProductInfo', ...ProductInfo)
    wx.navigateTo({
      url: `/pages/productDetails/productDetails?id=${event.currentTarget.id}`
    })
  },

  // 选购
  choose(event) {
    let ProductInfo = this.data.ProductList.filter(item => item._id === event.currentTarget.id)
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
      let isNewProduct = true
      if(shopCart.length) shopCart = shopCart.map(item => {
        // 如果购物车中有该商品且规格一样 则把数量加上去
        if(item._id === id && ProductInfo.choice === item.choice) {
          isNewProduct = false
          item.operation += ProductInfo.operation
        }
        return item
      })

      let newProductInfo = {...ProductInfo}
      if(isNewProduct) shopCart.unshift(newProductInfo)

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
    if(shopCart.length) shopCart.forEach(item => {
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
    if(index || index === 0) {
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
    if(index || index === 0) {
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

    // 这里使用index做判断 是因为购物车会有同id的商品
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
  },

  // 立即结算的回调函数
  toOrder() {
    let { studentInfo, shopCart, schoolName, schoolId, sellQrCodeId, sellQrCodeTitle } = this.data

    if(Object.keys(studentInfo).length===0) {
      wx.showToast({
        title: '请选择您的孩子!',
        icon: 'none',
        duration: 2000
      })
      return
    } else if(!shopCart.length) {
      wx.showToast({
        title: '购物车不能为空!',
        icon: 'none',
        duration: 2000
      })
      return
    } else {
      wx.navigateTo({
        url: `/pages/order/order?schoolName=${schoolName}&schoolId=${schoolId}&QrCodeId=${sellQrCodeId}&QrCodeTitle=${sellQrCodeTitle}`
      })
    }
  },

  // 页面卸载时触发
  onUnload() {
    wx.removeStorageSync('shopCart')
  }
})
