// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let data = {}
  try {
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

    await db.collection('Order').aggregate().match({
      sellQrCodeId: event.sellQrCodeId
    }).lookup({
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
