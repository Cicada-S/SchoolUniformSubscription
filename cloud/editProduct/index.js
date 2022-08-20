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

  console.log(event)
  let { id, idList, product, ProductVideoImage, ProductSpecification } = event

  try {
    // 删除对应的图片
    idList.forEach(async item => {
      await db.collection('ProductVideoImage').doc(item).remove()
    })

    // 删除规格
    await db.collection('ProductSpecification').where({
      productId: id
    }).remove()

    // 修改 name 和 price
    await db.collection('Product').doc(id).update({
      data: {
        name: product.name,
        unitPrice: product.unitPrice,
        lastModifiedTime: new Date(),
        lastModifiedOpenid: cloud.getWXContext().OPENID,
      }
    })

    // 添加图片
    ProductVideoImage.forEach(async item => {
      if (!item._id) {
        // 添加新上传图片
        item.productId = id
        await db.collection('ProductVideoImage').add({
          data: item
        })
      }
      else {
        // 更新图片的order
        console.log('order', item.order, 'id', item._id)
        await db.collection('ProductVideoImage').doc(item._id).update({
          data: {
            order: item.order
          }
        }).then(res => {
          console.log('更新成功', res)
        })
      }
    })

    // 添加规格
    ProductSpecification.forEach((item, index) => {
      let newItem = { ...item }
      newItem.order = index
      newItem.productId = id
      db.collection('ProductSpecification').add({
        data: newItem
      })
    })

    // 成功返回
    return {
      code: 0,
      success: true
    }
  }
  catch (err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      success: false
    }
  }
}
