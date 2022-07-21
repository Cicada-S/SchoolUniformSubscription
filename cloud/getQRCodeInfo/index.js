// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  
  try {
    // 获取二维码信息
    let SellQrCode = await db.collection('SellQrCode').doc(event.id).get()

    // 获取商品的id
    let SellQrCodeProduct = await db.collection('SellQrCodeProduct').where({
      sellQrCodeId: event.id
    }).get()

    let data = {
      SellQrCode: SellQrCode.data,
      product: []
    }
    
    let workerA = []
    let workerB = []
    SellQrCodeProduct.data.forEach(item => {
      // 根据id获取商品name
      let processA = db.collection('Product').doc(item.productId).get()
      workerA.push(processA)

      // 根据id获取商品path
      let processB = db.collection('ProductVideoImage').where({
        productId: item.productId,
        materialType: 0,
        order: 0
      }).get()
      workerB.push(processB)
    })

    // SellQrCodeProduct.data.forEach((item, index) => {
      let product = []
      
      Promise.all(workerA).then(res => {
        console.log('workerA', res)
        // product.push(...res)
      })
      
      Promise.all(workerB).then(res => {
        console.log('workerB', res)
        // product[index].path = res.data[0].path
      })
    // })

    return {
      code: 0,
      success: true,
      data
    }
  }
  catch(err) {
    console.log(err)
    console.error('transaction error')

    return {
      code: 1,
      error: err,
      success: false
    }
  }
}