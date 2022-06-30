// app.js
App({
  globalData: {
    stateheight: 0, //手机状态栏高度
    navhegiht: 0, //导航栏高度
    customheight: 0, //自定以导航栏高度
    bottomLift: 0, //底部距离
  },

  onLaunch() {
    wx.cloud.init({
      env: 'school-shop-2gg4adfl2d11e6fb',
      traceUser: true
    })

    // 获取手机状态栏信息和高度
    const phoneinfo = wx.getSystemInfoSync()
    const stateheight = phoneinfo.statusBarHeight
    // 获取胶囊按钮的信息
    const button = wx.getMenuButtonBoundingClientRect()
    // 获取导航栏高度
    const navhegiht = button.height + (button.top - stateheight) * 2
    // 计算自定义导航栏高度
    const customheight = navhegiht + stateheight
    // 赋值
    this.globalData.stateheight = stateheight //给对象globalData里面的变量stateheight赋值
    this.globalData.navhegiht = navhegiht //给对象globalData里面的变量navhegiht赋值
    this.globalData.customheight = customheight //给对象globalData里面的变量customheight赋值

    //获取当前设备信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.bottomLift = res.screenHeight - res.safeArea.bottom;
      },
      fail(err) {
        console.log(err);
      }
    })
  }
})
