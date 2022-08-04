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
    // 获取学校
    await db.collection('School').doc(event.schoolId).get()
    .then(async res => {
      data.school = res.data

      // 获取年级
      await db.collection('Grade').where({ schoolId: res.data._id }).get()
      .then(res => {
        data.grade = res.data
      })
    })

    // 将grade处理成前端需要的数据
    let grade = [[]]
    data.grade.forEach((item, index) => {
      grade[0].push(item.name)
      grade[index + 1] = item.className
    })
    data.grade = grade
  
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
      success: false
    }
  }
}
