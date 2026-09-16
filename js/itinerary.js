import { DAYS, SPOTS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);

const BADGE_STYLE = {
  light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  drive: 'bg-orange-50 text-orange-700 border-orange-200',
  highlight: 'bg-birch/10 text-birch border-birch/30'
};

const WAKE_STYLE = {
  relax: { chip: 'border-emerald-200 bg-emerald-50', time: 'text-emerald-700', pill: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  normal: { chip: 'border-stone-200 bg-stone-50', time: 'text-stone-700', pill: 'border-stone-200 bg-stone-100 text-stone-600' },
  early: { chip: 'border-amber-200 bg-amber-50', time: 'text-amber-700', pill: 'border-amber-200 bg-amber-50 text-amber-700' },
  must: { chip: 'border-rose-200 bg-rose-50', time: 'text-rose-700', pill: 'border-rose-200 bg-rose-50 text-rose-700' },
  flight: { chip: 'border-sky-200 bg-sky-50', time: 'text-sky-700', pill: 'border-sky-200 bg-sky-50 text-sky-700' }
};

const wakeOf = d => d.wake || { t: '—', label: '未标注', note: '', kind: 'normal' };

function dayCard(d) {
  const tagClass = BADGE_STYLE[d.tags[0]] || BADGE_STYLE.highlight;
  const w = wakeOf(d);
  const ws = WAKE_STYLE[w.kind] || WAKE_STYLE.normal;
  return `
  <article data-day="${d.id}" data-tags="${d.tags.join(' ')}"
           class="day-card overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-lg">
    <button data-toggle class="flex w-full items-center gap-4 p-4 text-left lg:gap-6 lg:p-5">
      <div class="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl lg:h-24 lg:w-40">
        <img src="${d.img}" alt="${d.title}" loading="lazy"
             class="h-full w-full object-cover transition duration-500 hover:scale-105">
        <span class="absolute left-1.5 top-1.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-black text-white">D${d.id}</span>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="kbd text-xs font-bold text-stone-400">${d.date}</span>
          <span class="rounded-md border px-2 py-0.5 text-[10px] font-bold ${tagClass}">${d.badge}</span>
          <span class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${ws.pill}">
            <i class="ri-alarm-line"></i>${w.t} 起
          </span>
        </div>
        <h3 class="mt-1.5 truncate text-base font-black lg:text-lg">${d.title}</h3>
        <div class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
          <span class="inline-flex items-center gap-1"><i class="ri-route-line text-birch"></i>${d.drive}</span>
          <span class="inline-flex items-center gap-1 truncate"><i class="ri-hotel-bed-line text-birch"></i>${d.stay}</span>
        </div>
      </div>
      <i data-chev class="ri-add-line shrink-0 text-2xl text-stone-400 transition-transform duration-300"></i>
    </button>
    <div data-body class="hidden border-t border-black/5">
      <div class="grid gap-6 p-5 lg:grid-cols-[1.4fr_1fr] lg:p-7">
        <div>
          <div class="mb-5 flex flex-wrap items-center gap-3 rounded-xl border ${ws.chip} px-4 py-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/70 text-lg ${ws.time}"><i class="ri-alarm-line"></i></span>
            <div class="min-w-0">
              <p class="text-xs font-black text-stone-700">起床 ${w.t} · ${w.label}</p>
              <p class="mt-0.5 text-[11px] leading-snug text-stone-500">${w.note}</p>
            </div>
          </div>
          <h4 class="mb-4 flex items-center gap-2 text-sm font-black text-stone-700">
            <i class="ri-time-line text-birch"></i> 当日时刻安排
          </h4>
          <div class="space-y-0">
            ${d.timeline.map(t => `
              <div class="day-line relative flex gap-4 pb-6">
                <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-birch/30 bg-birch/10">
                  <span class="kbd text-[9px] font-black text-birch">${t.t.replace(':', '')}</span>
                </div>
                <div class="pt-1.5">
                  <div class="kbd text-xs font-black text-birch">${t.t}</div>
                  <p class="mt-1 text-sm leading-relaxed text-stone-600">${t.d}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="space-y-4">
          <div class="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <h4 class="mb-2.5 flex items-center gap-2 text-sm font-black text-amber-800">
              <i class="ri-lightbulb-flash-line"></i> 亲子提示
            </h4>
            <ul class="space-y-2">
              ${d.tips.map(t => `<li class="flex gap-2 text-xs leading-relaxed text-amber-900/85"><i class="ri-check-line mt-0.5 shrink-0 text-amber-600"></i><span>${t}</span></li>`).join('')}
            </ul>
          </div>
          <div class="rounded-xl border border-black/5 bg-stone-50 p-4">
            <h4 class="mb-2 flex items-center gap-2 text-sm font-black text-stone-700">
              <i class="ri-restaurant-line text-pine"></i> 餐食推荐
            </h4>
            <p class="text-xs leading-relaxed text-stone-600">${d.food}</p>
          </div>
          <div class="rounded-xl border border-black/5 bg-stone-50 p-4">
            <h4 class="mb-2 flex items-center gap-2 text-sm font-black text-stone-700">
              <i class="ri-hotel-bed-line text-pine"></i> 住宿
            </h4>
            <p class="text-xs leading-relaxed text-stone-600">${d.stay}</p>
          </div>
        </div>
      </div>
    </div>
  </article>`;
}

function renderWakeOverview() {
  const box = $('#wakeOverview');
  if (!box) return;
  const chips = DAYS.map(d => {
    const w = wakeOf(d);
    const ws = WAKE_STYLE[w.kind] || WAKE_STYLE.normal;
    return `
      <div class="flex items-center gap-3 rounded-xl border ${ws.chip} px-3 py-2.5">
        <span class="kbd shrink-0 text-base font-black ${ws.time}">${w.t}</span>
        <div class="min-w-0">
          <p class="truncate text-[11px] font-black text-stone-700">D${d.id} · ${d.date.slice(0, 5)} · ${w.label}</p>
          <p class="truncate text-[10px] text-stone-500">${w.note}</p>
        </div>
      </div>`;
  }).join('');

  box.innerHTML = `
    <div class="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:p-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 class="flex items-center gap-2 text-sm font-black text-stone-700"><i class="ri-alarm-line text-birch"></i> 起床时间总览 · 默认 8:00，不早起</h3>
          <p class="mt-1 text-[11px] leading-relaxed text-stone-500">只有"要排队"或"看晨雾/日出"的早晨才提前：<span class="font-bold text-rose-600">红 = 为景色早起</span> · <span class="font-bold text-amber-600">橙 = 避堵早半小时</span> · <span class="font-bold text-emerald-600">绿 = 自然醒</span> · <span class="font-bold text-sky-600">蓝 = 航班规定</span></p>
        </div>
        <span class="rounded-lg bg-stone-100 px-3 py-1.5 text-[11px] font-bold text-stone-600">10 个早晨：5 天 8:00 及以后起 · 3 天为景色早起</span>
      </div>
      <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">${chips}</div>
    </div>`;
}

export function renderDays() {
  const box = $('#days');
  if (!box) return;
  renderWakeOverview();
  box.innerHTML = DAYS.map(dayCard).join('');

  const toggle = card => {
    const body = card.querySelector('[data-body]');
    const chev = card.querySelector('[data-chev]');
    const open = !body.classList.contains('hidden');
    body.classList.toggle('hidden', open);
    chev.classList.toggle('rotate-45', !open);
    chev.classList.toggle('text-birch', !open);
  };

  box.addEventListener('click', e => {
    const btn = e.target.closest('[data-toggle]');
    if (!btn) return;
    toggle(btn.closest('.day-card'));
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => {
        const on = b === btn;
        b.className = on
          ? 'filter-btn rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white'
          : 'filter-btn rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-birch hover:text-birch';
      });
      document.querySelectorAll('.day-card').forEach(c => {
        const show = f === 'all' || (c.dataset.tags || '').split(' ').includes(f);
        c.classList.toggle('hidden', !show);
      });
    });
  });

  const expand = $('#expandAll');
  let allOpen = false;
  expand.addEventListener('click', () => {
    allOpen = !allOpen;
    document.querySelectorAll('.day-card').forEach(c => {
      const body = c.querySelector('[data-body]');
      const chev = c.querySelector('[data-chev]');
      body.classList.toggle('hidden', !allOpen);
      chev.classList.toggle('rotate-45', allOpen);
      chev.classList.toggle('text-birch', allOpen);
    });
    expand.innerHTML = allOpen
      ? '<i class="ri-contract-up-down-line"></i> 全部收起'
      : '<i class="ri-expand-up-down-line"></i> 全部展开';
  });
}

const LEVEL_STYLE = {
  '易': 'bg-emerald-100 text-emerald-700',
  '中': 'bg-amber-100 text-amber-700',
  '难': 'bg-red-100 text-red-700'
};

export function renderSpots() {
  const grid = $('#spotGrid');
  if (!grid) return;
  grid.innerHTML = SPOTS.map(s => `
    <article class="card-hover group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div class="relative h-44 overflow-hidden">
        <img src="${s.img}" alt="${s.name}" loading="lazy"
             class="h-full w-full object-cover transition duration-700 group-hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <span class="absolute right-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-black text-stone-700">${s.area}</span>
        <h3 class="absolute bottom-2.5 left-3 right-3 text-base font-black text-white drop-shadow">${s.name}</h3>
      </div>
      <div class="p-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-md px-2 py-0.5 text-[10px] font-bold ${LEVEL_STYLE[s.level]}">强度 ${s.level}</span>
          <span class="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
            <i class="ri-time-line"></i>${s.hours}
          </span>
          <span class="ml-auto text-[11px] tracking-tight text-birch">${'★'.repeat(s.kid)}${'☆'.repeat(5 - s.kid)}</span>
        </div>
        <p class="mt-3 text-xs leading-relaxed text-stone-600">${s.desc}</p>
      </div>
    </article>
  `).join('');
}
