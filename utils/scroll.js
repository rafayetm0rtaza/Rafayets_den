export function getScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export function initScrollUI() {
  const bar = document.getElementById('progressBar');
  const hint = document.getElementById('scrollHint');

  function onScroll() {
    const p = getScrollProgress();
    bar.style.width = (p * 100) + '%';
    hint.style.opacity = p > 0.02 ? '0' : '1';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('nav a[data-p]').forEach(a => {
    a.addEventListener('click', e => {
      if (window.innerWidth <= 768) return; // mobile uses native anchors
      e.preventDefault();
      const frac = parseFloat(a.dataset.p);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: frac * max, behavior: 'smooth' });
    });
  });
}

// Smooth visibility window: fades in over `edge` before [a,b] and out after
export function fadeWindow(p, a, b, edge = 0.04) {
  const fin = smoothstep(a - edge, a, p);
  const fout = 1 - smoothstep(b, b + edge, p);
  return Math.min(fin, fout);
}

export function smoothstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
