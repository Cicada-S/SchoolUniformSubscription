const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const orderId = event.outTradeNo
  const returnCode = event.returnCode
  const totalPrice = event.totalFee
  if(returnCode == 'SUCCESS'){
    //更新云数据库的订单状态，改为已支付的状态即可
    db.collection('Order').where({
        _id:orderId,
    }).update({
      data:{
        status:1,
        totalPrice: totalPrice,
        lastModifiedTime: new Date(),
        lastModifiedOpenid: cloud.getWXContext().OPENID,
      }
    })
    const res = {errcode: 0, errmsg: '支付成功'}//需要返回的字段，不返回该字段则一直回调
    return res
  }
}