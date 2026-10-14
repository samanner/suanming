// v0.2 增量功能 - 追加到现有 index.html 的 </script> 之前
// 1. 流年运势模块  2. 旺衰精细化  3. 借星显示  4. 命例保存  5. 盘面分享
// 6. 大运流年交叉  7. 解读扩充  8. UI优化

// ========== 扩展数据结构 ==========
const HE_6 = {子:'丑',丑:'子',寅:'亥',卯:'戌',辰:'酉',巳:'申',午:'未',未:'午',申:'巳',酉:'辰',戌:'卯',亥:'寅'};
const CHONG_6 = {子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳'};
const HAI_6 = {子:'未',丑:'午',寅:'巳',卯:'辰',申:'亥',酉:'戌',未:'子',午:'丑',巳:'寅',辰:'卯',亥:'申',戌:'酉'};
const XING = {子:'卯',卯:'子',寅:'巳',巳:'寅',丑:'戌',戌:'丑',未:'丑',丑:'未',辰:'午',午:'辰',酉:'酉',亥:'亥',亥:'辰',辰:'亥',申:'寅',寅:'申'};
const SANHE = [['申','子','辰'],['亥','卯','未'],['寅','午','戌'],['巳','酉','丑']];
const SHI_SHEN_DETAIL = {
  正官:{career:'适合体制内、管理岗，贵人提携',love:'感情专一稳定，配偶条件不错',health:'注意肠胃、皮肤',wealth:'正财为主，收入稳定'},
  七杀:{career:'适合创业、武职、竞争激烈行业',love:'感情强烈但易冲突，晚婚为宜',health:'注意意外伤灾、肝胆',wealth:'偏财多，大起大落'},
  正印:{career:'学术教育、文化行业，贵人多助',love:'温和包容，配偶体贴',health:'体质较好，注意脾胃',wealth:'靠学识人脉生财'},
  偏印:{career:'偏门技术、玄学命理、创意设计',love:'感情独特，易有暗恋情愫',health:'注意神经衰弱、睡眠',wealth:'非传统行业得财'},
  正财:{career:'稳健经营、财务金融、实业',love:'务实顾家，婚姻稳定',health:'注意过劳、肾虚',wealth:'勤劳致富，积少成多'},
  偏财:{career:'投资贸易、销售人脉、灵活经营',love:'风流多情，异性缘佳',health:'注意心血管、眼目',wealth:'机会型得财，出手大方'},
  食神:{career:'艺术创作、餐饮美食、口才行业',love:'温柔浪漫，注重生活情趣',health:'体质佳，注意肥胖',wealth:'才华变现，持续收入'},
  伤官:{career:'技术创新、表演艺术、批判性工作',love:'要求高易挑剔，晚婚为佳',health:'注意呼吸、皮肤',wealth:'技艺生财，不服管'},
  比肩:{career:'合伙创业、自由职业',love:'独立平等，配偶像朋友',health:'注意筋骨、关节',wealth:'合伙分财，独立难聚'},
  劫财:{career:'竞争性行业、投机冒险',love:'感情激烈，易有争夺',health:'注意血光、手术',wealth:'赚多花多，需理财'}
};
const ZW_STAR_DETAIL = {
  紫微:{career:'领导管理、政府国企、大型企业',love:'高贵自尊，配偶优秀，晚婚佳',health:'注意脾胃、心脏',wealth:'正财稳定，贵人生财'},
  天机:{career:'策划分析、IT技术、命理玄学',love:'感情多变，易有三角关系',health:'注意肝胆、神经',wealth:'智慧生财，变动中求财'},
  太阳:{career:'公职、教育、能源、传播',love:'热情主动，付出型，易晚婚',health:'注意眼目、心脏',wealth:'光明正大，靠名声'},
  武曲:{career:'金融财务、军警武职、实业',love:'刚毅务实，配偶能干',health:'注意呼吸、骨骼',wealth:'财星入命，善理财'},
  天同:{career:'服务行业、教育文化、公务员',love:'温和随性，福气好，早婚多美',health:'体质佳，注意肾水',wealth:'福禄生财，不求自来'},
  廉贞:{career:'政治法律、设计艺术、娱乐',love:'感情丰富，桃花多，需自律',health:'注意血光、妇科/男科',wealth:'创意生财，偏财运'},
  天府:{career:'金融地产、管理仓储、农业',love:'稳重保守，婚姻安稳',health:'体质好，注意脾胃',wealth:'财库入命，积蓄丰厚'},
  太阴:{career:'房地产、美容、女性用品、金融',love:'细腻敏感，配偶温柔',health:'注意肾水、眼目',wealth:'积富之星，不动产佳'},
  贪狼:{career:'艺术娱乐、餐饮、玄学、销售',love:'桃花最旺，感情多波折',health:'注意肝肾、性病',wealth:'多才多艺，偏财运'},
  巨门:{career:'法律、教育、咨询、口才行业',love:'口舌是非多，配偶善辩',health:'注意肠胃、呼吸',wealth:'口才生财，暗财多'},
  天相:{career:'辅佐管理、公关、服务业',love:'注重仪表，配偶体面',health:'体质中平，注意皮肤',wealth:'辅佐得财，稳定收入'},
  天梁:{career:'医疗教育、公职、宗教慈善',love:'保护欲强，配偶年龄差',health:'逢凶化吉，注意筋骨',wealth:'清贵之财，不富但稳'},
  七杀:{career:'军警武职、创业开拓、外科医生',love:'感情强烈，聚少离多',health:'注意意外伤灾',wealth:'开创之财，大起大落'},
  破军:{career:'破坏创新、设计、竞技体育',love:'先破后成，感情波折',health:'注意消耗性疾病',wealth:'破旧立新，先破后得'},
  文昌:{career:'学术研究、写作、考试',love:'文雅浪漫，注重精神',health:'注意手部、呼吸',wealth:'文才生财'},
  文曲:{career:'艺术创作、演艺、设计',love:'浪漫多情，易暗恋',health:'注意眼目、皮肤',wealth:'艺术生财'},
  左辅:{career:'辅助管理、团队协作',love:'温和包容，配偶贤助',health:'体质佳',wealth:'助力生财'},
  右弼:{career:'协调沟通、公关服务',love:'圆融多助，异性缘佳',health:'体质中平',wealth:'人缘生财'},
  天魁:{career:'得长辈提携，公职佳',love:'贵人介绍，婚姻顺利',health:'逢凶化吉',wealth:'贵人生财'},
  天钺:{career:'得异性贵人助，人缘佳',love:'异性缘好，配偶优秀',health:'体质中平',wealth:'人缘得财'}
};

// ========== 4. 命例保存 ==========
function saveCase(){
  if(!CHART) return;
  const cases = JSON.parse(localStorage.getItem('ming_cases')||'[]');
  const c = {
    name: CHART.name||'', gender: CHART.gender,
    y: CHART.y, m: CHART.m, d: CHART.d,
    h: CHART.h, mi: CHART.mi||0,
    time: new Date().toLocaleString()
  };
  // 去重（同一人同一出生时间）
  const idx = cases.findIndex(x=>x.y===c.y&&x.m===c.m&&x.d===c.d&&x.h===c.h&&x.mi===c.mi&&x.gender===c.gender);
  if(idx>=0) cases.splice(idx,1);
  cases.unshift(c);
  if(cases.length>20) cases.length=20;
  localStorage.setItem('ming_cases', JSON.stringify(cases));
  renderCaseList();
}
function loadCase(i){
  const cases = JSON.parse(localStorage.getItem('ming_cases')||'[]');
  if(!cases[i]) return;
  const c = cases[i];
  el('fName').value=c.name; el('fGender').value=c.gender;
  el('fDate').value=c.y+'-'+('0'+c.m).slice(-2)+'-'+('0'+c.d).slice(-2);
  el('fTime').value=c.h!==null?('0'+c.h).slice(-2)+':'+('0'+c.mi).slice(-2):'';
  paipan();
}
function deleteCase(i, ev){
  ev.stopPropagation();
  const cases = JSON.parse(localStorage.getItem('ming_cases')||'[]');
  cases.splice(i,1);
  localStorage.setItem('ming_cases', JSON.stringify(cases));
  renderCaseList();
}
function renderCaseList(){
  const cases = JSON.parse(localStorage.getItem('ming_cases')||'[]');
  if(!cases.length){ el('caseList').innerHTML=''; return; }
  el('caseList').innerHTML = '<div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:12px">'
    +'<div style="font-size:12px;color:var(--dim);margin-bottom:8px">📁 历史命例（点击加载，×删除）</div>'
    +cases.map((c,i)=>'<div onclick="loadCase('+i+')" style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:var(--panel2);border:1px solid var(--line);border-radius:7px;margin-bottom:5px;cursor:pointer;font-size:13px">'
      +'<span>'+(c.name||'未命名')+' · '+(c.gender==='男'?'乾':'坤')+' · '+c.y+'-'+('0'+c.m).slice(-2)+'-'+('0'+c.d).slice(-2)+(c.h!==null?' '+('0'+c.h).slice(-2)+':'+('0'+c.mi).slice(-2):'')+'</span>'
      +'<span onclick="deleteCase('+i+',event)" style="color:var(--red);font-size:16px;padding:0 6px;cursor:pointer">×</span>'
      +'</div>').join('')+'</div>';
}

// ========== 2. 旺衰精细化 ==========
function detailedWangShuai(){
  if(!CHART) return null;
  const {ec} = CHART;
  const dmGan = ec.getDayGan();
  const dmEl = GAN_WX[dmGan];
  const monthZhi = ec.getMonthZhi();
  const pillars = [
    {gan:ec.getYearGan(), zhi:ec.getYearZhi()},
    {gan:ec.getMonthGan(), zhi:ec.getMonthZhi()},
    {gan:ec.getDayGan(), zhi:ec.getDayZhi()},
  ];
  if(CHART.h!==null) pillars.push({gan:ec.getTimeGan(), zhi:ec.getTimeZhi()});

  let score = 0;
  const maxScore = pillars.length * 3;
  const details = [];

  // 月令权重 ×2
  const mzWx = ZHI_WX[monthZhi];
  if(mzWx===dmEl) { score+=2; details.push('月令'+monthZhi+'为'+mzWx+'，与日主同气，+2'); }
  else if(SHENG[mzWx]===dmEl) { score+=1.5; details.push('月令'+monthZhi+'为'+mzWx+'，生扶日主，+1.5'); }
  else if(KE[mzWx]===dmEl || KE[dmEl]===mzWx) { score-=0.5; details.push('月令'+monthZhi+'为'+mzWx+'，克耗日主，-0.5'); }

  // 天干通根 & 地支帮扶
  pillars.forEach((p,i)=>{
    if(i===1) return; // 月令已算
    const gw = GAN_WX[p.gan], zw = ZHI_WX[p.zhi];
    if(gw===dmEl) { score+=1.5; }
    else if(SHENG[gw]===dmEl) { score+=1; }
    else if(KE[gw]===dmEl || KE[dmEl]===gw) { score-=0.5; }
    if(zw===dmEl) { score+=1; }
    else if(SHENG[zw]===dmEl) { score+=0.5; }
    else if(KE[zw]===dmEl || KE[dmEl]===zw) { score-=0.5; }
  });

  // 藏干通根加分
  pillars.forEach(p=>{
    const hideGan = [];
    if(p.zhi===ec.getYearZhi()) hideGan.push(...ec.getYearHideGan());
    if(p.zhi===ec.getMonthZhi()) hideGan.push(...ec.getMonthHideGan());
    if(p.zhi===ec.getDayZhi()) hideGan.push(...ec.getDayHideGan());
    if(CHART.h!==null && p.zhi===ec.getTimeZhi()) hideGan.push(...ec.getTimeHideGan());
    hideGan.forEach(g=>{
      if(GAN_WX[g]===dmEl) score+=0.3;
    });
  });

  // 刑冲合会调整
  const zhies = pillars.map(p=>p.zhi);
  // 六合加分
  for(let i=0;i<zhies.length;i++) for(let j=i+1;j<zhies.length;j++){
    if(HE_6[zhies[i]]===zhies[j]) score+=0.5;
    if(CHONG_6[zhies[i]]===zhies[j]) score-=0.5;
    if(HAI_6[zhies[i]]===zhies[j]) score-=0.3;
  }

  const pct = Math.max(0, Math.min(100, Math.round((score/maxScore)*100)));
  const state = pct>=65?'身旺':pct>=55?'中和偏旺':pct>=45?'中和':pct>=35?'中和偏弱':'身弱';
  return {pct, state, details, dmGan, dmEl, monthZhi, score, maxScore};
}

// ========== 3. 紫微借星 ==========
function getOppositePalace(name){
  const map = {'命宫':'迁移','迁移':'命宫','兄弟':'仆役','仆役':'兄弟','夫妻':'官禄','官禄':'夫妻','子女':'田宅','田宅':'子女','财帛':'福德','福德':'财帛','疾厄':'父母','父母':'疾厄'};
  return map[name];
}
function renderZiweiBorrow(chart){
  const sorted = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','仆役','官禄','田宅','福德','父母'].map(n=>chart.palaces.find(p=>p.name===n)).filter(Boolean);
  return sorted.map(p=>{
    const majors = (p.majorStars||[]).map(s=>{
      const mut = s.mutagen ? '<span class="mut '+( {禄:'m1',权:'m2',科:'m3',忌:'m4'}[s.mutagen]||'')+'">'+s.mutagen+'</span>' : '';
      const br = s.brightness ? '<span class="bright">'+esc(s.brightness)+'</span>' : '';
      return '<div><span class="major">'+esc(s.name)+'</span>'+br+mut+'</div>';
    }).join('');
    const minors = (p.minorStars||[]).map(s=>'<span class="minor">'+esc(s.name)+'</span>').join(' ');
    const adj = p.adjectiveStars||{};
    const aux = [...(adj.adjuvantStars||[]),...(adj.beneficialStars||[])].map(s=>'<span class="minor">'+esc(s.name||s)+'</span>').join(' ');
    const bads = (adj.maleficStars||[]).map(s=>'<span class="bad">'+esc(s.name||s)+'</span>').join(' ');

    // 借星显示
    let borrowHtml = '';
    if(!(p.majorStars||[]).length){
      const oppName = getOppositePalace(p.name);
      const opp = chart.palaces.find(x=>x.name===oppName);
      if(opp && (opp.majorStars||[]).length){
        const oppMajors = opp.majorStars.map(s=>s.name).join('、');
        borrowHtml = '<div style="font-size:10px;color:#7a6c55;margin-top:3px">借对宫'+esc(oppName)+'：'+esc(oppMajors)+'</div>';
      }
    }

    const cls = (p.name==='命宫'?'ming ':'')+(p.isBodyPalace?'shen':'');
    return '<div class="palace '+cls+'">'
      +'<div class="p-name">'+esc(p.name)+(p.isBodyPalace?' <span style="color:var(--cyan);font-size:10px">身</span>':'')+'</div>'
      +'<div class="p-branch">'+esc(p.heavenlyStem||'')+esc(p.earthlyBranch||'')+' · '+esc(p.changsheng12||'')+'</div>'
      +'<div class="p-star">'+majors+(minors?'<div>'+minors+'</div>':'')+(aux?'<div>'+aux+'</div>':'')+(bads?'<div>'+bads+'</div>':'')+borrowHtml+'</div>'
      +'</div>';
  }).join('');
}

// ========== 1&6. 流年运势 ==========
function getLiuNianData(year){
  if(!CHART) return null;
  const {ec, gender} = CHART;
  const yun = ec.getYun(gender==='男'?1:0);
  const dys = yun.getDaYun(15);
  // 找到对应大运
  let dy = null;
  for(const d of dys){ if(d.getStartYear()<=year && d.getEndYear()>=year){ dy=d; break; } }
  if(!dy) return null;

  // 流年信息
  const ln = dy.getLiuNian(year - dy.getStartYear() + 1)[0];
  if(!ln) return null;

  const lnGanZhi = ln.getGanZhi ? ln.getGanZhi() : '';
  const lnGan = lnGanZhi[0]||'';
  const lnZhi = lnGanZhi[1]||'';
  const shengxiao = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  const sxIdx = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(lnZhi);

  // 流年天干十神
  const shishen = (()=>{
    if(!lnGan) return '';
    const dm = ec.getDayGan();
    const dmWx = GAN_WX[dm], lnWx = GAN_WX[lnGan];
    if(dm===lnGan) return '比肩';
    if(lnWx===dmWx) return '劫财';
    if(SHENG[lnWx]===dmWx) return (dmWx==='阳'?'偏印':'正印');
    if(SHENG[dmWx]===lnWx) return (lnWx==='阳'?'食神':'伤官');
    if(KE[lnWx]===dmWx) return (dmWx==='阳'?'偏财':'正财');
    if(KE[dmWx]===lnWx) return (dmWx==='阳'?'七杀':'正官');
    return '';
  })();

  // 流年地支与四柱地支关系
  const relations = [];
  const pillars = [ec.getYearZhi(), ec.getMonthZhi(), ec.getDayZhi()];
  if(CHART.h!==null) pillars.push(ec.getTimeZhi());
  const labels = ['年支','月支','日支','时支'];
  pillars.forEach((z,i)=>{
    if(!z||!lnZhi) return;
    if(HE_6[z]===lnZhi) relations.push(labels[i]+'六合');
    if(CHONG_6[z]===lnZhi) relations.push(labels[i]+'相冲');
    if(HAI_6[z]===lnZhi) relations.push(labels[i]+'相害');
    if(XING[z]===lnZhi) relations.push(labels[i]+'相刑');
  });
  // 三合检查
  SANHE.forEach(tri=>{
    if(tri.includes(lnZhi)){
      const has = pillars.filter(z=>tri.includes(z));
      if(has.length>=2) relations.push('流年与命局成三合');
    }
  });

  // 吉凶评分
  let score = 50;
  const goodSS = ['正印','偏印','食神','正官','正财','比肩'];
  const badSS = ['七杀','伤官','劫财'];
  if(goodSS.includes(shishen)) score+=15;
  if(badSS.includes(shishen)) score-=12;
  relations.forEach(r=>{
    if(r.includes('六合')||r.includes('三合')) score+=8;
    if(r.includes('相冲')) score-=10;
    if(r.includes('相害')) score-=5;
    if(r.includes('相刑')) score-=5;
  });

  return {
    year, ganZhi: lnGanZhi, shengxiao: sxIdx>=0?shengxiao[sxIdx]:'',
    age: ln.getAge ? ln.getAge() : (year - CHART.y),
    dayun: dy.getGanZhi(), shishen, relations,
    score: Math.max(5, Math.min(95, score)),
    judgment: score>=70?'大吉':score>=55?'吉':score>=45?'平':score>=35?'需注意':'谨慎'
  };
}

function renderLiuNian(){
  if(!CHART){ el('liuNianArea').innerHTML='<div class="empty">请先起盘</div>'; return; }
  const now = new Date().getFullYear();
  const years = [];
  for(let i=now-5;i<=now+10;i++) years.push(i);
  const select = '<select id="lnYear" onchange="showLiuNianDetail()" style="background:var(--panel2);border:1px solid var(--line);color:var(--text);padding:8px 12px;border-radius:7px;font-size:14px">'
    +years.map(y=>'<option value="'+y+'" '+(y===now?'selected':'')+'>'+y+'年</option>').join('')+'</select>';
  el('liuNianArea').innerHTML = '<div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap">'
    +'<span style="font-size:13px;color:var(--dim)">选择年份：</span>'+select
    +'<button class="btn2" onclick="renderDaYunLiuNianTable()">📊 十年大运流年总览</button></div>'
    +'<div id="lnDetail"></div><div id="dyLnTable" style="margin-top:16px"></div>';
  showLiuNianDetail();
}

function showLiuNianDetail(){
  const year = parseInt(el('lnYear').value);
  const d = getLiuNianData(year);
  if(!d){ el('lnDetail').innerHTML='<div class="empty">该年份无大运数据</div>'; return; }
  const jd = d.score>=70?'background:rgba(143,188,143,.15);color:var(--green);border:1px solid var(--green)'
    : d.score>=55?'background:rgba(230,192,122,.12);color:var(--gold);border:1px solid var(--gold)'
    : d.score>=45?'background:rgba(154,138,116,.12);color:var(--dim);border:1px solid var(--dim)'
    : 'background:rgba(217,83,79,.12);color:#e08080;border:1px solid #a05050';
  el('lnDetail').innerHTML = '<div style="background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:16px">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">'
    +'<div><span style="font-size:28px;font-weight:800;color:var(--gold2)">'+d.ganZhi+'</span>'
    +'<span style="font-size:14px;color:var(--dim);margin-left:10px">'+d.shengxiao+'年 · '+d.age+'岁</span></div>'
    +'<div style="text-align:right"><span style="display:inline-block;padding:4px 14px;border-radius:8px;font-size:14px;font-weight:700;'+jd+'">'+d.judgment+' '+d.score+'分</span></div></div>'
    +'<div style="margin-top:12px;font-size:13.5px;line-height:2.2">'
    +'<p>📌 所属大运：<b style="color:var(--gold2)">'+d.dayun+'</b></p>'
    +'<p>📌 流年十神：<b style="color:var(--cyan)">'+d.shishen+'</b>'+(SHI_SHEN_TXT[d.shishen]?'（'+SHI_SHEN_TXT[d.shishen]+'）':'')+'</p>'
    +'<p>📌 地支关系：'+(d.relations.length?d.relations.map(r=>'<span class="tagx '+(r.includes('合')?'g':'r')+'">'+r+'</span>').join(' '):'<span style="color:var(--dim)">无明显刑冲合害</span>')+'</p>'
    +(SHI_SHEN_DETAIL[d.shishen]?'<p>📌 运势提示：'+SHI_SHEN_DETAIL[d.shishen].career+'</p>':'')
    +'</div></div>';
}

function renderDaYunLiuNianTable(){
  if(!CHART) return;
  const now = new Date().getFullYear();
  const {ec,gender} = CHART;
  const yun = ec.getYun(gender==='男'?1:0);
  const dys = yun.getDaYun(6);
  let html = '<h3 style="font-size:14px;color:var(--gold);margin:16px 0 10px">大运 × 流年 十年总览</h3>';
  html += '<div style="overflow-x:auto"><table style="font-size:12px"><tr><th>大运</th>';
  for(let y=now;y<now+10;y++) html+='<th>'+y+'</th>';
  html+='</tr>';
  dys.slice(0,4).forEach(dy=>{
    html+='<tr><td style="white-space:nowrap;color:var(--gold2);font-weight:700">'+dy.getGanZhi()+'<br><span style="font-size:10px;color:var(--dim)">'+dy.getStartAge()+'-'+dy.getEndAge()+'岁</span></td>';
    for(let y=now;y<now+10;y++){
      if(y<dy.getStartYear()||y>dy.getEndYear()){ html+='<td style="background:rgba(20,16,12,.5)">—</td>'; continue; }
      const d = getLiuNianData(y);
      if(!d){ html+='<td>—</td>'; continue; }
      const bg = d.score>=70?'background:rgba(143,188,143,.1)':d.score>=55?'background:rgba(230,192,122,.08)':d.score>=45?'':'background:rgba(217,83,79,.08)';
      html+='<td style="'+bg+'" title="'+d.ganZhi+' '+d.judgment+'"><b>'+d.ganZhi+'</b><br><span style="font-size:10px">'+d.shishen+'<br>'+d.score+'分</span></td>';
    }
    html+='</tr>';
  });
  html+='</table></div>';
  el('dyLnTable').innerHTML = html;
}

// ========== 5. 盘面分享（Canvas 截图） ==========
function shareChart(){
  if(!CHART) return;
  const {ec,solar,name,gender} = CHART;
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 400;
  const ctx = canvas.getContext('2d');
  // 背景
  ctx.fillStyle='#0d0a08'; ctx.fillRect(0,0,600,400);
  ctx.strokeStyle='#3a2e22'; ctx.strokeRect(10,10,580,380);
  // 标题
  ctx.fillStyle='#e6c07a'; ctx.font='bold 22px Microsoft YaHei'; ctx.textAlign='center';
  ctx.fillText('赛博命理馆 · 命盘', 300, 45);
  // 信息
  ctx.fillStyle='#9a8a74'; ctx.font='13px Microsoft YaHei';
  ctx.fillText((name||'未命名')+' · '+(gender==='男'?'乾造':'坤造')+' · '+solar.toYmd()+(CHART.h!==null?' '+fmtTime():''), 300, 75);
  // 四柱
  ctx.font='bold 20px Microsoft YaHei';
  const pillars=[ec.getYear(),ec.getMonth(),ec.getDay()];
  if(CHART.h!==null) pillars.push(ec.getTime());
  const labels=['年','月','日','时'];
  const startX=80, gap=140;
  pillars.forEach((gz,i)=>{
    ctx.fillStyle='#9a8a74'; ctx.font='12px Microsoft YaHei';
    ctx.fillText(labels[i]+'柱', startX+i*gap, 115);
    ctx.fillStyle='#f5deb0'; ctx.font='bold 24px Microsoft YaHei';
    ctx.fillText(gz, startX+i*gap, 148);
  });
  // 五行
  ctx.fillStyle='#9a8a74'; ctx.font='12px Microsoft YaHei'; ctx.textAlign='left';
  ctx.fillText('五行：', 60, 190);
  const counts={木:0,火:0,土:0,金:0,水:0};
  pillars.forEach(gz=>{counts[GAN_WX[gz[0]]]++;counts[ZHI_WX[gz[1]]]++;});
  const colors={木:'#6a9955',火:'#d9534f',土:'#c8a165',金:'#c0c0c8',水:'#4a86b0'};
  let bx=110;
  Object.keys(counts).forEach(w=>{
    ctx.fillStyle=colors[w]; ctx.fillRect(bx,180,counts[w]*20,18);
    ctx.fillStyle='#000'; ctx.font='bold 11px Microsoft YaHei'; ctx.textAlign='center';
    ctx.fillText(w+'×'+counts[w], bx+counts[w]*10, 193);
    bx+=counts[w]*20+5;
  });
  // 底部
  ctx.fillStyle='#6a5c48'; ctx.font='11px Microsoft YaHei'; ctx.textAlign='center';
  ctx.fillText('赛博命理馆 v0.2 · 开源历法引擎排盘 · 仅供娱乐参考', 300, 370);
  // 下载
  canvas.toBlob(blob=>{
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=(CHART.name||'命盘')+'-盘面.png'; a.click();
  });
}

// ========== 8. 解读扩充 - 十神组合 ==========
function getShiShenCombos(){
  if(!CHART) return [];
  const {ec} = CHART;
  const allSS = [ec.getYearShiShenGan(), ec.getMonthShiShenGan()];
  if(CHART.h!==null) allSS.push(ec.getTimeShiShenGan());
  const combos = [];
  const has = s=>allSS.includes(s);
  if(has('食神')&&has('七杀')) combos.push({name:'食神制杀',desc:'以才华制约压力，将挑战化为动力，多见于武职或竞争行业成功'});
  if(has('伤官')&&has('正官')) combos.push({name:'伤官见官',desc:'聪明反被聪明误，易与上级冲突，适合独立创业而非打工'});
  if(has('正印')&&has('偏财')) combos.push({name:'印绶护财',desc:'以学识名气得财，适合专业顾问、教育培训'});
  if(has('正财')&&has('正印')) combos.push({name:'财印双全',desc:'既有财富又有学识，富贵双全之象'});
  if(has('比肩')&&has('七杀')) combos.push({name:'杀刃相合',desc:'勇敢果断，适合军警武职，需注意安全'});
  if(has('伤官')&&has('偏财')) combos.push({name:'伤官生财',desc:'以创意技艺得财，适合艺术、设计、自由职业'});
  if(has('正官')&&has('正印')) combos.push({name:'官印相生',desc:'名利双收，仕途坦荡，适合公务员、管理层'});
  return combos;
}
