var app = getApp();
var engine = require('../../utils/engine.js');
var storage = require('../../utils/storage.js');

Page({
  data: {
    statusBarHeight: 20,
    name: '',
    genderOptions: ['男', '女'],
    genderIndex: 0,
    dateValue: '1995-08-16',
    hasTime: true,
    timeValue: '14:30',
    errMsg: ''
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    });
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ genderIndex: Number(e.detail.value) });
  },

  onDateChange(e) {
    this.setData({ dateValue: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ timeValue: e.detail.value });
  },

  onTimeToggle(e) {
    this.setData({ hasTime: e.detail.value });
  },

  onPaipan() {
    var dateV = this.data.dateValue;
    if (!dateV) {
      this.setData({ errMsg: '请先选择出生日期' });
      return;
    }
    var parts = dateV.split('-');
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);

    var h = null, mi = 0;
    if (this.data.hasTime && this.data.timeValue) {
      var tp = this.data.timeValue.split(':');
      h = Number(tp[0]);
      mi = Number(tp[1]);
    }

    this.setData({ errMsg: '' });

    wx.showLoading({ title: '排盘中…', mask: true });
    try {
      var chart = engine.paipan({
        name: this.data.name.trim(),
        gender: this.data.genderOptions[this.data.genderIndex],
        y: y, m: m, d: d, h: h, mi: mi
      });

      /* 保存到全局 & 存储 */
      app.globalData.chart = chart;
      storage.saveCase(chart);

      wx.hideLoading();
      wx.navigateTo({ url: '/pages/bazi/bazi' });
    } catch (e) {
      wx.hideLoading();
      console.error('排盘失败', e);
      this.setData({ errMsg: '排盘失败：' + (e.message || e) });
    }
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  onShareAppMessage() {
    return {
      title: '赛博命理馆 - 八字紫微交叉排盘',
      path: '/pages/index/index'
    };
  }
});
