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
    let order = await db.collection('Order').aggregate().limit(1000)
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
    let dataCVS = "schoolUniformSubscription/sellQrCode/" + pathOfDate() + `${newOrder[0].sellQrCodeId}.xlsx`

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
  let alldata = []
  let row = ['产品名称', '规格', '总计'] // 表属性
  alldata.push(row)

  
  //整理数据 （产品 规格 唯一）
  let dataMap = new Map()
  for (let key in newOrder) {
    let k = newOrder[key].orderProduct[0].productId + newOrder[key].orderProduct[0].specification
    if(dataMap.get(k)){
      dataMap.get(k).amount = dataMap.get(k).amount + newOrder[key].orderProduct[0].amount
    } else {
      dataMap.set(k,
          {	
            'productId': newOrder[key].orderProduct[0].productId,
            'productName': newOrder[key].orderProduct[0].productName,
            'specification': newOrder[key].orderProduct[0].specification,
            'amount': newOrder[key].orderProduct[0].amount
          })
    }
  }

  //排序
  const list = Array.from(dataMap.values());
  list.sort((l, i) => {
    if(l.productId != i.productId) {
      return l.productId.localeCompare(i.productId)
    }else if(l.specification != i.specification) {
      return l.specification.localeCompare(i.specification)
    }
  })

  //添加数据
  let merges = []
  let realIndex = 0
  let uniqueMap = new Map()
  let amount = 0
  for (let i in list) {
    let arr = []
    arr.push(list[i].productName)
    arr.push(list[i].specification)
    arr.push(list[i].amount)
    alldata.push(arr)
    amount += Number(list[i].amount)
    
    //产品
    if(uniqueMap.get('ProductName' + list[i].productId)){
      let startIndex = uniqueMap.get('ProductName' + list[i].productId).startIndex
      uniqueMap.set('ProductName' + list[i].productId, {'startIndex': startIndex, 'endIndex': realIndex})
    }else{
      uniqueMap.set('ProductName' + list[i].productId, {'startIndex': realIndex, 'endIndex': realIndex})
    }
    
    realIndex++
  }
  
  //总计
  alldata.push(['总计', '', amount])

  // 将坐标修改成 '!merges' 字段类型，合并性别/产品
  uniqueMap.forEach(function(value, key, map) {
    if(value.startIndex != value.endIndex){
      if(key.indexOf('ProductName') >= 0){//产品
        merges.push({s: {c: 0, r: value.startIndex + 1}, e: {c: 0, r: value.endIndex + 1}})
      }
    }
  });

  const sheetOptions = {
    '!cols': [ // 自定义列宽
      {wch: 40}, {wch: 20}, {wch: 10}, 
    ],
    '!merges': [ // 合并单元
        ...merges
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
  let alldata = []
  let row = ['年级', '班级', '产品名称', '商品规格', '数量'] // 表属性
  alldata.push(row)

  //整理数据 （年级 班级 产品	商品规格 唯一）
  let dataMap = new Map()
  for (let key in newOrder) {
    let k = newOrder[key].studentGradeName + newOrder[key].studentClassName + newOrder[key].orderProduct[0].productId + newOrder[key].orderProduct[0].specification
    if(dataMap.get(k)){
      dataMap.get(k).amount = dataMap.get(k).amount + newOrder[key].orderProduct[0].amount
    } else {
      dataMap.set(k,
          {'studentGradeName': newOrder[key].studentGradeName,
          'studentClassName': newOrder[key].studentClassName,
            'productId': newOrder[key].orderProduct[0].productId,
            'productName': newOrder[key].orderProduct[0].productName,
            'specification': newOrder[key].orderProduct[0].specification,
            'amount': newOrder[key].orderProduct[0].amount
          })
    }
  }

  //排序
  const list = Array.from(dataMap.values());
  list.sort((l, i) => {
    if(l.studentGradeName != i.studentGradeName){
      return l.studentGradeName.localeCompare(i.studentGradeName)
    } else if(l.studentClassName != i.studentClassName) {
      return l.studentClassName.localeCompare(i.studentClassName)
    } else if(l.productId != i.productId) {
      return l.productId.localeCompare(i.productId)
    }else if(l.specification != i.specification) {
      return l.specification.localeCompare(i.specification)
    }
  })

  //添加数据
  let merges = []
  let realIndex = 0
  let uniqueMap = new Map()
  for (let i in list) {
    let arr = []
    arr.push(list[i].studentGradeName)
    arr.push(list[i].studentClassName)
    arr.push(list[i].productName)
    arr.push(list[i].specification)
    arr.push(list[i].amount)
    alldata.push(arr)

    //年级
    if(uniqueMap.get('GradeName' + list[i].studentGradeName + list[i].studentClassName)){
      let startIndex = uniqueMap.get('GradeName' + list[i].studentGradeName + list[i].studentClassName).startIndex
      uniqueMap.set('GradeName' + list[i].studentGradeName + list[i].studentClassName, {'startIndex': startIndex, 'endIndex': realIndex})
    }else{
      uniqueMap.set('GradeName' + list[i].studentGradeName + list[i].studentClassName, {'startIndex': realIndex, 'endIndex': realIndex})
    }

    //班级
    if(uniqueMap.get('ClassName' + list[i].studentGradeName + list[i].studentClassName)){
      let startIndex = uniqueMap.get('ClassName' + list[i].studentGradeName + list[i].studentClassName).startIndex
      let amount = uniqueMap.get('ClassName' + list[i].studentGradeName + list[i].studentClassName).amount + list[i].amount
      uniqueMap.set('ClassName' + list[i].studentGradeName + list[i].studentClassName, {'startIndex': startIndex, 'endIndex': realIndex, 'amount': amount})
    }else{
      uniqueMap.set('ClassName' + list[i].studentGradeName + list[i].studentClassName, {'startIndex': realIndex, 'endIndex': realIndex, 'amount': list[i].amount})
    }

    //产品
    if(uniqueMap.get('ProductName' + list[i].studentGradeName + list[i].studentClassName + list[i].productId)){
      let startIndex = uniqueMap.get('ProductName' + list[i].studentGradeName + list[i].studentClassName + list[i].productId).startIndex
      uniqueMap.set('ProductName' + list[i].studentGradeName + list[i].studentClassName + list[i].productId, {'startIndex': startIndex, 'endIndex': realIndex})
    }else{
      uniqueMap.set('ProductName' + list[i].studentGradeName + list[i].studentClassName + list[i].productId, {'startIndex': realIndex, 'endIndex': realIndex})
    }
    realIndex++

    //添加班级统计数据
    if((i == list.length - 1) || (
        (list[i].studentGradeName + list[i].studentClassName) != (list[Number(i) + 1].studentGradeName + list[Number(i) + 1].studentClassName)
    )){
      let amount = uniqueMap.get('ClassName' + list[i].studentGradeName + list[i].studentClassName).amount
      let summary = [`${list[i].studentGradeName}${list[i].studentClassName}合计${amount}件`, '', '', '','']
      alldata.push(summary)
      merges.push({s: {c: 0, r: realIndex + 1}, e: {c: 4, r: realIndex + 1}})
      realIndex++
    }
  }

  // 将坐标修改成 '!merges' 字段类型，合并年级/班级/产品
  uniqueMap.forEach(function(value, key, map) {
    if(value.startIndex != value.endIndex){
      if(key.indexOf('GradeName') >= 0){//年级
        merges.push({s: {c: 0, r: value.startIndex + 1}, e: {c: 0, r: value.endIndex + 1}})
      }
      if(key.indexOf('ClassName') >= 0){//班级
        merges.push({s: {c: 1, r: value.startIndex + 1}, e: {c: 1, r: value.endIndex + 1}})
      }
      if(key.indexOf('ProductName') >= 0){//产品
        merges.push({s: {c: 2, r: value.startIndex + 1}, e: {c: 2, r: value.endIndex + 1}})
      }
    }
  });

  const sheetOptions = {
    '!cols': [ // 自定义列宽
      {wch: 10}, {wch: 10}, {wch: 50}, {wch: 20}, {wch: 10}
    ],
    '!merges': [ // 合并单元
        ...merges
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
  let alldata = []
  let row = ['订单号', '学校', '年级', '班级', '姓名', '性别', '家长电话', '下单时间', '商品名称', '购买数量', '规格', '备注', '商品总价格', '订单总价格'] //表属性
  alldata.push(row)

  let orderPrice = new Map()
  let calPrice = new Map()

  // 2. 将数据写入表中
  for (let key in newOrder) {
    let arr = []
    arr.push(newOrder[key]._id)
    arr.push(newOrder[key].schoolName)
    arr.push(newOrder[key].studentGradeName)
    arr.push(newOrder[key].studentClassName)
    arr.push(newOrder[key].studentName)
  	let studentGenderName = newOrder[key].studentGender == 1 ? '男' : '女'
    arr.push(studentGenderName)
    arr.push(newOrder[key].phoneNumber)
    arr.push(newOrder[key].createTime)
    arr.push(newOrder[key].orderProduct[0].productName)
    arr.push(newOrder[key].orderProduct[0].amount)
    arr.push(newOrder[key].orderProduct[0].specification)
    arr.push(newOrder[key].remark)
    arr.push(newOrder[key].orderProduct[0].totalPrice)
    arr.push((Number(newOrder[key].totalPrice)/100).toFixed(0))
    alldata.push(arr)

    //统计金额是否对的上
    orderPrice.set(newOrder[key]._id, newOrder[key].totalPrice)
    if(calPrice.get(newOrder[key]._id)){
      calPrice.set(newOrder[key]._id, Number(calPrice.get(newOrder[key]._id)) + Number(newOrder[key].orderProduct[0].totalPrice))
    }else{
      calPrice.set(newOrder[key]._id, newOrder[key].orderProduct[0].totalPrice)
    }

  }

   //统计金额是否对的上
  orderPrice.forEach(function(value, key, map) {
    if(calPrice.get(key) && value != calPrice.get(key)  * 100){
        console.info(key)
    }
  });


  // 3. 定制纸张规格
  const sheetOptions = {
    '!cols': [ // 自定义列宽
      {wch: 32}, {wch: 18}, {wch: 8}, {wch: 6},
      {wch: 8}, {wch: 6}, {wch: 15}, {wch: 15},
      {wch: 40}, {wch: 14},{wch: 14},{wch: 40},
      {wch: 14},{wch: 14}
    ]
  }

  return {
    alldata,
    sheetOptions
  }
}


function pathOfDate(){
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let date = today.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  return (year + "/" + month + "/" + date + "/");
}

