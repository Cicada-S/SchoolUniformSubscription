// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

//操作excel用的类库
const xlsx = require('node-xlsx')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let order = await db.collection('Order').aggregate().match({
      sellQrCodeId: event.id
    })
    .lookup({
      from: 'OrderProduct',
      localField: '_id',
      foreignField: 'orderId',
      as: 'orderProduct'
    }).end()
    console.log(order)

    // 1, 定义excel表格名
    let dataCVS = `${order.list[0].sellQrCodeTitle}.xlsx`

    // 2, 定义存储数据的
    let alldata = []
    let row = ['id', '学校', '年级', '班级', '姓名', '性别', '下单时间', '商品名称', '购买数量', '规格', '备注' ] //表属性
    alldata.push(row)

    for (let key in order.list) {
      let arr = []
      arr.push(order.list[key]._id)
      arr.push(order.list[key].schoolName)
      arr.push(order.list[key].studentGradeName)
      arr.push(order.list[key].studentClassName)
      arr.push(order.list[key].studentName)
      arr.push(order.list[key].studentGender)
      arr.push(order.list[key].createTime)
      // for (let product in order.list[key].orderProduct) {
      arr.push(order.list[key].orderProduct[0].productName)
      arr.push(order.list[key].orderProduct[0].amount)
      arr.push(order.list[key].orderProduct[0].specification)
      // }
      arr.push(order.list[key].remark)
      alldata.push(arr)
    }

    // 定制纸张规格
    const sheetOptions = {
      // 自定义列宽
      '!cols': [
        {wch: 32}, {wch: 14}, {wch: 8}, {wch: 6}, 
        {wch: 8}, {wch: 6}, {wch: 8}, {wch: 8}, 
        {wch: 8}, {wch: 14}
      ],
      // 合并单元格
      '!merges': [{
        // s: {c: 2, r: 1}, e: {c: 2, r: 2},
      }]
    }

    //3，把数据保存到excel里
    var buffer = xlsx.build([{
      name: "mySheetName",
      data: alldata
    }], {sheetOptions})

    //4，把excel文件保存到云存储里
    let result =  await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

    // 成功返回
    return {
      code: 0,
      data: result,
      success: true
    }
  }
  catch(err) {
    console.log(err)
    console.error('transaction error')
    // 失败返回
    return {
      code: 0,
      success: true
    }
  }
}
