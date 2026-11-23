// Lightweight in-page accessibility check (paste into a browser console or run
// through a browser tool). Reports text contrast below 4.5:1 (3:1 at 24px+ or
// 18.66px bold), images without alt, and links/buttons without a name.
// It is not a replacement for axe; it covers the brand-specific risks.
(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.9) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const issues = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el) || !walker.currentNode.textContent.trim()) continue;
    seen.add(el);
    if (el.closest('[aria-hidden="true"], .visually-hidden, [hidden], noscript, script, style')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const fg = parse(cs.color);
    const bg = bgOf(el);
    if (!fg || !bg || fg.a < 0.1) continue;
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) issues.push(`contrast ${ratio.toFixed(2)} ${size}px "${el.textContent.trim().slice(0, 40)}"`);
  }
  document.querySelectorAll('img:not([alt])').forEach((img) => issues.push(`img without alt ${img.src.slice(-40)}`));
  document.querySelectorAll('a[href], button').forEach((el) => {
    const name = (el.getAttribute('aria-label') || el.textContent || el.querySelector('img[alt]')?.alt || '').trim();
    if (!name) issues.push(`unnamed ${el.tagName} ${el.outerHTML.slice(0, 80)}`);
  });
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  ids.filter((id, i) => ids.indexOf(id) !== i).forEach((id) => issues.push(`duplicate id ${id}`));
  return issues;
})();
