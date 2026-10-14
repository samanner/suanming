var app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    chart: null,
    headInfo: '',
    lunarInfo: '',
    pillars: [],
    wxBar: [],
    wxTotal: 0,
    dayMaster: null,
    dayun: [],
    dayunNote: ''
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight });
    var chart = app.globalData.chart;
    if (!chart) {
      wx.showToast({ title: '请先起盘', icon: 'none' });
      setTimeout(function () { wx.navigateBack({ delta: 99 }); }, 800);
      return;
    }
    this.renderChart(chart);
  },

  renderChart(chart) {
    var b = chart.bazi;
    var gender = chart.gender === '男' ? '乾造' : '坤造';
    var name = chart.name ? chart.name + ' · ' : '';
    var headInfo = name + gender + '　|　阳历 ' + b.solarYmd + (b.hasTime ? ' ' + b.timeStr : '');
    var lunarInfo = '农历 ' + b.lunarText + '（' + b.shengxiao + '年 · ' + b.monthGZ + '月' + (b.hasTime ? ' · ' + b.timeGZ + '时' : '') + '）';

    this.setData({
      chart: chart,
      headInfo: headInfo,
      lunarInfo: lunarInfo,
      pillars: b.pillars,
      wxBar: b.wxBar,
      wxTotal: b.wxTotal,
      dayMaster: b.dayMaster,
      dayun: b.dayun,
      dayunNote: b.dayunNote
    });
  },

  goBazi() { /* 当前页 */ },
  goZiwei() {
    wx.redirectTo({ url: '/pages/ziwei/ziwei' });
  },
  goCross() {
    wx.redirectTo({ url: '/pages/cross/cross' });
  },

  onShareAppMessage() {
    return {
      title: '赛博命理馆 - 八字紫微交叉排盘',
      path: '/pages/index/index'
    };
  }
});
