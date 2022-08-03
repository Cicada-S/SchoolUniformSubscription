// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
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

    console.log(data)

    let grade = [[]]

    data.grade.forEach((item, index) => {
      console.log(item)
      grade[0].push(item.name)
      
      grade[index + 1] = item.className
    })

    console.log(grade)

    
  }
  catch(err) {
    console.log(err)
  }
}