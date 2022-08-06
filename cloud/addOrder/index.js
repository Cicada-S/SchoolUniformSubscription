// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { order, productList } = event
  let orderData = {
    ...order,
    _openid: cloud.getWXContext().OPENID,
    createTime: new Date(),
    lastModifiedTime: new Date(),
    lastModifiedOpenid: cloud.getWXContext().OPENID,
    status: 0
  }

  // 将商品数据处理成数据库需要的类型
  let newProductList = []
  productList.forEach(item => {
    newProductList.push({
      productId: item._id,
      productName: item.name,
      amount: item.operation,
      unitPrice: item.unitPrice,
      totalPrice: item.operation * item.unitPrice,
      specification: item.choice,
      headImage: item.path
    })
  })
  
  try {
    db.collection('Order').add({data: orderData})
    .then(res => {
      newProductList.forEach(async item => {
        item.orderId = res._id
        await db.collection('OrderProduct').add({
          data: item
        })
      })
    })

    // 成功返回
    return {
      code: 0,
      success: true,
    }
  }
  catch(err) {
    console.log(err)
    console.error('transaction error');
    // 失败返回
    return {
      code: 1,
      success: false,
    }
  }
}
