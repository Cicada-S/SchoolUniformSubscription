// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);

  let { product, ProductVideoImage, ProductSpecification } = event
  try {
    product.createTime = db.serverDate()
    product.lastModifiedTime = null
    product.status = 0
    let res = await db.collection('Product').add({
      data: product
    })

    let newArr = Object.values(ProductVideoImage).map((item, index) => {
      let Arr = []
      if(index === 0) {
        let arr = item.map(item => {
          item.type = 0
          return item
        })
        Arr.push(...arr)
      }
      if(index === 1) {
        let arr = item.map(item => {
          item.type = 1
          return item
        })
        Arr.push(...arr)
      }
      return Arr
    })
    await newArr.flat().map((item, index) => {
      item.order = index,
      item.productId = res._id 
      db.collection('ProductVideoImage').add({
        data: item
      })
    })

    await Object.values(ProductSpecification).forEach((item, index) => {
      let newItem = {...item}
      newItem.order = index
      newItem.productId = res._id
      db.collection('ProductSpecification').add({
        data: newItem
      })
    })

    return {
      code: 0,
      success: true,
    }
  }
  catch (err) {
    console.error('transaction error');
    return {
      code: 1,
      error: err,
      success: false,
    }
  }
}
