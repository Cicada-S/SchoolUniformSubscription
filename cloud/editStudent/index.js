// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let { studentId, name, gender, phoneNumber, gradeName, classNmae} = event
  try {
    await db.collection('Student').doc(studentId).update({
      data: {
        name,
        gender,
        phoneNumber,
        gradeName,
        classNmae
      }
    })

    // 成功返回
    return {
      code: 0,
      success: true 
    }
  }
  catch(err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      success: false
    }
  }
}
