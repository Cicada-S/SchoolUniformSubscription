// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  let { product, ProductVideoImage, ProductSpecification } = event
  product.createTime = db.serverDate()
  product.lastModifiedTime = null
  product.status = 0

  try {
    await db.collection('Product').add({
      data: product
    }).then(res => {
      Object.values(ProductVideoImage).forEach(item => {
        let newItem = {...item}
        newItem.productId = res._id
        db.collection('ProductVideoImage').add({
            data: newItem
        })
      })

      ProductSpecification.forEach((item, index) => {
        let newItem = {...item}
        newItem.order = index
        newItem.productId = res._id
        db.collection('ProductSpecification').add({
          data: newItem
        })
      })
    })
    // 成功返回
    return {
      code: 0,
      success: true,
    }
  }
  catch (err) {
    console.error('transaction error');
    // 失败返回
    return {
      code: 1,
      error: err,
      success: false,
    }
  }
}
