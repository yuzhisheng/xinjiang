// ===================================================================
// PDF 导出模块（纯前端 · 无需后端、无需打印窗口）
// 思路：整篇文档先规划 A4 分页切点，再「一页只渲染一张画布」，
//       最后用 jsPDF 拼成多页 PDF。长文档也不会撑爆浏览器内存
//       （整篇一次性截图再切页的库，在长文档上很容易失败）。
// · html2canvas / jsPDF 按需从 CDN 动态加载，一条线路不通自动换下一条
// · 分页切点取「块级元素分界点」，不会把一行文字拦腰截断
// ===================================================================

const PX_PER_MM = 96 / 25.4;                        // CSS 96dpi：1mm ≈ 3.7795px
const MARGIN = [12, 11, 13, 11];                    // 上 / 左 / 下 / 右（mm）
const CONTENT_W_MM = 210 - MARGIN[1] - MARGIN[3];   // 188mm
const CONTENT_H_MM = 297 - MARGIN[0] - MARGIN[2];   // 272mm
const CONTENT_W_PX = CONTENT_W_MM * PX_PER_MM;      // ≈ 710.55px
const PAGE_H_PX = CONTENT_H_MM * PX_PER_MM;         // ≈ 1028.03px
const MIN_FILL = 0.5;                               // 每页至少填满一半，避免页尾大片空白
const TOL = 2;                                      // 位置比较容差（px）
const SCALE = 2;                                    // 画布倍率（2 倍 ≈ 192dpi，清晰且不吃内存）
const JPEG_Q = 0.92;                                // PNG 不可用时的兜底压缩质量

/** 标题类元素：其后的第一块内容不允许被分页切开（免得标题孤零零留在页尾） */
const HEAD_SEL = 'h1, h2, h3, .doc-kicker, .day-head, .plan-t, .alts-t, .checkgroup-t, .sub-t, .navbox-t';
/** 允许作为分页切点的块级元素：页面可以正好结束在这些元素之前 */
const ATOM_SEL = 'p, li, .facts, .navbox, .plan, .checkgroup, .day, .tbl, .tl, .doc-foot';
/** 表格行：允许在行与行之间分页 */
const ROW_SEL = 'tbody tr';

const LIB = {
  canvas: {
    label: '渲染',
    ready: () => typeof window.html2canvas === 'function',
    urls: [
      'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
      'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    ]
  },
  pdf: {
    label: 'PDF',
    ready: () => !!(window.jspdf && window.jspdf.jsPDF),
    urls: [
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ]
  }
};

// ---------------------------------------------------------------
// 组件加载（多 CDN 兜底）
// ---------------------------------------------------------------
function loadScript(src, timeout) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      finish();
      reject(new Error('请求超时'));
    }, timeout || 15000);
    function finish() {
      done = true;
      clearTimeout(timer);
      s.onload = null;
      s.onerror = null;
    }
    s.src = src;
    s.async = true;
    s.onload = () => { if (!done) { finish(); resolve(); } };
    s.onerror = () => { if (!done) { finish(); s.remove(); reject(new Error('资源不可达')); } };
    document.head.appendChild(s);
  });
}

async function ensure(key, onStep) {
  const def = LIB[key];
  if (def.ready()) return;
  let last = '未知原因';
  for (let i = 0; i < def.urls.length; i += 1) {
    onStep(`正在加载${def.label}组件（线路 ${i + 1}/${def.urls.length}）…`);
    try {
      await loadScript(def.urls[i]);
      if (def.ready()) return;
      last = '组件未注册';
    } catch (e) {
      last = (e && e.message) || '加载失败';
    }
  }
  throw new Error(`${def.label}组件加载失败（${last}），请检查网络后重试`);
}

// ---------------------------------------------------------------
// 分页规划：把整篇文档切成若干「页高以内的片段」
// ---------------------------------------------------------------
/** 导出以便单测：返回 [0, cut1, cut2, …, 文档总高] 的分页切点数组 */
export function planCuts(clone) {
  const box = clone.getBoundingClientRect();
  const base = box.top;
  const totalH = Math.round(box.height);
  const yOf = el => Math.round(el.getBoundingClientRect().top - base);

  const allowed = [0, totalH];
  const banned = [];

  // 标题与紧随其后的内容不可拆开
  clone.querySelectorAll(HEAD_SEL).forEach(h => {
    const nxt = h.nextElementSibling;
    if (nxt) banned.push(yOf(nxt));
  });

  // 候选切点：段落、列表项、卡片、表格行等
  clone.querySelectorAll(ATOM_SEL).forEach(el => allowed.push(yOf(el)));
  clone.querySelectorAll(ROW_SEL).forEach(tr => allowed.push(yOf(tr)));

  // 带表头的表格：不允许恰好切在第一行数据之前（否则页尾只剩表头）
  clone.querySelectorAll('table thead').forEach(head => {
    const first = head.parentNode ? head.parentNode.querySelector('tbody tr') : null;
    if (first) banned.push(yOf(first));
  });

  const isBanned = p => banned.some(b => Math.abs(b - p) <= TOL);
  const points = Array.from(new Set(allowed.concat([0, totalH])))
    .filter(p => p >= 0 && p <= totalH)
    .filter(p => !isBanned(p))
    .sort((a, b) => a - b);

  const cuts = [0];
  let start = 0;
  while (totalH - start > 2) {
    const limit = start + PAGE_H_PX;
    if (limit >= totalH - 2) { cuts.push(totalH); break; }
    const minFill = start + PAGE_H_PX * MIN_FILL;
    let pick = null;
    for (let i = points.length - 1; i >= 0; i -= 1) {
      const p = points[i];
      if (p > limit) continue;
      if (p <= minFill) break;
      pick = p;
      break;
    }
    // 找不到合适断点（例：超长不可分块）时，退回按页高硬切
    let cut = pick == null ? Math.round(limit) : pick;
    if (cut <= start + 24) cut = Math.round(Math.min(start + PAGE_H_PX, totalH));
    cuts.push(cut);
    start = cut;
  }
  if (cuts[cuts.length - 1] !== totalH) cuts.push(totalH);
  return cuts;
}

// ---------------------------------------------------------------
// 导出主流程
// ---------------------------------------------------------------
/**
 * 把一段 HTML 元素导出为多页 A4 PDF
 * @param {HTMLElement} sourceEl 要导出的元素（页面上的文档容器）
 * @param {string} filename 文件名（含 .pdf）
 * @param {(text: string) => void} [onStep] 进度回调
 * @returns {Promise<{pages: number, blob: Blob}>}
 */
export async function exportPdf(sourceEl, filename, onStep) {
  const step = typeof onStep === 'function' ? onStep : () => {};
  if (!sourceEl) throw new Error('文档还没准备好，请稍后重试');

  await ensure('canvas', step);
  await ensure('pdf', step);

  step('正在准备排版…');
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* 字体等待失败不影响生成 */ }
  }

  // 离屏容器：宽度固定为 A4 内容区宽度，成为「整篇文档」的排版基准
  const holder = document.createElement('div');
  const inner = document.createElement('div');
  const clone = sourceEl.cloneNode(true);
  clone.removeAttribute('id');
  clone.style.cssText = `width:${CONTENT_W_PX}px;max-width:none;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;background:#ffffff;`;
  inner.style.cssText = `position:absolute;left:0;top:0;width:${CONTENT_W_PX}px;`;
  holder.style.cssText = `position:absolute;left:-20000px;top:0;width:${CONTENT_W_PX}px;overflow:hidden;background:#ffffff;`;
  inner.appendChild(clone);
  holder.appendChild(inner);
  document.body.appendChild(holder);

  try {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const cuts = planCuts(clone);
    const total = Math.max(cuts.length - 1, 1);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

    for (let i = 0; i < total; i += 1) {
      const start = cuts[i];
      const end = cuts[i + 1];
      const h = end - start;
      step(`正在渲染第 ${i + 1} / ${total} 页…`);
      // 用「裁剪窗口 + 整体上移」的方式取出一页，版式连续、每页画布都不大
      holder.style.height = `${h}px`;
      inner.style.top = `${-start}px`;
      const canvas = await window.html2canvas(holder, {
        scale: SCALE,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      if (i > 0) pdf.addPage();
      const x = MARGIN[1];
      const y = MARGIN[0];
      const w = CONTENT_W_MM;
      const ph = h / PX_PER_MM;
      try {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, ph);
      } catch (e) {
        pdf.addImage(canvas.toDataURL('image/jpeg', JPEG_Q), 'JPEG', x, y, w, ph);
      }
    }

    step('正在写入页码…');
    const pages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${i} / ${pages}`, 210 / 2, 297 - 6, { align: 'center' });
    }

    step('正在打包文件…');
    return { pages, blob: pdf.output('blob') };
  } finally {
    holder.remove();
  }
}

/** 触发浏览器下载（本地文件保存） */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  return url;
}
