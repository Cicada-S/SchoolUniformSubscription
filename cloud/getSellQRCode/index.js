// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取二维码信息
    let results = await db.collection("SellQrCode").doc(event.id).get()

    //设置是否允许操作（在二维码设置的时间内）
    let today = new Date().getTime()
    let allowToOperate = (results.data.beginTime <= today && results.data.endTime >= today) ? true : false
    results.data.allowToOperate = allowToOperate

    // 获取二维码对应的商品
    let product = await db.collection("SellQrCodeProduct").aggregate()
    .match({ sellQrCodeId: results.data._id })
    .lookup({
      from: "ProductVideoImage",
      localField: 'productId',
      foreignField: 'productId',
      as: 'productImages'
    })
    .lookup({
      from: "ProductSpecification",
      localField: 'productId',
      foreignField: 'productId',
      as: 'productSpecification'
    })
    .lookup({
      from: "Product",
      localField: 'productId',
      foreignField: '_id',
      as: 'product'
    }).end()

    // 处理商品
    let ProductList = []
    product.list.forEach(item => {
      let newProduct = {
        ...item.product[0],
        choice: '',
        operation: 1
      }
      // 处理商品图片
      item.productImages.forEach(imgItem => {
        if(imgItem.materialType === 0 && imgItem.order === 0) {
          newProduct.path = imgItem.path
        }
      })

      // 处理商品规格
      let specification = []
      item.productSpecification.forEach(item => {
          item.value = item.value.map(valItem => {
          return valItem = {
            text: valItem,
            isChoice: 0
          }
        })
        specification.push(item)
      })
      
      //排序
      specification.sort((l, i) => {
        return (l.order + "").localeCompare( i.order + "")
      })

      newProduct.specification = specification
      ProductList.push(newProduct)
    })

    // 需要返回的数据
    let data = {
      sellQrCode: results.data,
      ProductList
    }

    // 成功返回
    return {
      code: 0,
      data,
      success: true
    }
  }
  catch (err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      error: err,
      success: false
    }
  }
}
