/* ============================================================
   engine.js — 排盘引擎总封装
   整合八字 + 紫微 + 三术合参 + AI指令生成
   ============================================================ */
var baziLib = require('./bazi.js');
var ziweiLib = require('./ziwei.js');

/* ---- 文案库 ---- */
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
  紫微: '尊贵自律、领导欲强、好面子',
  天机: '多智善变、思维活跃、易神经质',
  太阳: '热情博爱、爱表现、劳碌命',
  武曲: '刚毅果断、重实际、财星入命',
  天同: '温和乐天、怕冲突、福气自来',
  廉贞: '傲气多情、有政治手腕、次桃花',
  天府: '稳重保守、善理财、衣食丰足',
  太阴: '细腻敏感、爱美重情、主富',
  贪狼: '多才多艺、欲望强烈、大桃花',
  巨门: '口才犀利、善分析、易招是非',
  天相: '辅佐之星、重仪表、和事佬',
  天梁: '清高荫人、好为人师、逢凶化吉',
  七杀: '孤勇刚决、大起大落、开创型',
  破军: '破旧立新、冲动耗损、先破后成',
  文昌: '文才出众、考试运好',
  文曲: '艺术才情、情感丰富',
  左辅: '稳重辅助、得人助力',
  右弼: '圆融辅助、桃花助力',
  天魁: '贵人星、长辈提携',
  天钺: '贵人星、异性贵人'
};

/* ============================================================
   起盘主入口
   input: { name, gender, y, m, d, h, mi }
   返回完整纯 JSON 命盘对象
   ============================================================ */
function paipan(input) {
  var name = input.name || '';
  var gender = input.gender || '男';
  var y = input.y, m = input.m, d = input.d;
  var h = (input.h === undefined) ? null : input.h;
  var mi = input.mi || 0;
  var hasTime = h !== null;

  /* 八字 */
  var baziData = baziLib.calcBazi(y, m, d, h, mi, gender);

  /* 紫微（需精确时辰） */
  var ziweiData = null;
  if (hasTime) {
    try {
      ziweiData = ziweiLib.calcZiwei(y, m, d, h, mi, gender);
    } catch (e) {
      console.error('紫微排盘失败', e);
      ziweiData = null;
    }
  }

  /* 三术合参 */
  var cross = buildCross(baziData, ziweiData);

  /* AI 指令 */
  var aiPrompt = buildAiPrompt(name, gender, baziData, ziweiData, h, mi);

  /* 序列化前剥离引擎内部对象 */
  var chart = {
    name: name,
    gender: gender,
    y: y, m: m, d: d, h: h, mi: mi,
    hasTime: hasTime,
    solarYmd: baziData.solarYmd,
    timeStr: baziData.timeStr,
    lunarText: baziData.lunarText,
    shengxiao: baziData.shengxiao,
    bazi: stripInternal(baziData),
    ziwei: ziweiData ? stripInternal(ziweiData) : null,
    cross: cross,
    aiPrompt: aiPrompt
  };
  return chart;
}

/* 剥离 _ 前缀的内部对象引用（不可序列化） */
function stripInternal(obj) {
  var result = {};
  for (var key in obj) {
    if (key.charAt(0) === '_') continue;
    result[key] = obj[key];
  }
  return result;
}

/* ============================================================
   三术合参
   ============================================================ */
function buildCross(baziData, ziweiData) {
  var ec = baziData._ec;
  var dm = ec.getDayGan();
  var dmEl = baziLib.GAN_WX[dm];
  var SHENG = baziLib.SHENG;
  var KE = baziLib.KE;

  var mingMajor = '', fuMajor = '', zwEl = '';
  if (ziweiData && ziweiData._raw) {
    var palaces = ziweiData._raw.palaces;
    var ming = null, fu = null;
    for (var i = 0; i < palaces.length; i++) {
      if (palaces[i].name === '命宫') ming = palaces[i];
      if (palaces[i].name === '福德') fu = palaces[i];
    }
    if (ming && ming.majorStars && ming.majorStars.length) mingMajor = ming.majorStars[0].name;
    if (fu && fu.majorStars && fu.majorStars.length) fuMajor = fu.majorStars[0].name;
    if (ziweiData.fiveElementsClass) zwEl = ziweiData.fiveElementsClass.charAt(0);
  }

  /* 五行校验 */
  var wuxingCheck = null;
  if (zwEl) {
    var agree;
    if (dmEl === zwEl) agree = true;
    else if (SHENG[zwEl] === dmEl) agree = true;
    else if (KE[zwEl] === dmEl || KE[dmEl] === zwEl) agree = false;
    else agree = true;
    wuxingCheck = {
      dmEl: dmEl,
      zwEl: zwEl,
      agree: agree,
      text: agree
        ? '▲ 两术同气，性格判断互为印证，可信度较高'
        : '▼ 两术五行有异，性格存在内在张力（外显与内核可能不一致，需结合具体经历取舍）'
    };
  }

  /* 十神聚合 */
  var shenSet = [ec.getYearShiShenGan(), ec.getMonthShiShenGan()];
  if (baziData.hasTime) shenSet.push(ec.getTimeShiShenGan());
  var freq = {};
  shenSet.forEach(function (s) {
    if (s && s !== '日主') freq[s] = (freq[s] || 0) + 1;
  });
  var topSS = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 2);

  return {
    dayMaster: { gan: dm, element: dmEl, text: DAY_MASTER_TXT[dm] || '' },
    mingStar: { name: mingMajor, text: mingMajor ? (ZW_STAR_TXT[mingMajor] || '主星特质需参考全盘') : '' },
    fuStar: { name: fuMajor, text: fuMajor ? (ZW_STAR_TXT[fuMajor] || '') : '' },
    wuxingCheck: wuxingCheck,
    topShiShen: topSS.map(function (s) { return { name: s, text: SHI_SHEN_TXT[s] || '' }; }),
    dayZhi: ec.getDayZhi(),
    dayHideGan: ec.getDayHideGan().join('/'),
    guanlu: ziweiData ? palaceBrief(ziweiData._raw, '官禄') : '',
    caibo: ziweiData ? palaceBrief(ziweiData._raw, '财帛') : '',
    fuqi: ziweiData ? palaceBrief(ziweiData._raw, '夫妻') : ''
  };
}

function palaceBrief(zwRaw, name) {
  var p = null;
  for (var i = 0; i < zwRaw.palaces.length; i++) {
    if (zwRaw.palaces[i].name === name) { p = zwRaw.palaces[i]; break; }
  }
  if (!p) return '—';
  var majors = (p.majorStars || []).map(function (s) {
    return s.name + (s.mutagen ? '(' + s.mutagen + ')' : '');
  }).join('、') || '无主星（借对宫）';
  var minors = (p.minorStars || []).map(function (s) { return s.name; }).join('、');
  var firstMajor = (p.majorStars || [])[0];
  var txt = firstMajor ? (ZW_STAR_TXT[firstMajor.name] || '') : '对宫借星为准';
  return majors + (minors ? '，辅 ' + minors : '') + ' —— ' + txt;
}

/* ============================================================
   AI 解读指令生成
   ============================================================ */
function buildAiPrompt(name, gender, baziData, ziweiData, h, mi) {
  var ec = baziData._ec;
  var lunar = baziData._lunar;
  var solar = baziData._solar;
  var hasTime = baziData.hasTime;
  var L = [];

  L.push('你是一位精通八字、紫微斗数两术的专业命理师。请基于以下【真实排盘数据】（已由开源历法引擎计算，请勿重新排盘）进行深度解读，要求：两术互参、交叉验证；指出一致处与矛盾处；分性格/事业/财运/感情/健康五部分；最后给三条可执行建议。语气专业通俗，总字数1500字左右。');
  L.push('');
  L.push('【求测人】' + (name || '未署名') + '（' + (gender === '男' ? '乾造' : '坤造') + '）');
  L.push('【阳历】' + solar.toYmd() + ' ' + (hasTime ? baziData.timeStr : '时辰不详'));
  L.push('【农历】' + lunar.getYearInChinese() + '年' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese());
  L.push('');
  L.push('【八字四柱】');
  L.push('年柱：' + ec.getYear() + '（' + ec.getYearShiShenGan() + ' / 支藏十神 ' + ec.getYearShiShenZhi().join('、') + ' / 纳音 ' + ec.getYearNaYin() + '）');
  L.push('月柱：' + ec.getMonth() + '（' + ec.getMonthShiShenGan() + ' / ' + ec.getMonthShiShenZhi().join('、') + ' / ' + ec.getMonthNaYin() + '）');
  L.push('日柱：' + ec.getDay() + '（日主' + ec.getDayGan() + '，支藏 ' + ec.getDayHideGan().join('/') + '）');
  if (hasTime) {
    L.push('时柱：' + ec.getTime() + '（' + ec.getTimeShiShenGan() + ' / ' + ec.getTimeShiShenZhi().join('、') + ' / ' + ec.getTimeNaYin() + '）');
  }
  try {
    var yun = ec.getYun(gender === '男' ? 1 : 0);
    var dys = yun.getDaYun(6).slice(0, 6);
    L.push('【大运】' + dys.map(function (dy) {
      return dy.getGanZhi() + '(' + dy.getStartYear() + '-' + dy.getEndYear() + ')';
    }).join(' → '));
  } catch (e) { }
  if (ziweiData && ziweiData._raw) {
    var zw = ziweiData._raw;
    L.push('');
    L.push('【紫微斗数】五行局：' + zw.fiveElementsClass + '，命宫：' + zw.earthlyBranchOfSoulPalace + '，身宫：' + zw.earthlyBranchOfBodyPalace);
    zw.palaces.forEach(function (p) {
      var majors = (p.majorStars || []).map(function (s) {
        return s.name + (s.brightness ? '[' + s.brightness + ']' : '') + (s.mutagen ? '{化' + s.mutagen + '}' : '');
      }).join('、') || '—';
      var minors = (p.minorStars || []).map(function (s) { return s.name; }).join('、');
      L.push('· ' + p.name + '宫（' + (p.heavenlyStem || '') + (p.earthlyBranch || '') + '）：主星 ' + majors + (minors ? '；辅星 ' + minors : ''));
    });
  }
  L.push('');
  L.push('（免责：解读仅供娱乐参考）');
  return L.join('\n');
}

module.exports = {
  paipan: paipan,
  DAY_MASTER_TXT: DAY_MASTER_TXT,
  SHI_SHEN_TXT: SHI_SHEN_TXT,
  ZW_STAR_TXT: ZW_STAR_TXT
};
