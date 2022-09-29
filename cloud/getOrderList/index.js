// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  // env: 'prod-5gbrg2v163ae3d24',
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let data = {}
  try {
    if(event.schoolId) {
      await db.collection('Grade').where({schoolId: event.schoolId}).get()
      .then(res => {
        let gradeList = []
        let classList = []

        res.data.forEach((item, index) => {
          gradeList.push({
            text: item.name,
            value: index
          })
          classList.push( item.className )
        })

        classList = classList.map(item => {
          return item.map((cla, idx) => {
            cla = { text: cla, value: idx }
            return cla
          })
        })

        data.gradeList = gradeList
        data.classList = classList
      })
    }

    let newScreen = {}
    if(event.newScreen) {
      newScreen = {
        ...event.newScreen,
        sellQrCodeId: event.sellQrCodeId
      }
    } else {
      newScreen = {
        sellQrCodeId: event.sellQrCodeId,
        studentGradeName: data.gradeList[0].text,
        studentClassName: data.classList[0][0].text,
      }
    }
    newScreen.status = 1
    await db.collection('Order').aggregate().limit(1000).match(newScreen)
    .lookup({
      from: 'OrderProduct',
      localField: '_id',
      foreignField: 'orderId',
      as: 'orderProduct'
    }).end()
    .then(res => {
      data.order = res.list
    })

    // 成功返回
    return {
      code: 0,
      data,
      success: true
    }
  }
  catch(err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      error: err,
      success: false
    }
  }
}
