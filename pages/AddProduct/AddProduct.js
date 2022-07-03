// pages/AddProduct/AddProduct.js
Page({
  data: {
    form: {
      titleValue: '',
      descValue: '',
      priceValue: '',
    },
    fileList: [
      {
        type: "image",
        name: "product.png",
        url: "/static/images/productAdmin/product.png",
        thumb: "/static/images/productAdmin/product.png",
      },
      {
        type: "image",
        name: "product.png",
        url: "/static/images/productAdmin/product.png",
        thumb: "/static/images/productAdmin/product.png",
      }
    ],
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

  // 上传图片
  afterRead(event) {
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      formData: { user: 'test' },
      success(res) {
        // 上传完成需要更新 fileList
        const { fileList = [] } = this.data;
        fileList.push({ ...file, url: res.data });
        this.setData({ fileList });
      },
    });
  },
})