// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  let id = ''

  let { form, upCloudImage, Specifications } = event

  let newArr = Object.values(upCloudImage).map((item, index) => {
    let Arr = []
    if(index === 0) {
      let arr = item.map(item => {
        item.age = 18
        return item
      })
      Arr.push(...arr)
    }
    if(index === 1) {
      let arr = item.map(item => {
        item.age = 20 
        return item
      })
      Arr.push(...arr)
    }
    return Arr
  })
  let newImageList = newArr.flat().map((item, index) => {
    item.index = index,
    item.productId = id // undfined
    return item
  })

  console.log(newImageList);
  

  let data = {
    Product: {
      type: 1,
      name: form.titleValue,
      unitPrice: form.priceValue,
    },
    ProductVideoImage: newImageList,
    /* ProductAttribute: {
      productId: id,
    } */
  }
 
  try {
     await db.collection('Product').add({
      data: data.Product
    }).then(async (res) => {
      console.log(res);
      
      id = res._id

      await db.collection('ProductVideoImage').add({
        data: data.ProductVideoImage
      })
      /* await db.collection('ProductAttribute').add({
        data: data.ProductAttribute
      }) */
    })
  }
  catch (err) {
    console.log(err);
  }

}