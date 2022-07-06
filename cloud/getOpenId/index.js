// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-9ghc7y1j0db0f20d',
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