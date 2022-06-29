// components/nav/nav.js
Component({
  properties: {
    title: {
      type: String,
      value: ''	
    },
    showBol: {
      type: Boolean,
      value: true
    },
    textColor: {
      type: String,
      value: '#000000'
    },
    backgroundColor: {
      type: String,
      value: '#ffffff'
    }
  },

  data: {
    barHeight: wx.getSystemInfoSync().statusBarHeight
  },

  /* 组件的方法列表 */
  methods: {
    goBack: () => {  // 返回事件
      wx.navigateBack({
        delta: 1,
      })
    }
  }
})
