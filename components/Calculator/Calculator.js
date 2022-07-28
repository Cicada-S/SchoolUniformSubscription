// components/Calculator/Calculator.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    operation: {
      type: Number,
      value: 1
    },
    index: {
      type: Number,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    reduce(event) {
      this.triggerEvent('reduce', {
        index: event.currentTarget.id
      })
    },

    increase(event) {
      this.triggerEvent('increase', {
        index: event.currentTarget.id
      })
    }
  }
})
