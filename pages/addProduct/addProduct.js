// pages/AddProduct/AddProduct.js
let app = getApp();

const uuid = require('../../utils/uuid.js');
import { pathOfDate } from '../../utils/util'

const db = wx.cloud.database()
const type = {
  first: 'firstList',
  details: 'detailsList',
}
let id = '' // 编辑商品的id
let idList = [] // 编辑时删除图片的id

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
    // 编辑商品时添加的图片
    upDataCloudImage: {
      first: [],
      details: [],
    },
    // 当前的状态 true(添加商品) false(编辑商品)
    type: true,
    showProductManageButton: false
  },

  // 页面初始化
  onLoad(options) {
    id = options.id
    idList = []
    if(options.id){
      console.info(id)
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

      //如果没有关联二维码则允许修改
      db.collection('SellQrCodeProduct').where({
        productId: id
      }).get().then(res => {
        if(res.data.length == 0){
          this.setData({
            showProductManageButton: true
          })
        }
      })

    }else{
      this.setData({
        showProductManageButton: true
      })
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
        let items = item.map(img => {
          img.url = img.path
          img.thumb = img.path
          img.type = 'image'
          return img
        })
        index === 0 ? ProductVideoImage.first = items : ProductVideoImage.details = items
      })

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
    let { _id, url } = event.detail.file
    let path = url.match(/(\w+)/)[0]
    // 如果删除的照片 url 为 cloud 开头的就添加到 idList 中
    if(path === 'cloud') idList.push(_id)

    let newList = this.data[type[event.target.id]]?.filter((item, index) => index !== event.detail.index)
    this.setData({
      [type[event.target.id]]: newList
    })
  },

  check(){
    if(!this.data.form.name){
      wx.showToast({
        title: `标题不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if(!this.data.form.unitPrice){
      wx.showToast({
        title: `价格不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    let specificationCheck = true
    this.data.Specifications.forEach(item => {
      if(!item.name){
        wx.showToast({
          title: `规格名称不能为空`,
          icon: 'none',
          duration: 1000
        })
        specificationCheck = false
        return;
      }

      item.value.forEach(c => {
        if(!c){
          wx.showToast({
            title: `规格选项不能为空`,
            icon: 'none',
            duration: 1000
          })
          specificationCheck = false
          return;
        }
      })

    })

    if(!specificationCheck){
      return false
    }

    if(this.data.firstList.length == 0){
      wx.showToast({
        title: `首图不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    
    if(this.data.detailsList.length == 0){
      wx.showToast({
        title: `详情图不能为空`,
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    return true
  },

  // 添加/修改 商品的处理函数
  async addProduct() {
    let text = this.data.type ? '添加' : '修改'

    //内容检验
    if(!this.check()){
      return;
    }

    wx.showLoading({
      title: `${text}中...`,
    })
    // 清空 upCloudImage
    this.data.upCloudImage = {
      first: [],
      details: [],
    }
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
    let results = this.data.type ? this.request('addProduct', data) : this.request('editProduct', data, id, idList)

    results.then(res => {
      wx.hideLoading()
      wx.showToast({
        title: `${text}成功`,
        icon: 'success',
        duration: 1000
      })
      // 返回上一层 到(商品管理)
      setTimeout(function () {
        wx.hideToast();
        wx.navigateBack({
          delta: 1
        })
      }, 1500);

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
  async request(surface, data, id, idList) {
    data.id = id
    data.idList = idList
    return await wx.cloud.callFunction({
      name: surface,
      data
    })
  },

  // 将图片上传到云存储
  upCloud(imageList, type) {
    let worker = []
    let upCloudImage = { ...this.data.upCloudImage }
    // 遍历上传图片
    imageList.forEach((item, index) => {
      // 判断是新添加的原图片 还是 新增的图片
      if(item.url.startsWith("cloud://")) {
        item.order = index
        upCloudImage[type].push(item)
      } else {
        let cloudPath = "schoolUniformSubscription/product/" + pathOfDate() + uuid.uuid() + item.url.match(/.[^.]+$/)[0]
        // 上传图片
        let process = wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: item.url,
        })
        // 上传成功
        .then(res => {
          // 标记图片 首图为 0 详情图为 1
          let typeID = type === 'first' ? 0 : 1
          upCloudImage[type].push({
            path: res.fileID,
            materialType: typeID,
            order: index,
          })
        })
        this.setData({upCloudImage})
        worker.push(process)
      }
    })
    return Promise.all(worker)
  }
})
