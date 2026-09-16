import { MAP_STOPS, MAP_LEGS, MAP_LABELS, MAP_TYPE_STYLE, AMAP_CONFIG } from './mapdata.js';
import { ROUTE_SHAPES } from './routeshapes.js';

const $ = (s, r = document) => r.querySelector(s);

const KEY_PLACEHOLDER = 'PUT_YOUR_AMAP_KEY_HERE';

// 分段线路样式：route 常规自驾段 / ahe 阿禾公路高亮 / bus 景区区间车（示意）
// weight 为公路线宽度，绘制时会先铺一层更宽的白色"路肩"，形成加粗公路的观感
const LEG_STYLE = {
  route: { color: '#c8a04a', weight: 7, casing: 5 },
  ahe: { color: '#2f5d50', weight: 9, casing: 5.5 },
  bus: { color: '#3b7ea1', weight: 4, casing: 3, dash: [8, 10] }
};

// 把固化的 "lng,lat;lng,lat" 路径点解析成高德 Polyline 需要的坐标数组
function parseShape(uid) {
  const raw = ROUTE_SHAPES[uid];
  if (typeof raw !== 'string' || !raw) return null;
  const path = [];
  raw.split(';').forEach(pair => {
    const parts = pair.split(',');
    if (parts.length !== 2) return;
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) path.push([lng, lat]);
  });
  return path.length > 1 ? path : null;
}

const stopByUid = uid => MAP_STOPS.find(s => s.uid === uid);

function markerHtml(stop) {
  const st = MAP_TYPE_STYLE[stop.type] || MAP_TYPE_STYLE.spot;
  const long = stop.day.length > 3;
  return `
    <div class="amap-pin flex flex-col items-center">
      <div class="grid h-8 ${long ? 'min-w-[48px] px-1.5' : 'w-8'} place-items-center rounded-full border-2 border-white text-white shadow-lg"
           style="background:${st.color}">
        <span class="text-[10px] font-black leading-none">${stop.day}</span>
      </div>
      <div class="mt-0.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
           style="background:rgba(28,25,23,.82)">${stop.name}</div>
    </div>`;
}

function infoHtml(stop) {
  const st = MAP_TYPE_STYLE[stop.type] || MAP_TYPE_STYLE.spot;
  return `
    <div class="w-[230px] p-3.5">
      <div class="mb-1.5 flex items-center gap-2">
        <span class="rounded px-1.5 py-0.5 text-[10px] font-black text-white"
              style="background:${st.color}">${stop.day}</span>
        <strong class="text-[15px] text-stone-900">${stop.name}</strong>
      </div>
      <div class="mb-1.5 text-[11px] font-bold text-birch">${stop.sub}</div>
      <p class="mb-2 text-xs leading-relaxed text-stone-600">${stop.desc}</p>
      <div class="border-t border-stone-200 pt-1.5 text-[11px] text-stone-500">
        <i class="ri-hotel-bed-line"></i> 住宿：${stop.stay}
      </div>
    </div>`;
}

function loadAMap() {
  return new Promise((resolve, reject) => {
    if (window.AMap) return resolve(window.AMap);
    if (!AMAP_CONFIG.key || AMAP_CONFIG.key === KEY_PLACEHOLDER) {
      return reject(new Error('NO_KEY'));
    }
    window._AMapSecurityConfig = { securityJsCode: AMAP_CONFIG.securityJsCode };
    const s = document.createElement('script');
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_CONFIG.key}`;
    s.async = true;
    s.onload = () => (window.AMap ? resolve(window.AMap) : reject(new Error('LOAD_FAIL')));
    s.onerror = () => reject(new Error('LOAD_FAIL'));
    document.head.appendChild(s);
  });
}

function showFallback(host, err) {
  const isKey = err && err.message === 'NO_KEY';
  host.innerHTML = `
    <div class="flex h-full flex-col items-center justify-center gap-3 bg-stone-100 px-6 text-center">
      <i class="ri-map-2-line text-4xl text-stone-400"></i>
      <p class="text-sm font-bold text-stone-700">
        ${isKey ? '尚未配置高德地图 Key' : '高德地图加载失败'}
      </p>
      <p class="max-w-md text-xs leading-relaxed text-stone-500">
        ${isKey
          ? '请在 <span class="kbd font-bold text-birch">js/mapdata.js</span> 的 AMAP_CONFIG 中填入你的 Key 与安全密钥。免费申请：console.amap.com → 应用管理 → 创建应用 → 添加Key，服务平台选「Web端(JS API)」。'
          : '请检查 Key 是否有效、是否已配置 securityJsCode，以及域名白名单设置。'}
      </p>
      <p class="text-[11px] text-stone-400">下方「分段车程明细」与右侧站点列表不受影响，仍可正常查看。</p>
    </div>`;
}

function renderSideList(onPick) {
  const list = $('#mapStopList');
  if (!list) return;

  list.innerHTML = MAP_STOPS.filter(s => s.type !== 'end').map(s => {
    const st = MAP_TYPE_STYLE[s.type] || MAP_TYPE_STYLE.spot;
    const long = s.day.length > 3;
    return `
    <button data-stop="${s.uid}"
            class="stop-btn flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-birch/40 hover:bg-birch/5">
      <span class="grid h-7 ${long ? 'min-w-[44px] px-1' : 'w-7'} shrink-0 place-items-center rounded-lg text-[10px] font-black text-white"
            style="background:${st.color}">${s.day}</span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-bold text-stone-800">${s.name}</span>
        <span class="block truncate text-[11px] text-stone-500">${s.sub}</span>
      </span>
      <i class="${st.icon} shrink-0 text-base" style="color:${st.color}"></i>
    </button>`;
  }).join('');

  list.addEventListener('click', e => {
    const btn = e.target.closest('[data-stop]');
    if (!btn) return;
    list.querySelectorAll('.stop-btn').forEach(b => {
      b.classList.toggle('border-birch/40', b === btn);
      b.classList.toggle('bg-birch/5', b === btn);
    });
    if (typeof onPick === 'function') onPick(btn.dataset.stop);
  });
}

function renderLegend() {
  const el = $('#mapLegend');
  if (!el) return;
  const stops = Object.values(MAP_TYPE_STYLE).map(st => `
    <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
      <span class="h-3 w-3 rounded-full" style="background:${st.color}"></span>${st.label}
    </span>
  `).join('');
  const legs = `
    <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
      <span class="h-2.5 w-7 rounded-full ring-1 ring-black/10" style="background:${LEG_STYLE.route.color}"></span>自驾公路线
    </span>
    <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
      <span class="h-2.5 w-7 rounded-full ring-1 ring-black/10" style="background:${LEG_STYLE.ahe.color}"></span>阿禾公路 G681
    </span>
    <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
      <span class="h-2.5 w-7 rounded-full ring-1 ring-black/10" style="background:${LEG_STYLE.bus.color}"></span>景区区间车
    </span>`;
  el.innerHTML = stops + legs;
}

function renderLegs() {
  const total = MAP_LEGS.filter(l => l.color !== 'bus').reduce((a, b) => a + b.km, 0);
  const totalEl = $('#legTotal');
  if (totalEl) totalEl.textContent = total.toLocaleString() + ' km';

  const table = $('#legTable');
  if (!table) return;
  const max = Math.max(...MAP_LEGS.map(x => x.km));
  table.innerHTML = MAP_LEGS.map(l => {
    const from = stopByUid(l.from);
    const to = stopByUid(l.to);
    if (!from || !to) return '';
    const pct = Math.round(l.km / max * 100);
    const barColor = l.color === 'ahe' ? 'from-pine to-emerald-500'
      : l.color === 'bus' ? 'from-sky2 to-sky-400' : 'from-birch to-amber-550';
    const tagColor = l.color === 'ahe' ? 'bg-pine/10 text-pine'
      : l.color === 'bus' ? 'bg-sky2/10 text-sky2' : 'bg-birch/10 text-birch';
    return `
    <div class="rounded-xl border ${l.color === 'ahe' ? 'border-pine/25 bg-pine/5' : 'border-black/5 bg-white'} p-3.5">
      <div class="flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black ${tagColor}">${l.day}</span>
          <span class="min-w-0 truncate text-xs font-bold text-stone-700">${from.name} → ${to.name}</span>
        </span>
        <span class="kbd shrink-0 text-xs font-black text-birch">${l.km}km</span>
      </div>
      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div class="bar-fill h-full rounded-full bg-gradient-to-r ${barColor}" style="width:0" data-w="${pct}"></div>
      </div>
      <div class="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-stone-500">
        <span class="min-w-0 truncate">${l.note}</span>
        <span class="kbd shrink-0 pl-2 font-bold text-pine">${l.hours}</span>
      </div>
    </div>`;
  }).join('');
}

function buildMap(AMap, host) {
  const map = new AMap.Map(host, {
    zoom: 6,
    center: [87.3, 46.8],
    viewMode: '2D',
    mapStyle: 'amap://styles/whitesmoke',
    scrollWheel: false
  });

  // 绘制加粗公路线：先铺一层更宽的白色"路肩"，再叠主色路面
  // 阿禾公路段更粗更醒目；景区区间车段用虚线区分
  const drawLeg = (leg, path) => {
    const st = LEG_STYLE[leg.color] || LEG_STYLE.route;
    new AMap.Polyline({
      path, map, strokeColor: '#ffffff', strokeWeight: st.weight + st.casing,
      strokeOpacity: 0.95, lineJoin: 'round', lineCap: 'round', zIndex: 48
    });
    new AMap.Polyline({
      path, map, strokeColor: st.color, strokeWeight: st.weight,
      strokeOpacity: 1, lineJoin: 'round', lineCap: 'round',
      strokeStyle: st.dash ? 'dashed' : 'solid',
      strokeDasharray: st.dash || undefined,
      showDir: !st.dash, zIndex: 50
    });
  };

  const info = new AMap.InfoWindow({
    isCustom: false, offset: new AMap.Pixel(0, -42), autoMove: true
  });

  const markers = new Map();
  MAP_STOPS.forEach(stop => {
    if (stop.type === 'end') return;
    const mk = new AMap.Marker({
      position: [stop.lng, stop.lat],
      content: markerHtml(stop),
      offset: new AMap.Pixel(-20, -40),
      zIndex: 110,
      map
    });
    mk.on('click', () => {
      info.setContent(infoHtml(stop));
      info.open(map, [stop.lng, stop.lat]);
    });
    markers.set(stop.uid, { stop, mk });
  });

  // 线路名小标签（阿禾公路等）
  MAP_LABELS.forEach(l => {
    new AMap.Text({
      text: l.name,
      position: [l.lng, l.lat],
      offset: new AMap.Pixel(0, -14),
      style: {
        'background': 'rgba(255,255,255,.94)',
        'border': '1px solid rgba(28,25,23,.12)',
        'border-radius': '8px',
        'padding': '2px 8px',
        'font-size': '11px',
        'font-weight': '700',
        'color': '#57534e',
        'box-shadow': '0 2px 8px rgba(28,25,23,.14)'
      },
      map
    });
  });

  map.setFitView(null, false, [60, 60, 60, 60]);

  // 直接用固化的真实公路路径点绘制：加载即出线，不再依赖在线导航接口
  MAP_LEGS.forEach(leg => {
    const from = stopByUid(leg.from);
    const to = stopByUid(leg.to);
    if (!from || !to) return;
    const shape = parseShape(leg.uid);
    const path = shape || [[from.lng, from.lat], [to.lng, to.lat]];
    drawLeg(leg, path);
  });

  host.addEventListener('click', () => map.setStatus({ scrollWheel: true }));
  host.addEventListener('mouseleave', () => map.setStatus({ scrollWheel: false }));

  const resetBtn = $('#mapReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      info.close();
      map.setFitView(null, false, [60, 60, 60, 60]);
      document.querySelectorAll('#mapStopList .stop-btn').forEach(b => {
        b.classList.remove('border-birch/40', 'bg-birch/5');
      });
    });
  }

  return { map, markers, info };
}

export function renderMap() {
  const host = $('#mapCanvas');
  if (!host) return;

  renderLegend();
  renderLegs();

  let ctx = null;
  renderSideList(uid => {
    if (!ctx) return;
    const hit = ctx.markers.get(uid);
    if (!hit) return;
    ctx.map.setZoomAndCenter(9, [hit.stop.lng, hit.stop.lat], false, 600);
    ctx.info.setContent(infoHtml(hit.stop));
    ctx.info.open(ctx.map, [hit.stop.lng, hit.stop.lat]);
  });

  loadAMap()
    .then(AMap => { ctx = buildMap(AMap, host); })
    .catch(err => showFallback(host, err));
}
