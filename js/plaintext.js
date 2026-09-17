// ===================================================================
// 纯文字版行程生成器
// 与 data.js 单一数据源同源：改了行程数据，文字版自动同步
// ===================================================================
import { DAYS, ROUTE, TICKETS, PREP, BUDGET } from './data.js';

const RULE = '━'.repeat(24);
const THIN = '─'.repeat(24);

const S = v => (v == null ? '' : String(v)).trim();

const BUDGET_TOTAL = BUDGET.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
const TOTAL_WAN = (BUDGET_TOTAL / 10000).toFixed(2);

// ---------------------------------------------------------------
// 各段落生成
// ---------------------------------------------------------------
function headText() {
  return [
    RULE,
    '北疆金秋 · 10 天 9 晚亲子自驾行程',
    '深圳 → 阿勒泰 → 禾木 → 喀纳斯 → 赛里木湖 → 深圳',
    '2026/09/24 - 2026/10/03 · 一家四口（8 岁 + 4 岁）',
    RULE
  ].join('\n');
}

function overviewText() {
  return [
    '【总览】',
    '· 时间：2026/09/24 - 2026/10/03（9 晚 10 天 · 8 个整天）',
    '· 人员：一家四口（8 岁 + 4 岁）',
    '· 方式：自驾 · 9/25 早机场取车 - 10/3 早还车（共 8 天）',
    '· 里程：约 2250km',
    `· 预算：四人地面约 ¥${TOTAL_WAN} 万（不含深圳往返机票）`,
    '· 作息：默认 8:00 起床、9:00 前后出门；仅 3 个早晨为景色早起（禾木晨雾 6:20 / 神仙湾晨雾 7:00 / 赛湖日出 7:00），返程日 6:30 由航班规定。',
    '· 主线：乌鲁木齐 →（S21 沙漠公路）→ 阿勒泰 →（阿禾公路 G681）→ 禾木 → 喀纳斯 → 布尔津 → 魔鬼城 → 克拉玛依 → 赛里木湖 → 乌鲁木齐',
    '· 住宿 9 晚：乌市机场 2 + 阿勒泰 1 + 禾木禾盛山庄 1 + 喀纳斯 2（景区内云中歌 + 贾登峪疆峪）+ 布尔津 1 + 克拉玛依 1 + 赛湖潮克星空营地 1'
  ].join('\n');
}

function routeText() {
  const lines = ['【路线一览】'];
  ROUTE.forEach(r => {
    lines.push(`${S(r.day)} ｜ ${S(r.city)} ｜ ${S(r.km)} ｜ ${S(r.note)}`);
  });
  return lines.join('\n');
}

function dayText(d, full) {
  const w = d.wake || {};
  const lines = [];

  lines.push(THIN);
  lines.push(`D${d.id} ｜ ${S(d.date)} ｜ ${S(d.title)}`);
  lines.push(THIN);
  lines.push(`车程：${S(d.drive)}`);
  lines.push(`住宿：${S(d.stay)}`);
  if (w.t) lines.push(`起床：${S(w.t)}${w.label ? '（' + S(w.label) + '）' : ''}`);
  if (full && w.note) lines.push(`备注：${S(w.note)}`);
  lines.push('');
  lines.push(d.alts ? '时间安排（主计划 · 默认）：' : '时间安排：');
  (d.timeline || []).forEach(t => {
    lines.push(`  ${S(t.t)}｜${S(t.d)}${t.nav ? `（导航：${S(t.nav)}）` : ''}`);
  });

  if (Array.isArray(d.nav) && d.nav.length) {
    if (full) {
      lines.push('');
      lines.push('导航目的地（照着搜）：');
      d.nav.forEach((n, i) => lines.push(`  ${i + 1}. 搜「${S(n.to)}」｜${S(n.leg)}｜${S(n.hint)}`));
    } else {
      lines.push(`导航目的地：${d.nav.map(n => `搜「${S(n.to)}」`).join(' → ')}`);
    }
  }

  if (full) {
    if (Array.isArray(d.tips) && d.tips.length) {
      lines.push('');
      lines.push('亲子提示：');
      d.tips.forEach(t => lines.push(`  · ${S(t)}`));
    }
    if (d.food) {
      lines.push('');
      lines.push(`餐食：${S(d.food)}`);
    }
    const alts = d.alts;
    if (alts && Array.isArray(alts.plans) && alts.plans.length) {
      const main = alts.main || {};
      lines.push('');
      lines.push(`【${S(alts.title)}】`);
      lines.push(`  说明：${S(alts.note)}`);
      lines.push(`  前提：${S(alts.warn)}`);
      lines.push('');
      lines.push(`  ▍${S(alts.mainLabel || '主计划')}（默认 · 时间表见上方「时间安排」）`);
      if (main.tag || main.km) lines.push(`    ${[S(main.tag), S(main.km)].filter(Boolean).join(' ｜ ')}`);
      if (main.summary) lines.push(`    ${S(main.summary)}`);
      if (Array.isArray(main.nav) && main.nav.length) {
        lines.push('    导航目的地（照着搜）：');
        main.nav.forEach((n, i) => lines.push(`      ${i + 1}. 搜「${S(n.to)}」｜${S(n.leg)}｜${S(n.hint)}`));
      }
      if (Array.isArray(main.notes) && main.notes.length) {
        lines.push('    必须知道：');
        main.notes.forEach(n => lines.push(`      · ${S(n)}`));
      }
      if (main.verdict) lines.push(`    建议：${S(main.verdict)}`);
      alts.plans.forEach(p => {
        lines.push('');
        lines.push(`  ▍${S(p.label)} ｜ ${[S(p.tag), S(p.km)].filter(Boolean).join(' ｜ ')}`);
        if (p.diff) lines.push(`    差异：${S(p.diff)}`);
        if (p.summary) lines.push(`    ${S(p.summary)}`);
        if (p.wake && p.wake.t) lines.push(`    起床：${S(p.wake.t)}（${S(p.wake.label)}）`);
        if (Array.isArray(p.nav) && p.nav.length) {
          lines.push('    导航目的地（照着搜）：');
          p.nav.forEach((n, i) => lines.push(`      ${i + 1}. 搜「${S(n.to)}」｜${S(n.leg)}｜${S(n.hint)}`));
        }
        lines.push('    时间表（该版本全时段）：');
        (p.timeline || []).forEach(t => {
          lines.push(`      ${S(t.t)}｜${S(t.d)}${t.nav ? `（导航：${S(t.nav)}）` : ''}`);
        });
        if (Array.isArray(p.notes) && p.notes.length) {
          lines.push('    必须知道：');
          p.notes.forEach(n => lines.push(`      · ${S(n)}`));
        }
        if (p.verdict) lines.push(`    建议：${S(p.verdict)}`);
      });
    }
  } else if (d.alts && Array.isArray(d.alts.plans) && d.alts.plans.length) {
    lines.push('');
    lines.push(`可选版本：${S(d.alts.mainLabel)}（默认）/ ${d.alts.plans.map(p => `${S(p.label)}（${S(p.km)}）`).join(' / ')} —— 每版完整时间表与导航目的地见完整版`);
  }
  return lines.join('\n');
}

function ticketsText() {
  const lines = ['【门票速查（旺季参考价）】'];
  TICKETS.forEach(t => {
    lines.push(`· ${S(t.name)} ｜ 成人 ${S(t.adult)} ｜ 儿童 ${S(t.kid)} ｜ ${S(t.bus)}`);
  });
  return lines.join('\n');
}

function prepText() {
  const lines = ['【出发前必办 · 按时间窗口】'];
  PREP.forEach(st => {
    lines.push('');
    lines.push(`▍${S(st.name)}（${S(st.sub)}）`);
    (st.items || []).forEach(it => {
      lines.push(`  □${it.hot ? '★' : ''} ${S(it.t)} —— ${S(it.when)}`);
    });
  });
  return lines.join('\n');
}

function rulesText() {
  const rules = [
    '证件：喀纳斯、禾木属边境管理区，全家身份证原件必带；儿童无身份证需提前办临时身份证明。检查站配合登记，证件放司机随手可取的位置。',
    '加油：阿禾公路 209km 无加油站，阿勒泰出城必须满油；新疆加油站要司机本人实体身份证 + 人脸核验，乘客不能代刷；油表剩 1/3 就加，偏远站备现金。',
    '穿衣：禾木清晨可至 -2°C、赛湖清晨 -5°C，一天温差近 20°C；三层穿法（速干 + 抓绒 + 羽绒）随时增减，帽子手套墨镜必备。',
    '信号：禾木 / 喀纳斯 / 阿禾公路部分路段信号弱，提前下载离线地图与动画片，备 2000 元现金兜底。',
    '限速：阿禾公路全线限速 30、弯道限速 20，路基仅 7.5 米宽；只停 31 处官方观景台，主干道禁停。',
    '错峰：喀纳斯、禾木都在国庆前完成；10/1 人流峰值日在赛里木湖环湖自驾，人流分散，体验远好于排队。',
    '节奏：每天只设 1 个「必须完成」目标，其余是加分项；孩子情绪崩了就就地休息，行程再美也比不上全家心情。',
    '兜底：若阿禾公路临时管制，回退方案为阿勒泰 → 布尔津 → 贾登峪进禾木（多约 1.5 小时）；若返程 10/2 车流大，果断砍大巴扎，航班永远优先。'
  ];
  return ['【全程红线 · 务必记住】', ...rules.map(r => `· ${r}`)].join('\n');
}

function linksText() {
  return [
    '【相关链接】',
    '· 完整图文攻略（含路线地图 / 预算 / 行李清单）：https://yuzhisheng.github.io/xinjiang/',
    '· 本文字版同源地址：https://yuzhisheng.github.io/xinjiang/text.html'
  ].join('\n');
}

// ---------------------------------------------------------------
// 组装
// ---------------------------------------------------------------
export function buildPlainText(mode = 'full') {
  const full = mode === 'full';
  const blocks = [
    headText(),
    overviewText(),
    routeText(),
    '【逐日行程】',
    ...DAYS.map(d => dayText(d, full))
  ];
  if (full) {
    blocks.push(ticketsText());
    blocks.push(prepText());
    blocks.push(rulesText());
    blocks.push(linksText());
  }
  return blocks.join('\n\n') + '\n';
}

// ---------------------------------------------------------------
// 交互：渲染 / 复制 / 下载 / 字号
// ---------------------------------------------------------------
let toastTimer = null;
export function toast(msg) {
  let el = document.getElementById('copyToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'copyToast';
    el.className = 'fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white shadow-2xl transition-opacity duration-300';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    /* 降级到 execCommand */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-2000px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

export function downloadText(text, filename) {
  const blob = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function initPlainText() {
  const pre = document.getElementById('plainText');
  if (!pre) return;

  const stat = document.getElementById('plainStat');
  let mode = 'full';
  let fontSize = 13.5;

  const render = () => {
    const text = buildPlainText(mode);
    pre.textContent = text;
    pre.style.fontSize = fontSize + 'px';
    if (stat) {
      const chars = text.replace(/\s+/g, '').length;
      stat.textContent = `${chars} 字 · ${text.split('\n').length} 行 · ${mode === 'full' ? '完整版' : '精简版'}`;
    }
  };

  const modeBtns = [...document.querySelectorAll('[data-mode]')];
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

  const copyBtn = document.getElementById('copyAll');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(buildPlainText(mode));
      toast(ok ? '已复制全文，去粘贴吧' : '复制失败，请长按选择文本手动复制');
    });
  }

  const dlBtn = document.getElementById('download');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      downloadText(buildPlainText(mode), `北疆10日行程-${mode === 'full' ? '完整版' : '精简版'}.txt`);
      toast('已开始下载 .txt 文件');
    });
  }

  const minus = document.getElementById('fontMinus');
  if (minus) {
    minus.addEventListener('click', () => {
      fontSize = Math.max(12, fontSize - 1);
      render();
    });
  }
  const plus = document.getElementById('fontPlus');
  if (plus) {
    plus.addEventListener('click', () => {
      fontSize = Math.min(20, fontSize + 1);
      render();
    });
  }

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlainText);
} else {
  initPlainText();
}
