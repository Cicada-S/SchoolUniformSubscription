// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { openid } = cloud.getWXContext()
  console.log(event);
  console.log(cloud.getWXContext());

  return {
    event,
    openid,
  }
}