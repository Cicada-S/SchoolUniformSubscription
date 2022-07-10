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
      console.log('Product', res)
      productInfo.product = res.data
    })
    // 获取商品 首图 详情图
    await db.collection('ProductVideoImage').where({
      productId: event.id
    }).get()
    .then(res => {
      console.log('ProductVideoImage', res)
    })
    // 获取商品 规格
    await db.collection('ProductSpecification').where({
      productId: event.id
    }).get()
    .then(res => {
      console.log('ProductSpecification', res)
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
