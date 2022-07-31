// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let school = {
    name: event.name,
    _openid: cloud.getWXContext().OPENID,
    address: event.address,
    logo: event.logo,
    remark: event.remark,
    createTime: new Date(),
    lastModifiedTime: new Date(),
    lastModifiedOpenid: cloud.getWXContext().OPENID,
    status: 0
  }

  try {
    await db.collection('School').add({
      data: school
    }).then(res => {

      event.grade.forEach((item, index) => {
        let newItem = {...item}
        newItem.order = index
        newItem.schoolId = res._id
        db.collection('Grade').add({
          data: newItem
        })
      })
    })

    // 成功返回
    return {
      code: 0,
      success: true,
    }
  }
  catch (err) {
    console.error('transaction error');
    // 失败返回
    return {
      code: 1,
      error: err,
      success: false,
    }
  }
}
