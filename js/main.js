import { renderNav, renderHero, renderRoute } from './layout.js';
import { renderDays, renderSpots } from './itinerary.js';
import { renderBudget, renderPack, renderFood, renderTips } from './sections.js';
import { renderMap } from './map.js';
import { renderPrep } from './prep.js';

function observeReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('section > div > *, .day-card, article').forEach(el => {
    if (el.closest('#map') || el.id === 'mapCanvas') return;
    el.classList.add('fade-up');
    io.observe(el);
  });

  const bars = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.style.width = (en.target.dataset.w || 0) + '%';
      bars.unobserve(en.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.bar-fill').forEach(b => bars.observe(b));
}

function init() {
  renderNav();
  renderHero();
  renderPrep();
  renderMap();
  renderRoute();
  renderDays();
  renderSpots();
  renderBudget();
  renderPack();
  renderFood();
  renderTips();
  observeReveal();
  document.documentElement.dataset.appBooted = '1';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
