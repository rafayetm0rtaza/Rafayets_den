import * as THREE from 'three';
import { makeContactIconSprite, makeLabelSprite } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

const LINKS = [
  { label: 'GITHUB', sub: 'rafayetm0rtaza', url: 'https://github.com/rafayetm0rtaza', x: -3.6, icon: 'github' },
  { label: 'LINKEDIN', sub: 'rafayet-murtaza', url: 'https://www.linkedin.com/in/rafayet-murtaza', x: -1.2, icon: 'linkedin' },
  { label: 'EMAIL', sub: 'murtaza2@msu.edu', url: 'mailto:murtaza2@msu.edu', x: 1.2, icon: 'email' },
  { label: 'PHONE', sub: '(517) 214-6053', url: 'tel:+15172146053', x: 3.6, icon: 'phone' }
];

export function createContact() {
  const group = new THREE.Group();
  const interactives = [];
  const fadeMats = [];
  const orbs = [];

  LINKS.forEach((l, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      emissive: 0x4fc3f7,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 32), mat);
    orb.position.set(l.x, 2.1, 5);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.59, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x4fc3f7,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    halo.position.copy(orb.position);

    const icon = makeContactIconSprite(l.icon);
    icon.position.set(l.x, 2.1, 5.48);

    const name = makeLabelSprite(l.label, { scale: 1.8 });
    name.position.set(l.x, 3.05, 5);
    const sub = makeLabelSprite(l.sub, { fontSize: 38, color: '#9fb3c8', scale: 2.0 });
    sub.position.set(l.x, 1.25, 5);

    orb.userData = { link: l.url, hovered: false, hoverTarget: orb, label: l.label };

    group.add(orb, halo, icon, name, sub);
    interactives.push(orb);
    fadeMats.push(mat, halo.material, icon.material, name.material, sub.material);
    orbs.push({ orb, halo, icon, mat, phase: i * 2.1 });
  });

  function update(progress, dt, elapsed) {
    const f = fadeWindow(progress, 0.86, 1.01, 0.05);
    group.visible = f > 0.01;
    fadeMats.forEach(m => (m.opacity = f));
    orbs.forEach(({ orb, halo, icon, mat, phase }) => {
      const bob = Math.sin(elapsed * 1.2 + phase) * 0.08;
      orb.position.y = 2.1 + bob;
      halo.position.y = 2.1 + bob;
      icon.position.y = 2.1 + bob;
      mat.emissiveIntensity = orb.userData.hovered ? 1.6 : 0.9 + Math.sin(elapsed * 2 + phase) * 0.15;
      halo.material.opacity = f * (orb.userData.hovered ? 0.3 : 0.12);
    });
  }

  return { group, update, interactives };
}
