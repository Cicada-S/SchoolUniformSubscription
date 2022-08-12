// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)

  try {
    db.collection('Grade').where({schoolId: event.schoolId}).get()
    .then(res => {
      console.log(res)
    })

    db.collection('Order').where({sellQrCodeId: event.sellQrCodeId}).get()
    .then(res => {
      console.log(res)
    })


  }
  catch(err) {
    console.log(err)
  }
}
