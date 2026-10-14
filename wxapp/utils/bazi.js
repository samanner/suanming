/* ============================================================
   bazi.js — 八字排盘计算
   使用 lunar.js（lunar-javascript）开源历法引擎
   ============================================================ */
var lunarLib = require('../lib/lunar.js');
var Solar = lunarLib.Solar;

var GAN_WX = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
var ZHI_WX = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
var SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };  // 我生
var KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };     // 我克
var WX_ORDER = ['木', '火', '土', '金', '水'];
var WX_COLORS = { 木: '#6a9955', 火: '#d9534f', 土: '#c8a165', 金: '#c0c0c8', 水: '#4a86b0' };

function pad2(n) { return (n < 10 ? '0' : '') + n; }

/**
 * 计算八字命盘
 * @param {number} y  阳历年份
 * @param {number} m  阳历月份
 * @param {number} d  阳历日
 * @param {number|null} h  小时（null=时辰不详）
 * @param {number} mi 分钟
 * @param {string} gender  '男' | '女'
 * @returns {object} 纯 JSON 八字数据
 */
function calcBazi(y, m, d, h, mi, gender) {
  var hasTime = h !== null && h !== undefined;
  var hour = hasTime ? h : 12;

  var solar = Solar.fromYmdHms(y, m, d, hour, mi || 0, 0);
  var lunar = solar.getLunar();
  var ec = lunar.getEightChar();

  /* ---- 四柱 ---- */
  var pillars = [
    mkPillar('年柱', ec.getYear(), ec.getYearGan(), ec.getYearZhi(),
      ec.getYearShiShenGan(), ec.getYearShiShenZhi(), ec.getYearHideGan(), ec.getYearNaYin()),
    mkPillar('月柱', ec.getMonth(), ec.getMonthGan(), ec.getMonthZhi(),
      ec.getMonthShiShenGan(), ec.getMonthShiShenZhi(), ec.getMonthHideGan(), ec.getMonthNaYin()),
    mkPillar('日柱', ec.getDay(), ec.getDayGan(), ec.getDayZhi(),
      '日主', ec.getDayShiShenZhi(), ec.getDayHideGan(), ec.getDayNaYin())
  ];
  if (hasTime) {
    pillars.push(mkPillar('时柱', ec.getTime(), ec.getTimeGan(), ec.getTimeZhi(),
      ec.getTimeShiShenGan(), ec.getTimeShiShenZhi(), ec.getTimeHideGan(), ec.getTimeNaYin()));
  }

  /* ---- 五行统计 ---- */
  var counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach(function (p) {
    counts[GAN_WX[p.gan]]++;
    counts[ZHI_WX[p.zhi]]++;
  });
  var total = pillars.length * 2;

  var wxBar = WX_ORDER.map(function (w) {
    return { name: w, count: counts[w], pct: Math.round(counts[w] / total * 100), color: WX_COLORS[w] };
  });

  /* ---- 旺衰判定 ---- */
  var dmGan = ec.getDayGan();
  var dmEl = GAN_WX[dmGan];
  var dmSheng = SHENG[dmEl];
  var dmKe = KE[dmEl];
  var support = 0;
  pillars.forEach(function (p) {
    [GAN_WX[p.gan], ZHI_WX[p.zhi]].forEach(function (wx) {
      if (wx === dmEl || SHENG[wx] === dmEl) support++;
    });
  });
  var pct = Math.round(support / total * 100);
  var state, stateType, xiyong;
  if (pct >= 63) { state = '偏旺'; stateType = 'strong'; }
  else if (pct >= 50) { state = '中和偏旺'; stateType = 'strong'; }
  else if (pct >= 38) { state = '中和'; stateType = 'balance'; }
  else { state = '偏弱'; stateType = 'weak'; }

  if (pct >= 50) {
    xiyong = '宜泄耗：喜「' + dmSheng + '」（食伤泄秀）、「' + dmKe + '」（财星破印），忌再逢生扶';
  } else {
    xiyong = '宜生扶：喜「' + dmEl + '」（比劫帮身）、喜生我之印绶，忌「' + dmKe + '」（财耗）与官杀重压';
  }

  var dayMaster = {
    gan: dmGan,
    element: dmEl,
    monthZhi: lunar.getMonthZhi ? lunar.getMonthZhi() : ec.getMonthZhi(),
    supportPct: pct,
    state: state,
    stateType: stateType,
    xiyong: xiyong
  };

  /* ---- 大运 ---- */
  var dayun = [];
  var dayunNote = '';
  try {
    var yun = ec.getYun(gender === '男' ? 1 : 0);
    var dys = yun.getDaYun(10).slice(0, 9);
    dys.forEach(function (dy) {
      dayun.push({
        ganZhi: dy.getGanZhi() || '—',
        years: dy.getStartYear() + '–' + dy.getEndYear(),
        ages: dy.getStartAge() + '–' + dy.getEndAge()
      });
    });
    dayunNote = yun.getStartYear() + '年' + yun.getStartMonth() + '月' + yun.getStartDay() + '天后起运（阳男阴女顺排，阴男阳女逆排）';
  } catch (e) {
    dayunNote = '大运排取失败';
  }

  /* ---- 干支文本 ---- */
  var timeStr = hasTime ? pad2(hour) + ':' + pad2(mi || 0) : '';

  return {
    solarYmd: solar.toYmd(),
    timeStr: timeStr,
    hasTime: hasTime,
    lunarText: lunar.getYearInChinese() + '年' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    shengxiao: lunar.getYearShengXiao(),
    yearGZ: ec.getYear(),
    monthGZ: ec.getMonth(),
    dayGZ: ec.getDay(),
    timeGZ: hasTime ? ec.getTime() : '',
    pillars: pillars,
    wxCounts: counts,
    wxTotal: total,
    wxBar: wxBar,
    dayMaster: dayMaster,
    dayun: dayun,
    dayunNote: dayunNote,
    /* 供合参使用的原始接口 */
    _ec: ec,
    _lunar: lunar,
    _solar: solar
  };
}

function mkPillar(label, gz, gan, zhi, sg, sz, hg, ny) {
  var hide = [];
  for (var i = 0; i < hg.length; i++) {
    hide.push({ gan: hg[i], ss: sz[i] || '' });
  }
  return { label: label, gz: gz, gan: gan, zhi: zhi, sg: sg, sz: sz, hide: hide, ny: ny };
}

module.exports = {
  calcBazi: calcBazi,
  GAN_WX: GAN_WX,
  ZHI_WX: ZHI_WX,
  SHENG: SHENG,
  KE: KE
};
