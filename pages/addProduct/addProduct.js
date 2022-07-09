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
      name: '',
      // desc: '',
      unitPrice: '',
    },
    Specifications: [
      {
        name: '',
        value: [''],
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
      title: 'name',
      // desc: 'desc',
      price: 'unitPrice',
    }
    this.setData({
      ['form.' + type[event.target.id]]: event.detail
    })
  },

  // 监听规格中输入框的值
  onChangeSpec(event) { 
    // index 为规格的索引 id 为规格中选项的索引
    let { index, id } = event.currentTarget.dataset
    // 不能直接使用 !id 因为 id=0 时为 false
    if(!id && id !== 0) {
      this.setData({
        [`Specifications[${index}].name`]: event.detail
      })
    } else {
      this.setData({
        [`Specifications[${index}].value[${id}]`]: event.detail
      })
    }
  },

  // 添加规格中的选项
  addSpecValue(event) {
    let { id } = event.target
    let value = this.data.Specifications[id].value
    value.push('')
    this.setData({
      [`Specifications[${id}].value`]: value
    })
  },

  // 添加规格
  addSpec() {
    let Specifications = this.data.Specifications
    Specifications.push({
      name: '',
      value: ['']
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
    wx.showLoading({
      title: '添加中...',
    })
    this.data.upCloudImage = { 
      first: [],
      details: [],
    },
    
    await this.upCloud(this.data.firstList, 'first')
    await this.upCloud(this.data.detailsList, 'details')

    let { form, upCloudImage, Specifications  } = this.data

    let data = {
      product: form,
      ProductVideoImage: upCloudImage,
      ProductSpecification: Specifications,
    }
    wx.cloud.callFunction({
      name: 'addProduct',
      data,
    }).then(res => {
      console.log('添加商品成功', res);
      wx.hideLoading()
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 1000
      })
      wx.navigateBack({
        delta: 1,
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '添加失败',
        icon: 'error',
        duration: 1000
      })
      console.log('添加商品失败', err);
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
        upCloudImage[type].push({path: res.fileID, order: index})
        console.log('order', index, 'type', type)
        this.setData({
          upCloudImage: upCloudImage
        })
      })
      worker.push(process)
    })
    return Promise.all(worker)
  }
})
