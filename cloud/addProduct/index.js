// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  let id = ''

  let { form, upCloudImage, Specifications } = event

  let newImageList = Object.values(upCloudImage).forEach((item, index) => {
    console.log(item, index);

    let Array = []

    if(index === 0) item.map(item => {
      item.type = 0
      Array.push(item)
    })
    if(index === 1) item.map(item => {
      item.type = 1
      Array.push(item)
    })
    
    return Array
  })

  console.log("newImageList", newImageList);

  let data = {
    Product: {
      type: 1,
      name: form.titleValue,
      unitPrice: form.priceValue,
    },
    /* ProductVideoImage: {
      productId: id,
      type: first.type,
      path: first.fileID,
      order: first.index,
    },
    ProductAttribute: {
      productId: id,
    } */
  }
 
  try {
     id = { _id } = await db.collection('Product').add({
      data: data.Product
    }).then(async (res) => {
      console.log(res);

      /* await db.collection('ProductVideoImage').add({
        data: data.ProductVideoImage
      })
      await db.collection('ProductAttribute').add({
        data: data.ProductAttribute
      }) */
    })
  }
  catch (err) {
    console.log(err);
  }

}