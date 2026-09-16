import { DAYS, SPOTS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);

const BADGE_STYLE = {
  light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  drive: 'bg-orange-50 text-orange-700 border-orange-200',
  highlight: 'bg-birch/10 text-birch border-birch/30'
};

function dayCard(d) {
  const tagClass = BADGE_STYLE[d.tags[0]] || BADGE_STYLE.highlight;
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

export function renderDays() {
  const box = $('#days');
  if (!box) return;
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
