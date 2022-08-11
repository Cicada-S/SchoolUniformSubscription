// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let _openid = event._openid

  try {
    let order = await db.collection('Order').where({_openid}).get()

    let orderList = order.data?.map(async item => {
      return await db.collection('OrderProduct').where({orderId:item._id}).get()
    })

    let orderProductList = []
    Promise.all(orderList).then(res => {
      let orderProductList = res.map(item => {
        orderProductList.push(...item.data)
      })
    })

    console.log(orderProductList)

    // 成功返回
    return {
      code: 0,
      data: orderProductList,
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
