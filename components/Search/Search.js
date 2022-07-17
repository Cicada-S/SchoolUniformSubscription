// components/Search/Search.js
Component({
  options: {
    addGlobalClass: true
  },
  
  /**
   * 组件的属性列表
   */
  properties: {
    
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
    search(e) {
      this.triggerEvent('search', {'searchValue': e.detail.value})
    },
  }
})
