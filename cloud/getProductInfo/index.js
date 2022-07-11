// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let productInfo = {}
  try {
    // 获取商品 title price
    await db.collection('Product').doc(event.id).get()
    .then(res => {
      productInfo.product = res.data
    })
    // 获取商品 首图 详情图
    await db.collection('ProductVideoImage').orderBy('order', 'asc')
    .where({
      productId: event.id
    }).get()
    .then(res => {
      console.log('ProductVideoImage', res)
      let images = {
        first: [],
        details: [],
      }
      // 获取到的图片（首图，详情图）
      res.data.forEach((item, index) => {
        if(item.type === 0) { // 首图
          images.first.push(item)
        }else{ // 详情图
          images.details.push(item)
        }
      })
      productInfo.ProductVideoImage = images
    })
    // 获取商品 规格
    await db.collection('ProductSpecification').where({
      productId: event.id
    }).get()
    .then(res => {
      console.log('ProductSpecification', res)
      productInfo.ProductSpecification = res.data
    })

    // 成功返回
    return {
      code: 0,
      data: productInfo,
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
