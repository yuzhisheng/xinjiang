// ===================================================================
// 打印版行程文档生成器
// · 与 data.js 单一数据源同源：行程数据一改，文档自动同步
// · 文档不含任何图片，按 A4 排版优化，可直接打印或「另存为 PDF」
// ===================================================================
import { DAYS, ROUTE, TICKETS, BUDGET, PREP, PREP_META } from './data.js';
import { buildPlainText, copyText, downloadText, toast } from './plaintext.js';

// ---------------------------------------------------------------
// 工具
// ---------------------------------------------------------------
const S = v => (v == null ? '' : String(v)).trim();

/** 数据里的网页化措辞 → 打印文档用语（不改动 data.js 本身） */
const DOC_WORDS = [
  [/（点「[^」]*」右侧的版本标签可切换）/g, ''],
  [/D5 卡片里备好了/g, 'D5 备好了'],
  [/徽标提示/g, '标注提示']
];
const clean = v => DOC_WORDS.reduce((s, pair) => s.replace(pair[0], pair[1]), S(v));

/** HTML 转义：内容先转义再拼进模板，避免特殊字符破坏结构 */
const esc = v => clean(v)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const BUDGET_TOTAL = BUDGET.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
const TOTAL_WAN = (BUDGET_TOTAL / 10000).toFixed(2);
const money = n => '¥' + Number(n || 0).toLocaleString('en-US');

/** 全程红线：与纯文字版同源的 8 条 */
const RULES = [
  '证件：喀纳斯、禾木属边境管理区，全家身份证原件必带；儿童无身份证需提前办临时身份证明。检查站配合登记，证件放司机随手可取的位置。',
  '加油：阿禾公路 209km 无加油站，阿勒泰出城必须满油；新疆加油站要司机本人实体身份证 + 人脸核验，乘客不能代刷；油表剩 1/3 就加，偏远站备现金。',
  '穿衣：禾木清晨可至 -2°C、赛湖清晨 -5°C，一天温差近 20°C；三层穿法（速干 + 抓绒 + 羽绒）随时增减，帽子手套墨镜必备。',
  '信号：禾木 / 喀纳斯 / 阿禾公路部分路段信号弱，提前下载离线地图与动画片，备 2000 元现金兜底。',
  '限速：阿禾公路全线限速 30、弯道限速 20，路基仅 7.5 米宽；只停 31 处官方观景台，主干道禁停。',
  '错峰：喀纳斯、禾木都在国庆前完成；10/1 人流峰值日在赛里木湖环湖自驾，人流分散，体验远好于排队。',
  '节奏：每天只设 1 个「必须完成」目标，其余是加分项；孩子情绪崩了就就地休息，行程再美也比不上全家心情。',
  '兜底：若阿禾公路临时管制，回退方案为阿勒泰 → 布尔津 → 贾登峪进禾木（多约 1.5 小时）；若返程 10/2 车流大，果断砍大巴扎，航班永远优先。'
];

const STAYS_LINE = '乌市机场 2 + 阿勒泰 1 + 禾木禾盛山庄 1 + 喀纳斯 2（景区内云中歌 + 贾登峪疆峪）+ 布尔津 1 + 克拉玛依 1 + 赛湖潮克星空营地 1';

// ---------------------------------------------------------------
// 公共小组件
// ---------------------------------------------------------------
/** 导航目的地：full = 详细列表；brief = 一行速览 */
function navBlock(nav, full) {
  if (!Array.isArray(nav) || !nav.length) return '';
  if (!full) {
    return `<p class="navline"><span class="lb">导航目的地</span>${nav.map(n => `搜「${esc(n.to)}」`).join(' → ')}</p>`;
  }
  const items = nav.map(n => `<li><b>搜「${esc(n.to)}」</b> ｜ ${esc(n.leg)} ｜ ${esc(n.hint)}</li>`).join('');
  return `
  <div class="navbox">
    <p class="navbox-t">导航目的地（照着搜）</p>
    <ol class="navlist">${items}</ol>
  </div>`;
}

/** 时间表（时间 + 安排，行内可带导航目的地标注） */
function timelineTable(list) {
  if (!Array.isArray(list) || !list.length) return '';
  const rows = list.map(t => `<tr><td class="t">${esc(t.t)}</td><td>${esc(t.d)}${t.nav ? `<span class="navflag">导航：${esc(t.nav)}</span>` : ''}</td></tr>`).join('');
  return `<table class="tl"><tbody>${rows}</tbody></table>`;
}

/** 要点列表（亲子提示 / 必须知道） */
function notesBlock(title, notes) {
  if (!Array.isArray(notes) || !notes.length) return '';
  const items = notes.map(n => `<li>${esc(n)}</li>`).join('');
  return `<div class="sub"><p class="sub-t">${esc(title)}</p><ul class="dot">${items}</ul></div>`;
}

// ---------------------------------------------------------------
// 各段落
// ---------------------------------------------------------------
function headBlock() {
  const rows = [
    ['出行日期', '2026/09/24 - 10/03 · 9 晚 10 天（8 个整天）'],
    ['同行人员', '一家四口（8 岁 + 4 岁）'],
    ['交通方式', '深圳 ⇌ 乌鲁木齐往返航班 · 当地自驾 8 天（9/25 早机场取车 · 10/3 早还车）'],
    ['自驾里程', '约 2250km · 东进西出大环线（含 G681 阿禾公路 + 赛里木湖环湖）'],
    ['费用预算', `四人地面约 ¥${TOTAL_WAN} 万（不含深圳往返机票）`],
    ['作息安排', '默认 8:00 起床、9:00 前后出门；仅 3 个早晨为景色早起（禾木晨雾 6:20 / 神仙湾晨雾 7:00 / 赛湖日出 7:00），返程日 6:30 由航班规定'],
    ['行程主线', '乌鲁木齐 →（S21 沙漠公路）→ 阿勒泰 →（阿禾公路 G681）→ 禾木 → 喀纳斯 → 布尔津 → 魔鬼城 → 克拉玛依 → 赛里木湖 → 乌鲁木齐']
  ];
  const kv = rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('');
  return `
  <header class="doc-head">
    <p class="doc-kicker">喀纳斯金秋计划 · 行程文档</p>
    <h1>北疆金秋 · 10 天 9 晚亲子自驾行程</h1>
    <p class="doc-sub">深圳 → 乌鲁木齐 → 阿勒泰 → 禾木 → 喀纳斯 → 赛里木湖 → 乌鲁木齐 → 深圳</p>
    <table class="kv"><tbody>${kv}</tbody></table>
  </header>`;
}

function overviewBlock() {
  const rows = ROUTE.map(r => `
    <tr>
      <td class="c-day">${esc(r.day)}</td>
      <td class="c-city">${esc(r.city)}</td>
      <td class="c-km">${esc(r.km)}</td>
      <td>${esc(r.note)}</td>
    </tr>`).join('');
  return `
  <section class="doc-sec">
    <h2>一、路线一览</h2>
    <table class="tbl">
      <thead><tr><th class="c-day">日</th><th class="c-city">行程</th><th class="c-km">里程</th><th>说明</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="note">住宿 9 晚：${esc(STAYS_LINE)}。</p>
  </section>`;
}

/** 备选版本卡片（主计划 / 各版本） */
function planCard(meta, full, isMain, mainLabel) {
  const p = meta || {};
  const lines = [];
  lines.push(`<div class="plan${isMain ? ' main' : ''}">`);
  lines.push(`<p class="plan-t">▍${esc(isMain ? (mainLabel || '主计划') : p.label)}${isMain ? '（默认方案 · 时间表见上方）' : ''}</p>`);
  const metaLine = [S(p.tag), S(p.km)].filter(Boolean).join(' ｜ ');
  if (metaLine) lines.push(`<p class="plan-meta">${esc(metaLine)}</p>`);
  if (p.diff) lines.push(`<p class="plan-sum"><b>差异</b>${esc(p.diff)}</p>`);
  if (p.summary && (isMain || full)) lines.push(`<p class="plan-sum">${esc(p.summary)}</p>`);
  if (p.wake && p.wake.t) lines.push(`<p class="plan-wake"><b>起床</b>${esc(p.wake.t)}（${esc(p.wake.label)}）</p>`);
  lines.push(navBlock(p.nav, full));
  if (full) {
    lines.push(timelineTable(p.timeline));
    lines.push(notesBlock('必须知道', p.notes));
    if (p.verdict) lines.push(`<p class="plan-verdict"><b>建议</b>${esc(p.verdict)}</p>`);
  }
  lines.push('</div>');
  return lines.join('');
}

function altsBlock(alts, full) {
  if (!alts || !Array.isArray(alts.plans)) return '';
  const parts = [];
  parts.push('<div class="alts">');
  parts.push(`<p class="alts-t">【${esc(alts.title)}】</p>`);
  if (alts.note) parts.push(`<p class="alts-note"><b>说明</b>${esc(alts.note)}</p>`);
  if (alts.warn) parts.push(`<p class="alts-note"><b>前提</b>${esc(alts.warn)}</p>`);
  parts.push(planCard(alts.main, full, true, alts.mainLabel));
  alts.plans.forEach(p => parts.push(planCard(p, full, false, '')));
  parts.push('</div>');
  return parts.join('');
}

function dayBlock(d, full) {
  const w = d.wake || {};
  const facts = [];
  facts.push(`<p><b>车程</b>${esc(d.drive)}</p>`);
  facts.push(`<p><b>住宿</b>${esc(d.stay)}</p>`);
  if (w.t) facts.push(`<p><b>起床</b>${esc(w.t)}${w.label ? `（${esc(w.label)}）` : ''}</p>`);
  if (full && w.note) facts.push(`<p><b>备注</b>${esc(w.note)}</p>`);

  return `
  <section class="day">
    <div class="day-head">
      <h3>D${esc(d.id)} · ${esc(d.date)} · ${esc(d.title)}</h3>
      ${d.badge ? `<span class="day-badge">${esc(d.badge)}</span>` : ''}
    </div>
    <div class="facts">${facts.join('')}</div>
    ${timelineTable(d.timeline)}
    ${navBlock(d.nav, full)}
    ${altsBlock(d.alts, full)}
    ${full ? notesBlock('亲子提示', d.tips) : ''}
    ${full && d.food ? `<p class="meal"><b>餐食</b>${esc(d.food)}</p>` : ''}
  </section>`;
}

function ticketsBlock() {
  const rows = TICKETS.map(t => `
    <tr>
      <td>${esc(t.name)}</td>
      <td class="c">${esc(t.adult)}</td>
      <td class="c">${esc(t.kid)}</td>
      <td>${esc(t.bus)}</td>
    </tr>`).join('');
  return `
  <section class="doc-sec page-break">
    <h2>三、门票与区间车速查（旺季参考价）</h2>
    <table class="tbl">
      <thead><tr><th>项目</th><th class="c">成人</th><th class="c">儿童</th><th>区间车 / 说明</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function budgetBlock() {
  const rows = BUDGET.map(b => `
    <tr>
      <td>${esc(b.item)}</td>
      <td class="c">${money(b.amount)}</td>
      <td>${esc(b.note)}</td>
    </tr>`).join('');
  return `
  <section class="doc-sec">
    <h2>四、费用预算（四人 · 不含往返机票）</h2>
    <table class="tbl">
      <thead><tr><th>项目</th><th class="c">金额</th><th>说明</th></tr></thead>
      <tbody>${rows}
        <tr class="total"><td>合计</td><td class="c">${money(BUDGET_TOTAL)}</td><td>约 ¥${TOTAL_WAN} 万 · 门票按 4 岁免票 / 8 岁半价计</td></tr>
      </tbody>
    </table>
  </section>`;
}

function rulesBlock() {
  const items = RULES.map(r => `<li>${esc(r)}</li>`).join('');
  return `
  <section class="doc-sec">
    <h2>五、全程红线（务必记住）</h2>
    <ol class="rules">${items}</ol>
  </section>`;
}

function prepBlock() {
  const groups = PREP.map(st => {
    const items = (st.items || []).map(it => `
      <li><span class="box">□</span><span>${it.hot ? '<b class="hot">★</b> ' : ''}${esc(it.t)}${it.when ? ` —— ${esc(it.when)}` : ''}</span></li>`).join('');
    return `
    <div class="checkgroup">
      <p class="checkgroup-t">▍${esc(st.name)}（${esc(st.sub)}）</p>
      <ul class="checklist">${items}</ul>
    </div>`;
  }).join('');
  return `
  <section class="doc-sec">
    <h2>六、出发前必办清单</h2>
    <p class="note">${esc(PREP_META.reserveNote)}</p>
    ${groups}
  </section>`;
}

function footBlock() {
  return `
  <footer class="doc-foot">
    <p class="note">完整图文攻略（含地图与图片）：https://yuzhisheng.github.io/xinjiang/</p>
    <p class="note">门票、区间车与住宿价格为旺季参考值，出行前请以景区官方公告与预订平台实时价为准；喀纳斯、禾木属边境管理区，全家身份证原件（含儿童）必带。</p>
    <p>由 <a href="https://with.woa.com/" style="color: #8A2BE2;" target="_blank">With</a> 通过自然语言生成</p>
  </footer>`;
}

// ---------------------------------------------------------------
// 组装
// ---------------------------------------------------------------
export function buildDoc(mode = 'full') {
  const full = mode === 'full';
  const parts = [
    headBlock(),
    overviewBlock(),
    `<section class="doc-sec page-break"><h2>二、逐日行程</h2>${DAYS.map(d => dayBlock(d, full)).join('')}</section>`
  ];
  if (full) {
    parts.push(ticketsBlock());
    parts.push(budgetBlock());
    parts.push(rulesBlock());
    parts.push(prepBlock());
  }
  parts.push(footBlock());
  return parts.join('');
}

// ---------------------------------------------------------------
// 页面交互：渲染 / 打印 / 复制 / 下载 / 模式切换
// ---------------------------------------------------------------
export function initPlanDoc() {
  const docEl = document.getElementById('doc');
  if (!docEl) return;

  document.documentElement.dataset.appBooted = '1';

  const stat = document.getElementById('docStat');
  let mode = 'full';

  const render = () => {
    docEl.innerHTML = buildDoc(mode);
    if (stat) {
      const chars = (docEl.textContent || '').replace(/\s+/g, '').length;
      stat.textContent = `${mode === 'full' ? '完整版' : '精简版'} · 全文约 ${chars} 字`;
    }
    document.title = `北疆10日自驾行程-${mode === 'full' ? '完整版' : '精简版'}`;
  };

  const modeBtns = Array.from(document.querySelectorAll('[data-mode]'));
  const paintMode = () => {
    modeBtns.forEach(b => {
      const on = b.dataset.mode === mode;
      b.className = on
        ? 'rounded-lg bg-ink px-3.5 py-1.5 text-xs font-bold text-white transition'
        : 'rounded-lg px-3.5 py-1.5 text-xs font-bold text-stone-500 transition hover:text-birch';
    });
  };
  modeBtns.forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode || 'full';
    paintMode();
    render();
  }));
  paintMode();

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const copyBtn = document.getElementById('copyAll');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(buildPlainText(mode));
      toast(ok ? '已复制文字版全文，去粘贴吧' : '复制失败，请手动选择文本复制');
    });
  }

  const dlBtn = document.getElementById('download');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      downloadText(buildPlainText(mode), `北疆10日行程-${mode === 'full' ? '完整版' : '精简版'}.txt`);
      toast('已开始下载 .txt 文件');
    });
  }

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlanDoc);
} else {
  initPlanDoc();
}
