var app = getApp();

var DAY_MASTER_TXT = {
  甲: '甲木参天，直性向上，有担当善领导，吃软不吃硬',
  乙: '乙木柔藤，屈伸善变，外柔内韧，善借势而上',
  丙: '丙火太阳，热情外放，光明磊落，急脾气',
  丁: '丁火灯烛，内敛温润，心思缜密，善谋而后动',
  戊: '戊土高山，厚重守信，固执踏实，稳字当头',
  己: '己土田园，包容细腻，审时度势，能屈能伸',
  庚: '庚金刀剑，果断刚烈，讲义气，宁折不弯',
  辛: '辛金珠玉，外冷内热，重品质，好胜心强',
  壬: '壬水江河，智慧奔流，善交际，无拘无束',
  癸: '癸水雨露，细腻敏感，润物无声，想象力强'
};
var SHI_SHEN_TXT = {
  正官: '守规矩、重名誉、自律，适合组织内发展',
  七杀: '有魄力、敢冒险、压力大成就也大',
  正印: '爱学习、有靠山、心地仁厚',
  偏印: '思维偏门、创意强、易孤芳自赏',
  正财: '务实节俭、重承诺、财来财去靠积累',
  偏财: '善抓机会、人脉生财、出手大方',
  食神: '有口福、有才华、性情温和',
  伤官: '聪明傲物、表达欲强、不服管',
  比肩: '独立自助、朋友多、容易固执',
  劫财: '行动力强、敢抢机会、破财也痛快'
};
var ZW_STAR_TXT = {
  紫微: '尊贵自律、领导欲强、好面子', 天机: '多智善变、思维活跃、易神经质',
  太阳: '热情博爱、爱表现、劳碌命',   武曲: '刚毅果断、重实际、财星入命',
  天同: '温和乐天、怕冲突、福气自来', 廉贞: '傲气多情、有政治手腕、次桃花',
  天府: '稳重保守、善理财、衣食丰足', 太阴: '细腻敏感、爱美重情、主富',
  贪狼: '多才多艺、欲望强烈、大桃花', 巨门: '口才犀利、善分析、易招是非',
  天相: '辅佐之星、重仪表、和事佬',   天梁: '清高荫人、好为人师、逢凶化吉',
  七杀: '孤勇刚决、大起大落、开创型', 破军: '破旧立新、冲动耗损、先破后成',
  文昌: '文才出众、考试运好',        文曲: '艺术才情、情感丰富',
  左辅: '稳重辅助、得人助力',        右弼: '圆融辅助、桃花助力',
  天魁: '贵人星、长辈提携',          天钺: '贵人星、异性贵人'
};
var GAN_WX = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};

Page({
  data: {
    statusBarHeight: 20,
    chart: null,
    headInfo: '',
    cross: {},
    aiPrompt: ''
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight });
    var chart = app.globalData.chart;
    if (!chart) {
      wx.showToast({ title: '请先起盘', icon: 'none' });
      setTimeout(function () { wx.navigateBack({ delta: 99 }); }, 800);
      return;
    }
    this.renderCross(chart);
  },

  renderCross(chart) {
    var b = chart.bazi;
    var zw = chart.ziwei || null;
    var gender = chart.gender === '男' ? '乾造' : '坤造';
    var name = chart.name ? chart.name + ' · ' : '';
    var headInfo = name + gender + '　|　阳历 ' + b.solarYmd + (b.hasTime ? ' ' + b.timeStr : '');

    var cross = {};
    var dm = b.dayMaster || {};

    /* 性格 */
    cross.dayMaster = {
      gan: dm.gan || '',
      element: dm.element || '',
      desc: DAY_MASTER_TXT[dm.gan] || ''
    };

    /* 紫微命宫 */
    if (zw && zw.palaces) {
      var ming = this.findPalace(zw.palaces, '命宫');
      var fu = this.findPalace(zw.palaces, '福德');
      if (ming && ming.majorStars && ming.majorStars.length) {
        cross.mingMajor = ming.majorStars[0].name;
        cross.mingMajorDesc = ZW_STAR_TXT[cross.mingMajor] || '';
      }
      if (fu && fu.majorStars && fu.majorStars.length) {
        cross.fuMajor = fu.majorStars[0].name;
        cross.fuMajorDesc = ZW_STAR_TXT[cross.fuMajor] || '';
      }
      /* 五行校验 */
      cross.zwElement = (zw.fiveElementsClass || '')[0] || '';
      cross.elementCheck = !!cross.zwElement;
      cross.elementAgree = cross.zwElement === cross.dayMaster.element;
      /* 官禄财帛 */
      var gl = this.findPalace(zw.palaces, '官禄');
      var cb = this.findPalace(zw.palaces, '财帛');
      if (gl) cross.guanlu = this.palaceBrief(gl);
      if (cb) cross.caibo = this.palaceBrief(cb);
      var fq = this.findPalace(zw.palaces, '夫妻');
      if (fq) cross.fuqi = this.palaceBrief(fq);
    }

    /* 十神倾向 */
    var ssArr = b.pillars ? b.pillars.filter(function(p){ return p.sg && p.sg !== '日主'; }).map(function(p){ return p.sg; }) : [];
    var freq = {};
    ssArr.forEach(function(s){ freq[s] = (freq[s]||0)+1; });
    var topSS = Object.keys(freq).sort(function(a,b){ return freq[b]-freq[a]; }).slice(0,2);
    cross.shishenText = topSS.map(function(s){ return '【'+s+'】'+(SHI_SHEN_TXT[s]||''); }).join('；');

    /* 日支 */
    cross.dayZhi = b.dayZhi || '';
    cross.hideGan = b.hideGan ? b.hideGan.join('/') : '';

    /* 十神组合 */
    cross.combos = this.getCombos(ssArr);

    /* AI Prompt */
    var aiPrompt = this.buildAiPrompt(chart);

    this.setData({ chart: chart, headInfo: headInfo, cross: cross, aiPrompt: aiPrompt });
  },

  findPalace(palaces, name) {
    for (var i = 0; i < palaces.length; i++) {
      if (palaces[i].name === name) return palaces[i];
    }
    return null;
  },

  palaceBrief(p) {
    var majors = (p.majorStars || []).map(function(s){ return s.name + (s.mutagen ? '(' + s.mutagen + ')' : ''); }).join('、');
    if (!majors) majors = '无主星（借对宫）';
    var minors = p.minorText || '';
    var firstMajor = (p.majorStars || [])[0];
    var txt = firstMajor ? (ZW_STAR_TXT[firstMajor.name] || '') : '对宫借星为准';
    return majors + (minors ? '，辅 ' + minors : '') + ' —— ' + txt;
  },

  getCombos(ssArr) {
    var has = function(s) { return ssArr.indexOf(s) >= 0; };
    var combos = [];
    if (has('食神') && has('七杀')) combos.push({name:'食神制杀', desc:'以才华制约压力，将挑战化为动力'});
    if (has('伤官') && has('正官')) combos.push({name:'伤官见官', desc:'聪明反被聪明误，易与上级冲突，适合独立创业'});
    if (has('正印') && has('偏财')) combos.push({name:'印绶护财', desc:'以学识名气得财，适合专业顾问'});
    if (has('正财') && has('正印')) combos.push({name:'财印双全', desc:'既有财富又有学识，富贵双全'});
    if (has('伤官') && has('偏财')) combos.push({name:'伤官生财', desc:'以创意技艺得财，适合艺术自由职业'});
    if (has('正官') && has('正印')) combos.push({name:'官印相生', desc:'名利双收，仕途坦荡'});
    return combos;
  },

  buildAiPrompt(chart) {
    var b = chart.bazi;
    var zw = chart.ziwei;
    var L = [];
    L.push('你是一位精通八字、紫微斗数两术的专业命理师。请基于以下【真实排盘数据】进行深度解读，要求：两术互参、交叉验证；指出一致处与矛盾处；分性格/事业/财运/感情/健康五部分；最后给三条可执行建议。语气专业通俗，总字数1500字左右。');
    L.push('');
    L.push('【求测人】' + (chart.name || '未署名') + '（' + (chart.gender === '男' ? '乾造' : '坤造') + '）');
    L.push('【阳历】' + b.solarYmd + (b.hasTime ? ' ' + b.timeStr : ' 时辰不详'));
    L.push('【农历】' + (b.lunarText || ''));
    L.push('');
    L.push('【八字四柱】');
    if (b.pillars) {
      b.pillars.forEach(function(p) {
        L.push(p.label + '：' + p.gz + '（' + p.sg + ' / ' + (p.hide || []).map(function(h){ return h.gan + (h.ss ? '(' + h.ss + ')' : ''); }).join(' ') + '）');
      });
    }
    if (b.dayun && b.dayun.length) {
      L.push('【大运】' + b.dayun.slice(0,6).map(function(d){ return d.ganZhi + '(' + d.years + ')'; }).join(' → '));
    }
    if (zw && zw.palaces) {
      L.push('');
      L.push('【紫微斗数】五行局：' + zw.fiveElementsClass + '，命宫：' + zw.mingGanzhi + '，身宫：' + zw.shenBranch);
      zw.palaces.forEach(function(p) {
        var majors = (p.majorStars || []).map(function(s){ return s.name + (s.brightness ? '[' + s.brightness + ']' : '') + (s.mutagen ? '{化' + s.mutagen + '}' : ''); }).join('、') || '—';
        L.push('· ' + p.name + '宫（' + p.ganzhi + '）：主星 ' + majors + (p.minorText ? '；辅星 ' + p.minorText : ''));
      });
    }
    L.push('');
    L.push('（免责：解读仅供娱乐参考）');
    return L.join('\n');
  },

  copyPrompt() {
    var that = this;
    wx.setClipboardData({
      data: this.data.aiPrompt,
      success: function() {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  goIndex() { wx.navigateBack({ delta: 99 }); },
  goBazi() { wx.redirectTo({ url: '/pages/bazi/bazi' }); },
  goZiwei() { wx.redirectTo({ url: '/pages/ziwei/ziwei' }); },

  onShareAppMessage() {
    return {
      title: '赛博命理馆 - 八字紫微交叉排盘',
      path: '/pages/index/index'
    };
  }
});
