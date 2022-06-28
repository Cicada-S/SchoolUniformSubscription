Page({
  data: {
    chart: '/static/images/home/chart.png',
    picUrl: '/static/images/home/clothes.png',
    dataList: [
      {
        id: 1,
        title: '冬季园服新款（演示）qweq',
        picUrl: '/static/images/home/clothes1.png',
      },
      {
        id: 2,
        title: '冬季园服新款（演示）',
        picUrl: '/static/images/home/clothes1.png',
      },
      {
        id: 3,
        title: '冬季园服新款（演示）',
        picUrl: '/static/images/home/clothes1.png',
      },
      {
        id: 4,
        title: '冬季园服新款（演示）qweq',
        picUrl: '/static/images/home/clothes1.png',
      }
    ]
  },

  // 页面初始化 options为页面跳转所带来的参数
  onLoad: function (options) {

  },

  onJump: e => {
    console.log(e.target.id);

    let type = {
      product,
      code,
      school
    }
    
    wx.navigateTo({
      
    })
  }
})
