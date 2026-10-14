/* ============================================================
   storage.js — 命例存储管理
   key: ming_cases  value: 数组
   ============================================================ */
var KEY = 'ming_cases';
var MAX_CASES = 50;

function getCases() {
  try {
    var list = wx.getStorageSync(KEY);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function persist(list) {
  try {
    wx.setStorageSync(KEY, list);
    return true;
  } catch (e) {
    return false;
  }
}

/* 保存一条命例（同人同时会去重置顶） */
function saveCase(chart) {
  var cases = getCases();
  var item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: chart.name || '',
    gender: chart.gender,
    y: chart.y, m: chart.m, d: chart.d,
    h: chart.h, mi: chart.mi,
    hasTime: chart.hasTime,
    solarYmd: chart.solarYmd || '',
    lunarText: chart.lunarText || '',
    createdAt: Date.now(),
    chart: chart
  };
  /* 去重 */
  var idx = -1;
  for (var i = 0; i < cases.length; i++) {
    var c = cases[i];
    if (c.gender === item.gender && c.y === item.y && c.m === item.m &&
        c.d === item.d && c.h === item.h && c.mi === item.mi) {
      idx = i;
      break;
    }
  }
  if (idx >= 0) cases.splice(idx, 1);
  cases.unshift(item);
  if (cases.length > MAX_CASES) cases.length = MAX_CASES;
  persist(cases);
  return item;
}

function deleteCase(id) {
  var cases = getCases().filter(function (c) { return c.id !== id; });
  persist(cases);
}

function clearCases() {
  try {
    wx.removeStorageSync(KEY);
  } catch (e) { }
}

module.exports = {
  getCases: getCases,
  saveCase: saveCase,
  deleteCase: deleteCase,
  clearCases: clearCases
};
