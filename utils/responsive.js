export function isMobile() {
  return window.innerWidth <= 768;
}

export function initResponsive(renderer, camera) {
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onResize);
  onResize();
}
