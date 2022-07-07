// pages/AddProduct/AddProduct.js
let app = getApp();

const type = {
  first: 'firstList',
  details: 'detailsList',
}

Page({
  data: {
    bottomLift: app.globalData.bottomLift,
    form: {
      titleValue: '',
      descValue: '',
      priceValue: '',
    },
    Specifications: [
      {
        title: '',
        option: [''],
      }
    ],
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

  // 监听规格中输入框的值
  onChangeSpec(event) { 
    // index 为规格的索引 id 为规格中选项的索引
    let { index, id } = event.currentTarget.dataset
    console.log(index, id);
    // 不能直接使用 !id 因为 id=0 时为 false
    if(!id && id !== 0) {
      this.setData({
        [`Specifications[${index}].title`]: event.detail
      })
    } else {
      this.setData({
        [`Specifications[${index}].option[${id}]`]: event.detail
      })
    }
  },

  // 添加规格中的选项
  addSpecValue(event) {
    let { id } = event.target
    let option = this.data.Specifications[id].option
    option.push('')
    this.setData({
      [`Specifications[${id}].option`]: option
    })
  },

  // 添加规格
  addSpec() {
    let Specifications = this.data.Specifications
    Specifications.push({
      title: '',
      option: ['']
    })
    this.setData({
      Specifications
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