// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);

  const results = {
    code: 0,
    msg: '添加成功'
  }

  return {
    results,
  }
}