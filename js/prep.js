import { PREP, PREP_META } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const STORE_KEY = 'kanas_prep_2026_v1';

const allItems = () => PREP.flatMap(g => g.items);

let done = new Set();
try {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) done = new Set(JSON.parse(raw));
} catch (e) {
  done = new Set();
}

const save = () => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...done])); } catch (e) { /* 隐私模式下静默忽略 */ }
};

function renderCountdown() {
  const el = $('#prepCountdown');
  if (!el) return;

  const depart = new Date(PREP_META.departISO);
  const now = new Date();
  const ms = depart - now;
  const days = Math.ceil(ms / 86400000);

  let big;
  let small;
  if (days > 1) {
    big = days + ' 天';
    small = '距 ' + PREP_META.departLabel + ' 出发';
  } else if (days === 1) {
    big = '明天';
    small = '出发日就在眼前 · 请复核全部待办';
  } else if (ms > 0) {
    big = '今天';
    small = '今晚起飞 · 按清单逐项核对';
  } else {
    big = '进行中';
    small = '行程已开始，注意途中关键动作';
  }

  el.innerHTML = `
    <div class="flex items-center gap-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4">
      <div class="text-center">
        <div class="kbd text-3xl font-black leading-none text-amber-300">${big}</div>
        <div class="mt-1.5 text-[11px] text-white/60">${small}</div>
      </div>
      <div class="h-12 w-px shrink-0 bg-white/15"></div>
      <p class="max-w-[230px] text-[11px] leading-relaxed text-white/65">${PREP_META.reserveNote}</p>
    </div>`;
}

function itemHtml(it) {
  const checked = done.has(it.t);
  const border = checked
    ? 'border-white/5 bg-white/[.03] opacity-60'
    : it.hot
      ? 'border-red-400/40 bg-red-500/10 hover:border-red-400/70'
      : 'border-white/10 bg-white/[.04] hover:border-white/25';
  const whenColor = it.hot ? 'text-red-300' : 'text-amber-300';
  return `
  <label class="block cursor-pointer rounded-xl border p-3.5 transition ${border}">
    <div class="flex items-start gap-3">
      <input type="checkbox" data-prep="${encodeURIComponent(it.t)}" ${checked ? 'checked' : ''}
             class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-amber-400">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="prep-title text-sm font-bold leading-snug ${checked ? 'text-white/40 line-through' : 'text-white'}">${it.t}</span>
          ${it.hot && !checked ? '<span class="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">最紧张</span>' : ''}
        </div>
        <p class="mt-1.5 flex gap-1.5 text-[11px] font-semibold ${whenColor}">
          <i class="ri-time-line mt-px shrink-0"></i><span>${it.when}</span>
        </p>
        <p class="mt-1 flex gap-1.5 text-xs leading-relaxed text-white/70">
          <i class="ri-tools-line mt-0.5 shrink-0 text-white/35"></i><span>${it.how}</span>
        </p>
        <p class="mt-1 flex gap-1.5 text-[11px] leading-relaxed text-white/45">
          <i class="ri-question-line mt-px shrink-0"></i><span>${it.why}</span>
        </p>
      </div>
    </div>
  </label>`;
}

function stageHtml(g) {
  const total = g.items.length;
  const n = g.items.filter(i => done.has(i.t)).length;
  const pct = total ? Math.round(n / total * 100) : 0;
  return `
  <div class="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5">
    <div class="flex items-center gap-3">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style="background:${g.accent}22;color:${g.accent}">
        <i class="${g.icon} text-xl"></i>
      </span>
      <div class="min-w-0">
        <h3 class="font-black text-white">${g.name}</h3>
        <p class="truncate text-[11px] text-white/50">${g.sub}</p>
      </div>
    </div>
    <div class="mt-3.5 flex items-center gap-2">
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div class="h-full rounded-full transition-all duration-500"
             style="width:${pct}%;background:${g.accent}"></div>
      </div>
      <span class="kbd text-[11px] font-bold text-white/60">${n}/${total}</span>
    </div>
    <div class="mt-4 space-y-3">
      ${g.items.map(itemHtml).join('')}
    </div>
  </div>`;
}

function paintTotal() {
  const all = allItems();
  const n = all.filter(i => done.has(i.t)).length;
  const bar = $('#prepTotalBar');
  const cnt = $('#prepTotalCount');
  if (bar) bar.style.width = (all.length ? n / all.length * 100 : 0) + '%';
  if (cnt) cnt.textContent = `${n}/${all.length}`;
}

export function renderPrep() {
  const grid = $('#prepGrid');
  if (!grid) return;

  renderCountdown();

  const paint = () => {
    grid.innerHTML = PREP.map(stageHtml).join('');
    paintTotal();
  };

  grid.addEventListener('change', e => {
    const cb = e.target.closest('[data-prep]');
    if (!cb) return;
    const key = decodeURIComponent(cb.dataset.prep);
    if (cb.checked) done.add(key); else done.delete(key);
    save();
    paint();
  });

  const reset = $('#prepReset');
  if (reset) {
    reset.addEventListener('click', () => {
      done.clear();
      save();
      paint();
    });
  }

  paint();
}
