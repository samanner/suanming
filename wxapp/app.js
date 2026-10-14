App({
  globalData: {
    statusBarHeight: 20,
    navBarHeight: 44,
    chart: null
  },

  onLaunch() {
    try {
      var info = (wx.getWindowInfo && wx.getWindowInfo()) || wx.getSystemInfoSync();
      this.globalData.statusBarHeight = info.statusBarHeight || 20;
    } catch (e) {
      this.globalData.statusBarHeight = 20;
    }
  }
});
