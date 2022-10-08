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
    await db.collection('School').doc(event.id).get()
    .then(res => {
      data.school = res.data
    })

    await db.collection('Grade').where({
      schoolId: event.id
    }).orderBy('order', 'asc').get()
    .then(res => {
      data.grade = res.data
    })

    // 成功返回
    return {
      code: 0,
      data: data,
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
