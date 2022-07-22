// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let {id, name, address, logo, grade} = event
  try {
    // 删除原有的年级
    await db.collection('Grade').where({
      schoolId: id
    }).remove()

    // 修改学校信息
    await db.collection('School').doc(id).update({
      data: {
        name,
        address,
        logo
      }
    })

    // 添加年级
    grade.forEach(async (item, index) => {
      let newItem = {...item}
      newItem.order = index
      newItem.schoolId = id
      await db.collection('Grade').add({
        data: newItem
      })
    });

    // 成功返回
    return {
      code: 0,
      success: true 
    }
  }
  catch (err) {
    console.error('transaction error')
    // 失败返回
    return {
      code: 1,
      success: false
    }
  }
}
