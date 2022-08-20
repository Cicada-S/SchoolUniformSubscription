// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  //检验是否有权限操作
  let havePermission = false
  const _ = db.command
  let systemConfigConditiion = {'key': 'adminOpenIds',  'value': _.in([cloud.getWXContext().OPENID]) };
  await db.collection('SystemConfig').where(systemConfigConditiion).get()
      .then(res => {
        havePermission = res.data.length > 0
      })
  if(!havePermission){
    return {
      code: 1,
      error: 'You dont have permission to perform the operation',
      success: false,
    }
  }

  let { product, ProductVideoImage, ProductSpecification } = event
  product.createTime = new Date()
  product._openid =cloud.getWXContext().OPENID
  product.lastModifiedTime = new Date()
  product.lastModifiedOpenid =cloud.getWXContext().OPENID
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
