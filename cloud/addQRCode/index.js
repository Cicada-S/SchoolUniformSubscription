
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

  let { title, beginTime, endTime, schoolId, schoolName, selectProductId } = event
  try {
    // 小程序码表
    let SellQrCode = await db.collection('SellQrCode').add({
      data: {
        _openid: cloud.getWXContext().OPENID,
        title: title,
        beginTime: beginTime,
        endTime: endTime,
        schoolId: schoolId,
        schoolName: schoolName,
        createTime: new Date(),
        lastModifiedTime: new Date(),
        lastModifiedOpenid: cloud.getWXContext().OPENID,
        status: 0
      }
    })

    // 生成小程序码
    const result = await cloud.openapi.wxacode.getUnlimited({
      "page": 'pages/schoolShop/schoolShop',
      "scene": SellQrCode._id,
      "checkPath": false,
    })

    // 生成的小程序码上传到云存储中
    let cloudPath = "schoolUniformSubscription/sellQrCode/" + Date.now() + '.png'
    const upload = await cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: result.buffer
    })

    // 更新SellQrCode
    db.collection('SellQrCode').doc(SellQrCode._id).update({
      data: {
        qrCodePath: upload.fileID
      }
    })

    // 小程序码对应的商品
    selectProductId.forEach(async item => {
      await db.collection('SellQrCodeProduct').add({
        data: {
          productId: item,
          sellQrCodeId: SellQrCode._id
        }
      })
    })

    return {
      code: 0,
      success: true
    }
  }
  catch (err) {
    console.error('transaction error')

    return {
      code: 1,
      success: false
    }
  }
}
