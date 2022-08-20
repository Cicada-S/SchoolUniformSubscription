// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  //检验是否有权限操作
  let havePermission = false
  const _ = db.command
  let systemConfigConditiion = {'key': 'adminOpenIds',  'value': _.in([cloud.getWXContext().OPENID]) };
  await db.collection('SystemConfig').where(systemConfigConditiion).get()
      .then(res => {
        havePermission = res.data.length > 0
      })
  if(!havePermission){
    return {
      code: 1,
      error: 'You dont have permission to perform the operation',
      success: false,
    }
  }

  let {id, name, address, logo, grade} = event
  try {
    // 删除原有的级别
    await db.collection('Grade').where({
      schoolId: id
    }).remove()

    // 修改买家信息
    await db.collection('School').doc(id).update({
      data: {
        name: name,
        address: address,
        logo: logo,
        lastModifiedTime: new Date(),
        lastModifiedOpenid: cloud.getWXContext().OPENID,
      }
    })

    // 添加级别
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
