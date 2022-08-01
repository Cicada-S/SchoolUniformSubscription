const cloud = require('wx-server-sdk')
cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
      env: 'prod-5gbrg2v163ae3d24'
})
const db = cloud.database()
exports.main = async (event, context) => {
  let orderInfo = {}
  await db.collection('Order').doc(event.orderId).get()
  .then(res => {
    orderInfo = res.data
  })

  orderInfo.lastModifiedTime = new Date()
  orderInfo.lastModifiedOpenid = cloud.getWXContext().OPENID
  let detail = JSON.stringify(orderInfo)

  const res = await cloud.cloudPay.unifiedOrder({
    "body": '支付校服费用',
    "detail": detail,
    "outTradeNo": event.orderId, //不能重复，否则报错
    "spbillCreateIp": "127.0.0.1", //就是这个值，不要改
    "subMchId": "1628494787",  //你的商户号,
    "totalFee": orderInfo.totalPrice,  //单位为分 *100
    "envId": "prod-5gbrg2v163ae3d24",  //填入你的云开发环境ID
    "functionName": "pay_success",  //支付成功的回调云函数
    "nonceStr": event.orderId,//随便弄的32位字符串，建议自己生成
    "tradeType": "JSAPI"   //默认是JSAPI
  })
  return res
}