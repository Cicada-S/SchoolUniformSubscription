// pages/schoolShop/schoolShop.js
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
    ProductList: [
      {
        id: 1,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 2,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 3,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      },
      {
        id: 4,
        title: '夏季运动套装',
        price: '198.00',
        path: '/static/images/schoolShop/clothes.png'
      }
    ],
    totalPrice: '198.00',
    productNum: 1,
  }
})
