// app.js
App({
  globalData: {
    stateheight: 0, // 手机状态栏高度
    navhegiht: 0, // 导航栏高度
    customheight: 0, // 自定以导航栏高度
    bottomLift: 0, // 底部距离
  },

  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-9ghc7y1j0db0f20d',
      traceUser: true
    })

    this.getOpenId()
    this.getPhoneHeight()
    this.getSystemInfo()
  },

  getOpenId() {
    // 获取openId
    wx.login({
      success(res) {
        console.log('login res', res);
        if (res.code) {
          wx.cloud.callFunction({
            name: 'logins',
            data: { code: res.code },
          }).then(res => {
            console.log('res', res)
            wx.setStorageSync('openid', res.result.openid)
          }).catch(err => {
            console.log('err', err)
          })
        }
      },
      fail(err) {
        console.log('callFunction err', err)
      }
    })
  },

  getPhoneHeight() {
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
    this.globalData.stateheight = stateheight 
    this.globalData.navhegiht = navhegiht 
    this.globalData.customheight = customheight
  },

  getSystemInfo() {
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
