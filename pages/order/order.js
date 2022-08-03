// pages/order/order.js
const app = getApp()

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    studentInfo: {
      id: 1,
      name: 'Cicada',
      Grade: '一年级 1班',
      school: '清华大学幼儿园',
      path: '/static/images/schoolShop/avatar.png',
    },
    productList: [
      {
        id: 1,
        name: '夏季运动套装',
        price: 198.00,
        parameter: '规格：夏季运动套装, 女款, 160',
        num: 1,
        path: '/static/images/order/clothes.png'
      },
      {
        id: 2,
        name: '夏季运动套装',
        price: 198.00,
        parameter: '规格：夏季运动套装, 女款, 160',
        num: 1,
        path: '/static/images/order/clothes.png'
      }
    ],
    remarksVlaue: '' // 备注内容
  },

  // 监听备注输入框的值
  onChange(event) {
    this.setData({ remarksVlaue: event.detail })
  },

  // 结算
  settlement() {
    console.log('结算')
  }
})
