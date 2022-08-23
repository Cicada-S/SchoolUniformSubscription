// pages/myOrder/myOrder.js
import { toDates } from '../../utils/util'

Page({
  data: {
    orderList: []
  },

  // 页面显示
  onShow() {
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
    wx.navigateTo({
      url: `/pages/reselection/reselection?id=${event.currentTarget.id}`
    })
  },

  // 修改 
  toEditOrder(event) {
    wx.navigateTo({
      url: `/pages/editOrder/editOrder?id=${event.currentTarget.id}`
    })
  }
})
