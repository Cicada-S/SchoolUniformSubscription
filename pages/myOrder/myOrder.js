import { toDates } from '../../utils/util'
// pages/myOrder/myOrder.js
Page({
  data: {
    orderList: []
  },

  // 页面初始化
  onLoad() {
    this.getOrderList()
  },

  // 获取订单商品列表
  async getOrderList() {
    let { result } = await wx.cloud.callFunction({name: 'getOrderProduct'})
    result.data.forEach(item => {
      item.createTimeStr = toDates(item.createTime)
    })
    this.setData({
      orderList: result.data
    })
  },

  // 重选
  toReselection(event) {
    console.log(event.currentTarget.id)
  },

  // 修改
  toEditOrder(event) {
    console.log(event.currentTarget.id)
  }
})
