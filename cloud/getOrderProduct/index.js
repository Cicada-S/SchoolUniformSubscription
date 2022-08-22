// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let result = await db.collection('Order').aggregate()
    .sort({
      createTime: -1
    })
    .match({
      _openid: cloud.getWXContext().OPENID,
      status: 1
    })
    .lookup({
      from: 'OrderProduct',
      localField: '_id',
      foreignField: 'orderId',
      as: 'orderProduct'
    })
    .lookup({
      from: 'SellQrCode',
      localField: 'sellQrCodeId',
      foreignField: '_id',
      as: 'sellQrCode'
    }).end()

    result.list.forEach(item => {
      item.active = true
      if(item.sellQrCode[0].endTime < Date.now()) {
        item.active = false
      }
      delete item.sellQrCode
    })

    // 成功返回
    return {
      code: 0,
      data: result.list,
      success: true
    }
  }
  catch(err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      success: false
    }
  }
}
