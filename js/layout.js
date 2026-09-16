import { NAV, HERO_SLIDES, HERO_STATS, ROUTE, DRIVE_BARS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);

export function renderNav() {
  const links = $('#navlinks');
  const mobile = $('#mobileMenu');
  if (!links || !mobile) return;

  links.innerHTML = NAV.map(n => `
    <a href="#${n.id}" data-nav="${n.id}"
       class="nav-link rounded-lg px-3.5 py-2 text-white/85 transition hover:bg-white/15 hover:text-white">${n.label}</a>
  `).join('');

  mobile.innerHTML = `<div class="space-y-1 px-5 py-4">${NAV.map(n => `
    <a href="#${n.id}" data-mobile-nav
       class="block rounded-lg px-4 py-3 font-semibold text-stone-700 transition hover:bg-birch/10 hover:text-birch">${n.label}</a>
  `).join('')}</div>`;

  $('#menuBtn').addEventListener('click', () => mobile.classList.toggle('hidden'));
  mobile.addEventListener('click', e => {
    if (e.target.closest('[data-mobile-nav]')) mobile.classList.add('hidden');
  });

  const nav = $('#nav');
  const brand = $('#brand');
  const onScroll = () => {
    const solid = window.scrollY > 80;
    nav.classList.toggle('bg-white/95', solid);
    nav.classList.toggle('backdrop-blur', solid);
    nav.classList.toggle('shadow-md', solid);
    brand.classList.toggle('text-white', !solid);
    brand.classList.toggle('text-ink', solid);
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('text-white/85', !solid);
      a.classList.toggle('hover:bg-white/15', !solid);
      a.classList.toggle('text-stone-600', solid);
      a.classList.toggle('hover:bg-birch/10', solid);
      a.classList.toggle('hover:text-birch', solid);
    });
    $('#toTop').classList.toggle('hidden', window.scrollY < 600);
    $('#toTop').classList.toggle('grid', window.scrollY >= 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

export function renderHero() {
  const box = $('#heroSlides');
  const dots = $('#heroDots');
  if (!box || !dots) return;

  box.innerHTML = HERO_SLIDES.map((src, i) => `
    <div class="hero-slide absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === 0 ? 'opacity-100' : 'opacity-0'}"
         style="background-image:url('${src}')"></div>
  `).join('');

  dots.innerHTML = HERO_SLIDES.map((_, i) => `
    <button data-dot="${i}" class="h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-birch' : 'w-2 bg-white/50'}"></button>
  `).join('');

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dotEls = [...dots.querySelectorAll('[data-dot]')];
  let cur = 0;
  let timer = null;

  const go = i => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('opacity-100', k === cur);
      s.classList.toggle('opacity-0', k !== cur);
    });
    dotEls.forEach((d, k) => {
      d.className = `h-2 rounded-full transition-all duration-300 ${k === cur ? 'w-8 bg-birch' : 'w-2 bg-white/50'}`;
    });
  };
  const start = () => { timer = setInterval(() => go(cur + 1), 5000); };
  const stop = () => clearInterval(timer);

  dots.addEventListener('click', e => {
    const b = e.target.closest('[data-dot]');
    if (!b) return;
    stop(); go(Number(b.dataset.dot)); start();
  });
  start();

  const stats = $('#heroStats');
  stats.innerHTML = HERO_STATS.map(s => `
    <div class="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
      <i class="${s.icon} text-2xl text-birch"></i>
      <div class="mt-2 text-xl font-black text-white">${s.value}</div>
      <div class="mt-1 text-[11px] leading-snug text-white/70">${s.label}</div>
    </div>
  `).join('');
}

export function renderRoute() {
  const map = $('#routeMap');
  const bars = $('#routeBars');
  if (!map || !bars) return;

  map.innerHTML = ROUTE.map((r, i) => `
    <div class="flex items-center gap-3 shrink-0">
      <div class="card-hover w-44 rounded-2xl border border-black/5 bg-stone-50 p-4">
        <div class="flex items-center justify-between">
          <span class="rounded-md bg-birch/15 px-2 py-0.5 text-xs font-black text-birch">${r.day}</span>
          <i class="${r.icon} text-lg text-stone-400"></i>
        </div>
        <div class="mt-2.5 font-bold leading-tight">${r.city}</div>
        <div class="mt-1 text-[11px] leading-snug text-stone-500">${r.note}</div>
        <div class="mt-2.5 kbd text-xs font-bold text-pine">${r.km}</div>
      </div>
      ${i < ROUTE.length - 1 ? '<i class="ri-arrow-right-s-line shrink-0 text-2xl text-stone-300"></i>' : ''}
    </div>
  `).join('');

  bars.innerHTML = DRIVE_BARS.map(b => `
    <div class="rounded-2xl border border-black/5 bg-stone-50 p-5">
      <div class="flex items-baseline justify-between">
        <span class="text-sm font-semibold text-stone-600">${b.label}</span>
        <span class="text-lg font-black text-ink">${b.value}</span>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
        <div class="bar-fill h-full rounded-full bg-gradient-to-r from-birch to-amber-550" style="width:0" data-w="${b.pct}"></div>
      </div>
      <p class="mt-2.5 text-[11px] leading-snug text-stone-500">${b.hint}</p>
    </div>
  `).join('');
}
