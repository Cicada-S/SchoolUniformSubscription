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
    let result = await db.collection('Order').where({ sellQrCodeId: event.id }).get()
    console.log(result)
  }
  catch(err) {
    console.log(err)
  }
}
