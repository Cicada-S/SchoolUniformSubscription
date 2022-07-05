// pages/AddProduct/AddProduct.js
const type = {
  first: 'firstList',
  details: 'detailsList',
}

Page({
  data: {
    form: {
      titleValue: '',
      descValue: '',
      priceValue: '',
    },
    firstList: [], // 首图的数据
    detailsList: [], // 详情图的数据
  },

  // 监听输入框的值
  onChange(event) {
    const type = {
      title: 'titleValue',
      desc: 'descValue',
      price: 'priceValue',
    }
    this.setData({
      ['form.' + type[event.target.id]]: event.detail
    })
  },

  // 文件读取完成后
  afterRead(event) {
    this.data[type[event.target.id]].push(...event.detail.file)
    this.setData({
      [type[event.target.id]]: this.data[type[event.target.id]]
    })
  },

  // 删除图片的方法
  onDelete(event) {
    let newList = this.data[type[event.target.id]]?.filter((item, index) => index !== event.detail.index)
    this.setData({
      [type[event.target.id]]: newList
    })
  },

  // 添加商品的处理函数
  addProduct() {
    let { form, firstList, detailsList } = this.data;
    let productInfo = {
      form,
      firstList,
      detailsList
    }
  }
})