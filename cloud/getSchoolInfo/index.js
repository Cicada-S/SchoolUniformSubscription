// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let results = await db.collection('School').doc(event.id).get()
    // 成功返回
    return {
      code: 0,
      data: results.data,
      success: true
    }
  }
  catch (err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      error: err,
      success: false
    }
  }
}
