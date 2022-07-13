// pages/AddProduct/AddProduct.js
let app = getApp();

import h from '../../utils/hashCode';

const type = {
  first: 'firstList',
  details: 'detailsList',
}
let id = '' // 编辑商品的id

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
    // 当前的状态 true(添加商品) false(编辑商品)
    type: true
  },

  // 页面初始化
  onLoad(options) {
    id = options.id
    if(options.id){
      this.setData({
        type: false
      })
      wx.setNavigationBarTitle({
        title: '编辑商品'
      })
      wx.showLoading({
        title: '获取数据中...',
      })
      this.getProductInfo(options.id)
    }
  },

  // 编辑商品时回填数据
  async getProductInfo(id) {
    // 获取商品信息
    await wx.cloud.callFunction({
      name: 'getProductInfo',
      data: {id}
    }).then(res => {
      let {product, ProductSpecification, ProductVideoImage} = res.result.data
      // 将图片的格式修改成功 vant需要的格式
      Object.values(ProductVideoImage).forEach((item, index) => {
        let items = item.map((img, idx) => {
          img.url = img.path
          img.name = idx
          img.thumb = img.path
          img.type = 'image'

          // 将图片下载到临时文件
          /* wx.downloadFile({ 
            url: img.path,
            success: res => {
              console.log(res.tempFilePath)
            },
            fail: err => {
              console.log(err)
            }
          }); */

          return img
        })
        index === 0 ? ProductVideoImage.first = items : ProductVideoImage.details = items
      })

      // wx.setStorageSync('upCloudImage', ProductVideoImage);

      wx.hideLoading()
      this.setData({
        form: product,
        Specifications: ProductSpecification,
        firstList: ProductVideoImage.first,
        detailsList: ProductVideoImage.details
      })
    })
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
    let text = this.data.type ? '添加' : '修改'

    wx.showLoading({
      title: `${text}中...`,
    })

    // 清空 upCloudImage
    this.data.upCloudImage = { 
      first: [],
      details: [],
    }

    // 编辑状态到缓存获取图片路径
    /* if(!type) {
      let { first, details } = wx.getStorageSync('upCloudImage')
      this.setData({
        firstList: first,
        detailsList: details
      })
    } */
    
    // 将图片上传到服务器
    await this.upCloud(this.data.firstList, 'first')
    await this.upCloud(this.data.detailsList, 'details')

    let { form, upCloudImage, Specifications  } = this.data

    // 扁平化 然后转成数组 
    upCloudImage = Object.values(upCloudImage).flat().map(item => item)
    
    let data = {
      product: form,
      ProductVideoImage: upCloudImage,
      ProductSpecification: Specifications,
    }

    // 判断当前状态为 编辑/添加 模式
    results = this.data.type ? this.request('addProduct', data) : this.request('editProduct', data, id)

    results.then(res => {
      wx.hideLoading()
      wx.showToast({
        title: `${text}成功`,
        icon: 'success',
        duration: 1000
      })
      // 清除缓存中的upCloudImage
      // wx.removeStorageSync('upCloudImage')
      // 返回上一层 到(商品管理)
      wx.navigateBack({
        delta: 1,
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: `${text}失败`,
        icon: 'error',
        duration: 1000
      })
    })
  },

  // 添加/修改商品的请求
  async request(surface, data, id){
    console.log(id)
    data.id = id
    return await wx.cloud.callFunction({
      name: surface,
      data
    })
  },

  // 将图片上传到云存储
  upCloud(imageList, type) {
    let hashCode = h()
    let worker = []
    // 遍历上传图片
    imageList.forEach((item, index) => {
      let imageName = hashCode + index + item.url.match(/.[^.]+$/)[0]
      // 上传图片
      let process = wx.cloud.uploadFile({
        cloudPath: imageName,
        filePath: item.url,
      })
      // 上传成功 
      .then(res => {
        let upCloudImage = {
          ...this.data.upCloudImage,
        }
        // 标记图片 首图为 0 详情图为 1 
        let typeID = type === 'first' ? 0 : 1
        upCloudImage[type].push({
          path: res.fileID,
          type: typeID,
          order: index,
        })
        this.setData({upCloudImage})
      })
      worker.push(process)
    })
    return Promise.all(worker)
  }
})
