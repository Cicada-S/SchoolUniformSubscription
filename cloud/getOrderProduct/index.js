// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  try {
    let order = await db.collection('Order').where({'_openid': cloud.getWXContext().OPENID, 'status': 1}).get()

    let orderList = order.data.map(async item => {
      return await db.collection('OrderProduct').where({orderId:item._id}).get()
    })

    console.log('orderList', orderList)
    let orderProductList = await Promise.all(orderList)
    
    let data = []
    orderProductList.forEach(item => {
      data.unshift(...item.data)
    })
    console.log(data)

    // 成功返回
    return {
      code: 0,
      data,
      success: true
    }
  }
  catch(err) {
    console.log(err)
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      success: false
    }
  }
}
