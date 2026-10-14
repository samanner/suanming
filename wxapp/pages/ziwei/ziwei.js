var app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    chart: null,
    headInfo: '',
    zw: null
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

    var zw = chart.ziwei || null;
    if (!zw) {
      wx.showToast({ title: '紫微数据缺失', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 800);
      return;
    }

    /* 计算借星 */
    var OPP = {'命宫':'迁移','迁移':'命宫','兄弟':'仆役','仆役':'兄弟','夫妻':'官禄','官禄':'夫妻','子女':'田宅','田宅':'子女','财帛':'福德','福德':'财帛','疾厄':'父母','父母':'疾厄'};
    if (zw.palaces) {
      zw.palaces.forEach(function(p) {
        if (!p.hasMajor) {
          var oppName = OPP[p.name];
          var opp = null;
          for (var i = 0; i < zw.palaces.length; i++) {
            if (zw.palaces[i].name === oppName) { opp = zw.palaces[i]; break; }
          }
          if (opp && opp.majorStars && opp.majorStars.length) {
            p.borrowText = opp.majorStars.map(function(s) { return s.name; }).join('、');
          } else {
            p.borrowText = '';
          }
        }
      });
    }

    this.setData({ chart: chart, headInfo: headInfo, zw: zw });
  },

  goIndex() { wx.navigateBack({ delta: 99 }); },
  goBazi() { wx.redirectTo({ url: '/pages/bazi/bazi' }); },
  goCross() { wx.redirectTo({ url: '/pages/cross/cross' }); },

  onShareAppMessage() {
    return {
      title: '赛博命理馆 - 八字紫微交叉排盘',
      path: '/pages/index/index'
    };
  }
});
