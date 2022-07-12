// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let {id, product, ProductVideoImage, ProductSpecification} = event
  
  try{
    // 删除对于的规格和图片
    this.removeSpeciImage('ProductVideoImage')
    this.removeSpeciImage('ProductSpecification')

    // 修改name和price
    await db.collection('Product').doc(id).update({
      data: {
        name: product.name,
        unitPrice: product.unitPrice
      }
    })

    // 添加图片
    Object.values(ProductVideoImage).forEach(item => {
      let newItem = {...item}
      newItem.productId = id
      db.collection('ProductVideoImage').add({
          data: newItem
      })
    })
    // 添加规格
    Object.values(ProductSpecification).forEach((item, index) => {
      let newItem = {...item}
      newItem.order = index
      newItem.productId = id
      db.collection('ProductSpecification').add({
        data: newItem
      })
    })

    return {
      code: 0,
      success: true
    }
  }
  catch(err) {
    console.error('transaction error')
    return {
      code: 1,
      success: false
    }
  }

  
}

async function removeSpeciImage(surfaceName) {
  return await db.collection(surfaceName).where({
    productId: id
  }).remove()
} 