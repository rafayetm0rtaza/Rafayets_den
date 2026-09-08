import * as THREE from 'three';
import { createCoil } from './scene/coil.js';
import { LightningSystem } from './scene/lightning.js';
import { createParticles } from './scene/particles.js';
import { CameraRig } from './scene/camera.js';
import { createHero } from './sections/hero.js';
import { createAbout } from './sections/about.js';
import { createProjects } from './sections/projects.js';
import { createSkills } from './sections/skills.js';
import { createExperience } from './sections/experience.js';
import { createContact } from './sections/contact.js';
import { getScrollProgress, initScrollUI, smoothstep } from './utils/scroll.js';
import { initResponsive, isMobile } from './utils/responsive.js';

const mobile = isMobile();

// ---------- Renderer / Scene ----------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05070d');
scene.fog = new THREE.FogExp2('#05070d', 0.022);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
initResponsive(renderer, camera);

// Ambient: very low
scene.add(new THREE.AmbientLight('#0a0a1a', 0.05));
// faint fill so metal reads from all stops
const fill = new THREE.DirectionalLight('#1a2a4a', 0.35);
fill.position.set(6, 10, 8);
scene.add(fill);

// ---------- World ----------
const coil = createCoil();
scene.add(coil.group);

const lightning = new LightningSystem(scene, coil.toroidTop, {
  maxArcs: mobile ? 4 : 12,
  coronaArcs: mobile ? 2 : 6
});

const particles = createParticles(mobile ? 300 : 800);
scene.add(particles.mesh);

// ---------- Sections (desktop only; mobile uses HTML fallback) ----------
let sections = [];
let interactives = [];
let rig = null;

async function buildSections() {
  try {
    await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2000))]);
  } catch { /* fonts are progressive enhancement */ }

  sections = [
    createHero(),
    createAbout(),
    createProjects(),
    createSkills(),
    createExperience(),
    createContact()
  ];
  sections.forEach(s => {
    scene.add(s.group);
    interactives.push(...s.interactives);
  });
}

initScrollUI();
if (!mobile) {
  rig = new CameraRig(camera);
  buildSections();
} else {
  camera.position.set(0, 3, 13);
  camera.lookAt(0, 3.5, 0);
}

// ---------- Raycasting (hover + click) ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
let hovered = null;

window.addEventListener('pointermove', e => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  if (hovered && hovered.userData.link) {
    if (hovered.userData.link.startsWith('mailto:')) {
      window.location.href = hovered.userData.link;
    } else {
      window.open(hovered.userData.link, '_blank', 'noopener');
    }
  }
});

function updateRaycast() {
  const candidates = interactives.filter(o => {
    let p = o;
    while (p) {
      if (!p.visible) return false;
      p = p.parent;
    }
    return true;
  });
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(candidates, false);
  const hit = hits.length ? hits[0].object : null;

  if (hit !== hovered) {
    if (hovered) hovered.userData.hovered = false;
    hovered = hit;
    if (hovered) hovered.userData.hovered = true;
    document.body.style.cursor = hovered && hovered.userData.link ? 'pointer' : 'default';
  }
}

function updateHoverScales(dt) {
  const k = 1 - Math.pow(0.001, dt);
  interactives.forEach(o => {
    const target = o.userData.hoverTarget || o;
    const goal = o.userData.hovered ? 1.08 : 1.0;
    const s = THREE.MathUtils.lerp(target.scale.x, goal, k);
    target.scale.setScalar(s);
  });
}

// ---------- Arc intensity over scroll ----------
const INTENSITY_KEYS = [
  [0.0, 1.0],
  [0.15, 0.6],
  [0.35, 0.55],
  [0.55, 0.5],
  [0.75, 0.4],
  [0.90, 0.17]
];

function arcIntensity(p) {
  for (let i = 0; i < INTENSITY_KEYS.length - 1; i++) {
    const [p0, v0] = INTENSITY_KEYS[i];
    const [p1, v1] = INTENSITY_KEYS[i + 1];
    if (p <= p1) return THREE.MathUtils.lerp(v0, v1, smoothstep(p0, p1, p));
  }
  return INTENSITY_KEYS[INTENSITY_KEYS.length - 1][1];
}

// ---------- FPS counter (press D) ----------
const fpsEl = document.getElementById('fps');
let fpsVisible = false;
let fpsAccum = 0, fpsFrames = 0;
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'd') {
    fpsVisible = !fpsVisible;
    fpsEl.style.display = fpsVisible ? 'block' : 'none';
  }
});

// ---------- Loop ----------
const clock = new THREE.Clock();
let elapsed = 0;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  const progress = mobile ? 0 : getScrollProgress();

  if (rig) {
    rig.update(progress, dt);
  } else {
    // mobile: slow ambient orbit
    const a = elapsed * 0.05;
    camera.position.set(Math.sin(a) * 13, 3, Math.cos(a) * 13);
    camera.lookAt(0, 3.5, 0);
  }

  coil.update(dt, elapsed, progress);
  lightning.update(dt, arcIntensity(progress), progress > 0.97);
  particles.update(dt);
  sections.forEach(s => s.update(progress, dt, elapsed));

  if (!mobile && sections.length) {
    updateRaycast();
    updateHoverScales(dt);
  }

  renderer.render(scene, camera);

  if (fpsVisible) {
    fpsAccum += dt;
    fpsFrames++;
    if (fpsAccum >= 0.5) {
      fpsEl.textContent = Math.round(fpsFrames / fpsAccum) + ' FPS';
      fpsAccum = 0;
      fpsFrames = 0;
    }
  }
}
tick();
