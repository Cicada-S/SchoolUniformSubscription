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
    db.collection('Student').add({
      data: event
    }).then(res => {
      console.log(res)
    })

    // 成功返回
    return {
      code: 0,
      success: true
    }
  }
  catch(err) {
    console.log(err)
    console.error('transaction error')
    // 失败返回
    return {
      code: 0,
      success: false
    }
  }
}
