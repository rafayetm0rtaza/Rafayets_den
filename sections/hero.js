import * as THREE from 'three';
import { makeCanvasTexture } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

export function createHero() {
  const group = new THREE.Group();

  const tex = makeCanvasTexture((ctx, W, H) => {
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#4fc3f7';
    ctx.font = '400 30px "Space Grotesk", sans-serif';
    ctx.fillText('ELECTRICAL ENGINEERING · ROBOTICS · EMBEDDED', 24, 40);

    ctx.fillStyle = '#e8eaf6';
    ctx.font = '600 120px "Space Grotesk", sans-serif';
    ctx.shadowColor = 'rgba(79, 195, 247, 0.6)';
    ctx.shadowBlur = 24;
    ctx.fillText('RAFAYET', 24, 110);
    ctx.fillText('MURTAZA', 24, 240);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#9fb3c8';
    ctx.font = '300 34px "Space Grotesk", sans-serif';
    ctx.fillText('Circuits from first principles. Systems built to work.', 24, 400);
    ctx.fillStyle = '#4fc3f7';
    ctx.font = '400 28px "Space Grotesk", sans-serif';
    ctx.fillText('MSU · EXPECTED MAY 2027', 24, 452);
  }, 1024, 512);

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), mat);
  plane.position.set(4.6, 3.6, 3.5);
  plane.rotation.y = -0.28;
  group.add(plane);

  const mats = [mat];

  function update(progress, dt, elapsed) {
    const f = fadeWindow(progress, 0, 0.08, 0.05);
    group.visible = f > 0.01;
    mats.forEach(m => (m.opacity = f));
    plane.position.y = 3.6 + Math.sin(elapsed * 0.8) * 0.08;
  }

  return { group, update, interactives: [] };
}
