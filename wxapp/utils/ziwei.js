/* ============================================================
   ziwei.js — 紫微斗数排盘
   使用 iztro 开源紫微引擎
   ============================================================ */
var iztro = require('../lib/iztro.min.js');

var MUTAGEN_CLASS = { '禄': 'm1', '权': 'm2', '科': 'm3', '忌': 'm4' };

/**
 * 计算紫微命盘
 * @param {number} y  阳历年份
 * @param {number} m  阳历月份
 * @param {number} d  阳历日
 * @param {number} h  小时（必须）
 * @param {number} mi 分钟
 * @param {string} gender '男' | '女'
 * @returns {object} 纯 JSON 紫微数据
 */
function calcZiwei(y, m, d, h, mi, gender) {
  /* 时辰索引：0早子 1丑 2寅 ... 11亥 12晚子 */
  var ti;
  if (h === 23) ti = 0;
  else if (h === 0) ti = 12;
  else ti = Math.floor((h + 1) / 2);

  var dateStr = y + '-' + m + '-' + d;
  var chart = iztro.astro.bySolar(dateStr, ti, gender, true);

  var palaces = chart.palaces;
  var order = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

  var mingPalace = null;
  var shenPalace = null;
  for (var i = 0; i < palaces.length; i++) {
    if (palaces[i].name === '命宫') mingPalace = palaces[i];
    if (palaces[i].isBodyPalace) shenPalace = palaces[i];
  }

  /* 按固定顺序排列十二宫 */
  var sorted = [];
  for (var j = 0; j < order.length; j++) {
    var found = null;
    for (var k = 0; k < palaces.length; k++) {
      if (palaces[k].name === order[j]) { found = palaces[k]; break; }
    }
    if (!found) continue;

    var majorStars = (found.majorStars || []).map(function (s) {
      return {
        name: s.name,
        brightness: s.brightness || '',
        mutagen: s.mutagen || '',
        mutagenClass: s.mutagen ? MUTAGEN_CLASS[s.mutagen] || '' : ''
      };
    });

    var minorNames = (found.minorStars || []).map(function (s) { return s.name; });
    var adj = found.adjectiveStars || {};
    var auxNames = [];
    (adj.adjuvantStars || []).forEach(function (s) { auxNames.push(s.name || s); });
    (adj.beneficialStars || []).forEach(function (s) { auxNames.push(s.name || s); });
    var badNames = (adj.maleficStars || []).map(function (s) { return s.name || s; });

    sorted.push({
      name: found.name,
      ganzhi: (found.heavenlyStem || '') + (found.earthlyBranch || ''),
      isMing: found.name === '命宫',
      isBody: !!found.isBodyPalace,
      changsheng12: found.changsheng12 || '',
      majorStars: majorStars,
      hasMajor: majorStars.length > 0,
      minorText: minorNames.join(' '),
      auxText: auxNames.join(' '),
      badText: badNames.join(' ')
    });
  }

  return {
    fiveElementsClass: chart.fiveElementsClass || '—',
    mingGanzhi: mingPalace ? (mingPalace.heavenlyStem || '') + (mingPalace.earthlyBranch || '') : '—',
    shenBranch: shenPalace ? shenPalace.earthlyBranch : '—',
    sign: chart.sign || '',
    palaces: sorted,
    _raw: chart
  };
}

module.exports = {
  calcZiwei: calcZiwei
};
