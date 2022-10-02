// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { order, productList } = event

  //检查是否在二维码的允许的时间内操作
  let allowToOperate = false
  let today = new Date().getTime()
  await db.collection('SellQrCode').where({'_id': order.sellQrCodeId}).get()
      .then(res => {
        allowToOperate = (res.data[0].beginTime <= today && res.data[0].endTime >= today) ? true : false
      })

  if(!allowToOperate){
    return {
      code: 1,
      error: '请在二维码允许的时间范围内操作',
      success: false,
    }
  }


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
  let specificationIsEmplty = false
  for (const item of productList) {
    newProductList.push({
      productId: item._id,
      productName: item.name,
      amount: item.operation,
      unitPrice: item.unitPrice,
      totalPrice: item.operation * item.unitPrice,
      specification: item.choice,
      headImage: item.path
    }) 

    if(!item.choice){
      specificationIsEmplty = true
    }
  }

  //校验规格是否为空， 如果为空，怎不能添加
  if(specificationIsEmplty){
    return {
      code: 1,
      error: '存在规格为空， 请重新选择下单',
      success: false,
    }
  }

  try {
    let results = await db.collection('Order').add({data: orderData})

    for (let item of newProductList) {
      item.orderId = results._id
      await db.collection('OrderProduct').add({
        data: item
      })
    }

    // 成功返回
    return {
      code: 0,
      orderId : results._id,
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
