// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 操作excel用的类库
const xlsx = require('node-xlsx')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取订单数据
    let order = await db.collection('Order').aggregate()
    .sort({
      studentGradeName: 1,
      studentClassName: 1
    }).match({
      sellQrCodeId: event.id,
      status: 1
    })
    .lookup({
      from: 'OrderProduct',
      let: {
        order_id: '$_id'
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([
            $.eq(['$orderId', '$$order_id'])
        ])))
        .sort({
          productName: 1,
          specification: 1
        })
        .done(),
      as: 'orderProduct'
    }).end()


    // 将订单对应的订单商品拆分出来
   let newOrder = order.list.reduce((prev, item) => {
      for(let i of item.orderProduct) {
        prev.push({ ...item, orderProduct: [i]})
      }
      return prev
    }, [])

    // 1. 定义excel表格名
    let dataCVS = `${newOrder[0].sellQrCodeId}.xlsx`

    // 2. 定义存储数据的
    const summary = summaryList(newOrder)
    const statistics = statisticsList(newOrder)
    const detailed = detailedList(newOrder)

    // 3. 把数据保存到excel里
    var buffer = xlsx.build([
      { name: "证订汇总表", data: summary.alldata, options: summary.sheetOptions },
      { name: "分班统计表", data: statistics.alldata, options: statistics.sheetOptions },
      { name: "证订明细表", data: detailed.alldata, options: detailed.sheetOptions },
    ])

    // 4. 把excel文件保存到云存储里
    let result =  await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, // excel二进制文件
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

// 征订汇总表
function summaryList(newOrder) {
  // 1. 定义存储数据的
  let alldata = [['订单汇总']]
  let row = ['性别', '产品名称', '规格', '总计'] // 表属性
  alldata.push(row)

  // 2. 将数据写入表中
  let gender = { male: [], female: [] }
  // 遍历数据 将性别分开
  for (let key in newOrder) {
    if(newOrder[key].studentGender == 1) {
      newOrder[key].studentGender = '男'
      gender.male.push(newOrder[key])
    }else {
      newOrder[key].studentGender = '女'
      gender.female.push(newOrder[key])
    }
  }

  let coordinates = [] // 坐标
  let genderLength = [] // 第一轮性别的长度
  Object.keys(gender).forEach((item, index) => {
    let map = new Map()
    // 商品名称的合并坐标
    gender[item].forEach((p, i) => {
      let productId = p.orderProduct[0].productId
      if(map.get(productId)){
        let startIndex = map.get(productId).startIndex
        map.set(productId, {'startIndex': startIndex, 'endIndex': i})
      }else{
        map.set(productId, {'startIndex': i, 'endIndex': i})
      }
    })
    if(index === 0) genderLength.push([...map].length)
    coordinates.push(...map)

    // 将数据写入表中
    for(let key in gender[item]) {
      let arr = []
      arr.push(gender[item][key].studentGender)
      arr.push(gender[item][key].orderProduct[0].productName)
      arr.push(gender[item][key].orderProduct[0].specification)
      arr.push(gender[item][key].orderProduct[0].amount)
      alldata.push(arr)
    }
    genderLength.push(gender[item].length)

    let summary = [`${gender[item][0].studentGender}汇总`, '', '', gender[item].length]
    alldata.push(summary)
  })
  alldata.push(['总计', '', '', genderLength[1]+genderLength[2]])
  

  // 将坐标修改成 '!merges' 字段类型
  let merges = []
  coordinates.forEach((item, index) => {
    if(index === 0) {
      merges.push({s: {c: 1, r: item[1].startIndex + 2}, e: {c: 1, r: item[1].endIndex + 2}})
    }else if(index < genderLength[0]) { // 男
      let last = merges[index - 1].e.r // 上一个坐标的结束坐标
      merges.push({s: {c: 1, r: item[1].startIndex + last}, e: {c: 1, r: item[1].endIndex + last}})
    }else { // 女
      let last = merges[index - 1].e.r
      merges.push({s: {c: 1, r: item[1].startIndex + last + 1}, e: {c: 1, r: item[1].endIndex + last + 1}})
    }
  })

  // 3. 定制纸张规格
  const sheetOptions = {
    '!cols': [ // 自定义列宽
      {wch: 20}, {wch: 20}, {wch: 30}, {wch: 6}
    ],
    '!merges': [ // 合并单元格
      {s: {c: 0, r: 0}, e: {c: 3, r: 0}}, // 标题
      {s: {c: 0, r: 2}, e: {c: 0, r: gender.male.length + 1}}, // 男
      {s: {c: 0, r: gender.male.length + 3}, e: {c: 0, r: gender.male.length + 2 + gender.female.length}}, // 女
      ...merges, // 产品名称
    ]
  }

  return {
    alldata,
    sheetOptions
  }
}

// 分班统计表
function statisticsList(newOrder) {
  console.log(newOrder)

  // 1. 定义存储数据的
  let alldata = [['分班统计']]
  let row = ['年级', '班级', '产品名称', '商品规格', '数量'] // 表属性
  alldata.push(row)

  // 2. 将数据写入表中
  let grade = []
  // 遍历数据 将年级分开
  newOrder.forEach(item => grade.push(item.studentGradeName))
  grade = [...new Set(grade)]
  console.log('grade', grade)

  /* let genderMap = new Map()
  newOrder.forEach(item => {
    if(genderMap.get(item.studentGradeName)) {
      let startIndex = genderMap.get(item.studentGradeName).startIndex
      genderMap.set()
    }
  }) */

  for (let key in newOrder) {
    let arr = []
    arr.push(newOrder[key].studentGradeName)
    arr.push(newOrder[key].studentClassName)
    arr.push(newOrder[key].orderProduct[0].productName)
    arr.push(newOrder[key].orderProduct[0].specification)
    arr.push(newOrder[key].orderProduct[0].amount)
    alldata.push(arr)
  }

  // 3. 定制纸张规格
  const sheetOptions = {
    '!cols': [ // 自定义列宽
      {wch: 10}, {wch: 10}, {wch: 20}, {wch: 25}, {wch: 10}
    ],
    '!merges': [ // 合并单元格
      {s: {c: 0, r: 0}, e: {c: 4, r: 0}}
    ]
  }

  return {
    alldata,
    sheetOptions
  }
}

// 征订明细表
function detailedList(newOrder) {
  // 1. 定义存储数据的
  let alldata = [['征订明细']]
  let row = ['id', '学校', '年级', '班级', '姓名', '性别', '下单时间', '商品名称', '购买数量', '规格', '备注' ] //表属性
  alldata.push(row)

  // 2. 将数据写入表中
  for (let key in newOrder) {
    let arr = []
    arr.push(newOrder[key]._id)
    arr.push(newOrder[key].schoolName)
    arr.push(newOrder[key].studentGradeName)
    arr.push(newOrder[key].studentClassName)
    arr.push(newOrder[key].studentName)
    arr.push(newOrder[key].studentGender)
    arr.push(newOrder[key].createTime)
    arr.push(newOrder[key].orderProduct[0].productName)
    arr.push(newOrder[key].orderProduct[0].amount)
    arr.push(newOrder[key].orderProduct[0].specification)
    arr.push(newOrder[key].remark)
    alldata.push(arr)
  }

  // 3. 定制纸张规格
  const sheetOptions = {
    '!cols': [ // 自定义列宽
      {wch: 32}, {wch: 14}, {wch: 8}, {wch: 6}, 
      {wch: 8}, {wch: 6}, {wch: 8}, {wch: 8}, 
      {wch: 8}, {wch: 14}
    ],
    '!merges': [ // 合并单元格
      {s: {c: 0, r: 0}, e: {c: 10, r: 0}}
    ]
  }

  return {
    alldata,
    sheetOptions
  }
}
