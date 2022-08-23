// pages/editOrder/editOrder.js
let db = wx.cloud.database()
const order = db.collection('Order')
const grade = db.collection('Grade')

Page({
  data: {
    orderId: '', // 订单id
    schoolName: '', // 买家名
    multiIndex: [0, 0], // 已选班级
    multiArray: [], // 当前年级的班级
    classArray: [], // 班级列表
  },

  // 页面初始化
  onLoad(options) {
    this.getOrderInfo(options.id)
    this.setData({ orderId: options.id })
  },

  // 获取订单信息
  async getOrderInfo(id) {
    // 获取订单
    let orderInfo = await order.doc(id).get()
    this.setData({ schoolName: orderInfo.data.schoolName })

    // 获取年级
    grade.where({ schoolId: orderInfo.data.schoolId }).get()
    .then(res => {
      // 将年级和班级的name分开
      let grades = [[]]
      res.data.forEach((item, index) => {
        grades[0].push(item.name)
        grades[index + 1] = item.className
      })
      // 将grades的年级和班级分开
      let multiArray = grades.slice(0, 2)
      let classArray = grades.slice(1, grades.length)

      this.setData({
        multiArray,
        classArray
      })
    })
  },

  // 确认修改
  editGrade() {
    let { orderId, multiArray, multiIndex } = this.data
    let gradeName = multiArray[0][multiIndex[0]]
    let className = multiArray[1][multiIndex[1]]

    // 更新订单的年级和班级
    order.doc(orderId).update({
      data: {
        studentGradeName: gradeName,
        studentClassName: className
      }
    }).then(() => {
      wx.showToast({
        title: '修改成功！',
        icon: 'success',
        duration: 1500
      })
      setTimeout(()=> {
        wx.navigateBack({
          delta: 1
        })
      }, 1500)
    })
  },

  // 点击确认时触发
  bindMultiPickerChange(event) {
    this.setData({
      multiIndex: event.detail.value,
    })
  },

  // 列改变时触发
  bindMultiPickerColumnChange(event) {
    const data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[event.detail.column] = event.detail.value

    this.data.classArray.forEach((item, index) => {
      if(event.detail.column === 0) {
        if(data.multiIndex[0] === index) {
          data.multiArray[1] = item
        }
        data.multiIndex[1] = 0
      }
      this.setData(data);
    })
  }
})
