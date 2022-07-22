// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

  // 云函数入口函数
exports.main = async(event, context) => {

  let res = await db.collection("SellQrCodeProduct").aggregate()
  .match({ sellQrCodeId: event.id })
  .lookup({
    from: "SellQrCode",
    localField: 'sellQrCodeId',
    foreignField: '_id',
    as: 'sellQrCode'
  })
  .lookup({
    from: "ProductVideoImage",
    localField: 'productId',
    foreignField: 'productId',
    as: 'productVideoImageList'
  })
  .lookup({
    from: "Product",
    localField: 'productId',
    foreignField: '_id',
    as: 'product'
  })
  .end({
    success: function (res) {
      return res;
    },
    fail(error) {
      return error;
    }
  })

  let data = {
    sellQrCode: res.list[0].sellQrCode[0],
    product: []
  }

  res.list.forEach(item => {
    let imgs = item.productVideoImageList.filter(img => {
      if(img.materialType === 0 && img.order === 0) {
        return img
      }
    })
    data.product.push({
      name: item.product[0].name,
      path: imgs[0].path
    })
  })
  
  return {
    code: 0,
    success: true,
    data
  }
}
