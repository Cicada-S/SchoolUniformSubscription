// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let {id, name, address, logo} = event
  try {
    await db.collection('School').doc(id).update({
      data: {
        name,
        address,
        logo
      }
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
