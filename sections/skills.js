import * as THREE from 'three';
import { makeLabelSprite } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

// Blue = firmware/embedded, Orange = hardware, Green = software/web
const CAT_COLORS = {
  firmware: 0x4fc3f7,
  hardware: 0xff9e40,
  software: 0x66e07a
};

const SKILLS = [
  { name: 'Analog Design', cat: 'hardware' },
  { name: 'FPGA / HDL', cat: 'firmware' },
  { name: 'Signal & Systems', cat: 'hardware' },
  { name: 'Web Dev', cat: 'software' },
  { name: 'Python & APIs', cat: 'software' },
  { name: 'Data Analysis', cat: 'software' }
];

// related pairs (indices into SKILLS)
const LINKS = [
  [0, 2], // analog — signals
  [0, 1], // analog — fpga
  [1, 4], // fpga — python
  [3, 4], // web — python
  [4, 5], // python — data
  [3, 5]  // web — data
];

export function createSkills() {
  const group = new THREE.Group();
  const orbit = new THREE.Group();
  group.add(orbit);

  const interactives = [];
  const fadeMats = [];
  const spheres = [];

  const radius = 3.4;
  SKILLS.forEach((s, i) => {
    const angle = (i / SKILLS.length) * Math.PI * 2;
    const y = 3 + Math.sin(angle * 2) * 0.8;

    const mat = new THREE.MeshStandardMaterial({
      color: CAT_COLORS[s.cat],
      emissive: CAT_COLORS[s.cat],
      emissiveIntensity: 0.7,
      roughness: 0.4,
      metalness: 0.2,
      transparent: true
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), mat);
    sphere.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

    const label = makeLabelSprite(s.name, { scale: 2.4 });
    label.position.copy(sphere.position);
    label.position.y += 0.75;
    label.visible = false;

    sphere.userData = {
      link: null,
      hovered: false,
      hoverTarget: sphere,
      labelSprite: label,
      label: s.name
    };

    orbit.add(sphere, label);
    interactives.push(sphere);
    fadeMats.push(mat, label.material);
    spheres.push(sphere);
  });

  // connections between related skills
  const linePositions = new Float32Array(LINKS.length * 2 * 3);
  LINKS.forEach(([a, b], i) => {
    const pa = spheres[a].position, pb = spheres[b].position;
    linePositions.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  orbit.add(new THREE.LineSegments(lineGeo, lineMat));

  function update(progress, dt) {
    const f = fadeWindow(progress, 0.48, 0.66, 0.06);
    group.visible = f > 0.01;
    fadeMats.forEach(m => (m.opacity = f));
    lineMat.opacity = 0.25 * f;
    orbit.rotation.y += 0.08 * dt;
    spheres.forEach(s => {
      s.userData.labelSprite.visible = s.userData.hovered && f > 0.3;
    });
  }

  return { group, update, interactives };
}
