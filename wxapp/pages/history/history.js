var app = getApp();
var storage = require('../../utils/storage.js');

Page({
  data: {
    statusBarHeight: 20,
    cases: []
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    var cases = storage.getCases();
    this.setData({ cases: cases });
  },

  loadCase(e) {
    var idx = e.currentTarget.dataset.index;
    var cases = this.data.cases;
    if (!cases[idx]) return;
    var c = cases[idx];

    /* 恢复全局 chart */
    var chart = c.chart;
    if (!chart) {
      wx.showToast({ title: '数据缺失', icon: 'none' });
      return;
    }
    app.globalData.chart = chart;
    app.globalData.paipanInput = {
      name: c.name, gender: c.gender,
      y: c.y, m: c.m, d: c.d, h: c.h, mi: c.mi
    };

    wx.redirectTo({ url: '/pages/bazi/bazi' });
  },

  deleteCase(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '删除该命例？',
      success: function(res) {
        if (res.confirm) {
          storage.deleteCase(id);
          that.refresh();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  clearAll() {
    var that = this;
    wx.showModal({
      title: '确认清空',
      content: '将删除所有历史命例，不可恢复！',
      success: function(res) {
        if (res.confirm) {
          storage.clearCases();
          that.refresh();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  goBack() { wx.navigateBack({ delta: 99 }); },

  onShareAppMessage() {
    return {
      title: '赛博命理馆 - 八字紫微交叉排盘',
      path: '/pages/index/index'
    };
  }
});
