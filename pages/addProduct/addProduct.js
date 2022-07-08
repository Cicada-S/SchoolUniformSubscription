// pages/AddProduct/AddProduct.js
let app = getApp();

import h from '../../utils/hashCode';

const type = {
  first: 'firstList',
  details: 'detailsList',
}

Page({
  data: {
    bottomLift: app.globalData.bottomLift, 
    form: {
      titleValue: '冬季新款',
      // descValue: '冬季新款校服',
      priceValue: '98.00',
    },
    Specifications: [
      {
        title: '颜色',
        option: ['蓝色'],
      }
    ],
    firstList: [], // 首图的数据
    detailsList: [], // 详情图的数据
    // 添加到数据表中的图片path
    upCloudImage: { 
      first: [],
      details: [],
    }, 
  },

  // 监听输入框的值
  onChange(event) {
    const type = {
      title: 'titleValue',
      // desc: 'descValue',
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
  async addProduct() {
    await this.upCloud(this.data.firstList, 'first')
    await this.upCloud(this.data.detailsList, 'details')

    let { form, upCloudImage, Specifications  } = this.data

    console.log("addProduct", upCloudImage);

    let data = {
      form,
      upCloudImage,
      Specifications,
    }
    wx.cloud.callFunction({
      name: 'addProduct',
      data,
    })
    .then(res => {
      console.log(res);
    })
  },

  // 将图片上传到云存储
   upCloud(imageList, type) {
    let hashCode = h()
    let worker = []
    imageList.forEach((item, index) => {
      let imageName = hashCode + index + item.url.match(/.[^.]+$/)[0]
      // 上传图片
      let process = wx.cloud.uploadFile({
        cloudPath: imageName,
        filePath: item.url,
      }).then(res => {
        let upCloudImage = {
          ...this.data.upCloudImage,
        }
        upCloudImage[type].push({fileID: res.fileID})
        this.setData({
          upCloudImage: upCloudImage
        })
      })
      worker.push(process)
    })
    return Promise.all(worker)
  }
})
