import { BUDGET, TICKETS, TRANSPORT, PACK, FOODS, TIPS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const STORE_KEY = 'kanas_pack_2026';

export function renderBudget() {
  const bars = $('#budgetBars');
  const total = BUDGET.reduce((a, b) => a + b.amount, 0);
  const max = Math.max(...BUDGET.map(b => b.amount));

  bars.innerHTML = BUDGET.map(b => `
    <div>
      <div class="flex items-baseline justify-between">
        <span class="text-sm font-bold text-stone-700">${b.item}</span>
        <span class="kbd text-sm font-black text-ink">¥${b.amount.toLocaleString()}</span>
      </div>
      <div class="mt-2 h-3 overflow-hidden rounded-full bg-stone-200">
        <div class="bar-fill h-full rounded-full" data-w="${Math.round(b.amount / max * 100)}"
             style="width:0;background:${b.color}"></div>
      </div>
      <div class="mt-1.5 flex justify-between text-[11px] text-stone-500">
        <span>${b.note}</span>
        <span class="kbd shrink-0 pl-3 font-bold">${(b.amount / total * 100).toFixed(0)}%</span>
      </div>
    </div>
  `).join('');

  const el = $('#budgetTotal');
  let n = 0;
  const step = total / 45;
  const tick = setInterval(() => {
    n += step;
    if (n >= total) { n = total; clearInterval(tick); }
    el.textContent = '¥' + Math.round(n).toLocaleString();
  }, 22);

  $('#ticketTable').innerHTML = TICKETS.map(t => `
    <div class="flex items-center gap-3 rounded-lg bg-stone-50 px-3 py-2.5">
      <span class="min-w-0 flex-1 truncate font-semibold text-stone-700">${t.name}</span>
      <span class="kbd shrink-0 font-black text-birch">${t.adult}</span>
      <span class="hidden shrink-0 text-[11px] text-stone-500 sm:block">${t.bus}</span>
    </div>
    <div class="px-3 pb-1 text-[11px] text-stone-400">儿童：${t.kid}</div>
  `).join('');

  $('#transportCards').innerHTML = TRANSPORT.map(t => `
    <div class="rounded-xl border ${t.best ? 'border-birch/40 bg-birch/5' : 'border-black/5 bg-stone-50'} p-4">
      <div class="flex items-center justify-between">
        <h4 class="font-black text-stone-800">${t.title}</h4>
        <span class="kbd text-xs font-bold text-birch">${t.price}</span>
      </div>
      <p class="mt-2 flex gap-1.5 text-xs leading-relaxed text-emerald-700"><i class="ri-thumb-up-line mt-0.5 shrink-0"></i><span>${t.pros}</span></p>
      <p class="mt-1.5 flex gap-1.5 text-xs leading-relaxed text-stone-500"><i class="ri-error-warning-line mt-0.5 shrink-0"></i><span>${t.cons}</span></p>
    </div>
  `).join('');
}

export function renderPack() {
  const grid = $('#packGrid');
  const all = PACK.flatMap(g => g.items);
  let checked = new Set();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) checked = new Set(JSON.parse(raw));
  } catch (e) { checked = new Set(); }

  const paint = () => {
    const n = all.filter(i => checked.has(i)).length;
    $('#packCount').textContent = `${n}/${all.length}`;
    $('#packBar').style.width = (n / all.length * 100) + '%';
  };

  grid.innerHTML = PACK.map(g => `
    <div class="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <h3 class="mb-4 flex items-center gap-2 font-black text-stone-800">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-birch/15 text-birch"><i class="${g.icon}"></i></span>
        ${g.group}
      </h3>
      <div class="space-y-1">
        ${g.items.map(it => `
          <label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-stone-50">
            <input type="checkbox" data-pack="${it}" ${checked.has(it) ? 'checked' : ''}
                   class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-birch">
            <span class="pack-label text-xs leading-relaxed ${checked.has(it) ? 'text-stone-400 line-through' : 'text-stone-600'}">${it}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  grid.addEventListener('change', e => {
    const cb = e.target.closest('[data-pack]');
    if (!cb) return;
    const key = cb.dataset.pack;
    if (cb.checked) checked.add(key); else checked.delete(key);
    const label = cb.parentElement.querySelector('.pack-label');
    label.className = `pack-label text-xs leading-relaxed ${cb.checked ? 'text-stone-400 line-through' : 'text-stone-600'}`;
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...checked])); } catch (err) {}
    paint();
  });

  $('#packReset').addEventListener('click', () => {
    checked.clear();
    try { localStorage.removeItem(STORE_KEY); } catch (err) {}
    grid.querySelectorAll('[data-pack]').forEach(cb => {
      cb.checked = false;
      cb.parentElement.querySelector('.pack-label').className = 'pack-label text-xs leading-relaxed text-stone-600';
    });
    paint();
  });

  paint();
}

export function renderFood() {
  $('#foodGrid').innerHTML = FOODS.map(f => `
    <article class="card-hover group flex gap-4 overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div class="h-28 w-24 shrink-0 overflow-hidden rounded-xl">
        <img src="${f.img}" alt="${f.name}" loading="lazy"
             class="h-full w-full object-cover transition duration-500 group-hover:scale-110">
      </div>
      <div class="min-w-0">
        <h3 class="font-black text-stone-800">${f.name}</h3>
        <p class="mt-1 flex items-center gap-1 text-[11px] text-stone-500"><i class="ri-map-pin-line text-birch"></i>${f.where}</p>
        <p class="mt-1.5 inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">${f.kid}</p>
        <p class="mt-2 text-xs leading-relaxed text-stone-600">${f.desc}</p>
      </div>
    </article>
  `).join('');
}

export function renderTips() {
  const cats = [...new Set(TIPS.map(t => t.cat))];
  const tabs = $('#tipTabs');
  const panel = $('#tipPanel');

  const paint = cat => {
    const list = cat === '全部' ? TIPS : TIPS.filter(t => t.cat === cat);
    panel.innerHTML = list.map(t => `
      <div class="fade-up in rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-birch/40 hover:bg-white/10">
        <div class="flex items-center gap-2">
          <i class="${t.icon} text-xl text-birch"></i>
          <span class="text-[10px] font-bold uppercase tracking-wider text-white/45">${t.cat}</span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-white/85">${t.text}</p>
      </div>
    `).join('');
  };

  const btnCls = on => on
    ? 'rounded-lg bg-birch px-4 py-2 text-sm font-bold text-white'
    : 'rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-birch hover:text-white';

  const items = ['全部', ...cats];
  tabs.innerHTML = items.map((c, i) => `<button data-cat="${c}" class="${btnCls(i === 0)}">${c}</button>`).join('');

  tabs.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    tabs.querySelectorAll('[data-cat]').forEach(x => { x.className = btnCls(x === b); });
    paint(b.dataset.cat);
  });

  paint('全部');
}
