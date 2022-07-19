// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { title, beginTime, endTime, schoolId, schoolName, createTime, selectProductId  } = event
  try {
    // 小程序码表
    await db.collection('SellQrCode').add({
      data: {
        title,
        beginTime,
        endTime,
        schoolId,
        schoolName,
        createTime
      }
    }).then(res => {
      // 生成小程序码
      const result = cloud.openapi.wxacode.getUnlimited({
        "page": 'pages/me/me',
        "envVersion": 'trial',
        "scene": `QRCODE=${res._id}`
      })
      // 生成的小程序码上传到云存储中
      const upload = cloud.uploadFile({
        cloudPath: 'QRCODE' + Date.now() + '.png',
        fileContent: result.buffer
      }).catch(err => {
        console.log(err)
      })

      // 更新SellQrCode
     db.collection('SellQrCode').doc(res._id).update({
        QrCodePath: upload.fileID
      }).catch(err => {
        console.log(err)
      })

      // 小程序码对应的商品
      selectProductId.forEach(async item => {
        await db.collection('SellQrCodeProduct').add({
          data: {
            productId: item,
            sellQrCodeId: res._id
          }
        })
      })
    }).catch(err => { 
      console.log(err)
    })

    return {
      code: 0,
      success: true
    }
  }
  catch(err) {
    console.error('transaction error')

    return {
      code: 1,
      success: false
    }
  }
}
