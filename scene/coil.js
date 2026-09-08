import * as THREE from 'three';
import { smoothstep } from '../utils/scroll.js';

class HelixCurve extends THREE.Curve {
  constructor(radius, yStart, height, turns) {
    super();
    this.radius = radius;
    this.yStart = yStart;
    this.height = height;
    this.turns = turns;
  }
  getPoint(t, target = new THREE.Vector3()) {
    const angle = t * this.turns * Math.PI * 2;
    return target.set(
      Math.cos(angle) * this.radius,
      this.yStart + t * this.height,
      Math.sin(angle) * this.radius
    );
  }
}

const BLUE = new THREE.Color('#4fc3f7');
const AMBER = new THREE.Color('#ffb74d');
const TOROID_BASE = new THREE.Color('#cfeeff');

export function createCoil() {
  const group = new THREE.Group();

  const metal = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.3,
    metalness: 0.9
  });

  const steel = new THREE.MeshStandardMaterial({
    color: 0x6f8192,
    roughness: 0.24,
    metalness: 0.92
  });

  const ceramic = new THREE.MeshStandardMaterial({
    color: 0xe8edf2,
    roughness: 0.48,
    metalness: 0.05
  });

  const copper = new THREE.MeshStandardMaterial({
    color: 0xc47a3d,
    roughness: 0.28,
    metalness: 0.9,
    emissive: 0x241006,
    emissiveIntensity: 0.25
  });

  // Base: octagonal prism
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.9, 8), metal);
  base.position.y = 0.45;
  group.add(base);

  // Machined upper deck, fasteners, and isolation feet give the base real scale.
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.84, 1.96, 0.16, 8), steel);
  deck.position.y = 0.94;
  group.add(deck);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 8), steel);
    bolt.position.set(Math.cos(a) * 1.62, 1.06, Math.sin(a) * 1.62);
    group.add(bolt);
  }

  // Four ceramic standoffs support the flat primary winding.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const insulator = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.62, 12), ceramic);
    insulator.position.set(Math.cos(a) * 1.45, 1.28, Math.sin(a) * 1.45);
    group.add(insulator);
    for (const y of [1.08, 1.28, 1.48]) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 18), ceramic);
      rib.rotation.x = Math.PI / 2;
      rib.position.set(insulator.position.x, y, insulator.position.z);
      group.add(rib);
    }
  }

  // Flat primary coil surrounding the secondary winding.
  for (let i = 0; i < 6; i++) {
    const turn = new THREE.Mesh(new THREE.TorusGeometry(0.78 + i * 0.19, 0.035, 8, 72), copper);
    turn.rotation.x = Math.PI / 2;
    turn.position.y = 1.5 + i * 0.025;
    group.add(turn);
  }

  // Column
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 24), metal);
  column.position.y = 0.9 + 2.5;
  group.add(column);

  // Toroid (top)
  const toroidMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a3e,
    roughness: 0.25,
    metalness: 0.85,
    emissive: TOROID_BASE.clone(),
    emissiveIntensity: 0.55
  });
  const toroid = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.35, 24, 48), toroidMat);
  toroid.position.y = 6.05;
  toroid.rotation.x = Math.PI / 2;
  group.add(toroid);

  // Secondary coil: helical wire wound around the column
  const helixCurve = new HelixCurve(0.42, 1.05, 4.6, 38);
  const helixMat = copper.clone();
  const helix = new THREE.Mesh(new THREE.TubeGeometry(helixCurve, 900, 0.035, 6, false), helixMat);
  group.add(helix);

  // Ground ring: faint electric-blue glowing torus on the floor
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a1a,
    roughness: 0.5,
    metalness: 0.4,
    emissive: BLUE.clone(),
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4, 0.05, 12, 96), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);

  // Compact control deck: breaker, indicator lamps, and guarded cutoff.
  const consoleGroup = new THREE.Group();
  const consoleBody = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.72, 0.9), metal);
  consoleBody.rotation.x = -0.18;
  consoleGroup.add(consoleBody);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x111a25, roughness: 0.38, metalness: 0.72 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.42, 0.04), panelMat);
  panel.position.set(0, 0.13, 0.46);
  panel.rotation.x = -0.18;
  consoleGroup.add(panel);

  const lampMats = ['#4fc3f7', '#66e07a', '#ffb74d'].map(color => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.1,
    roughness: 0.2
  }));
  lampMats.forEach((mat, i) => {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), mat);
    lamp.position.set(-0.38 + i * 0.38, 0.2, 0.49);
    consoleGroup.add(lamp);
  });
  const cutoff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0xd33b4e, emissive: 0x3b060d, roughness: 0.38 })
  );
  cutoff.rotation.x = Math.PI / 2;
  cutoff.position.set(0.5, -0.12, 0.51);
  consoleGroup.add(cutoff);
  consoleGroup.position.set(-2.9, 0.65, 1.15);
  consoleGroup.rotation.y = 0.35;
  group.add(consoleGroup);

  // Braided grounding lead from the coil base to the floor ring.
  const groundCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.6, 0.42, 0),
    new THREE.Vector3(-2.35, 0.25, -0.4),
    new THREE.Vector3(-3.25, 0.12, -1.3),
    new THREE.Vector3(-3.7, 0.05, -1.55)
  ]);
  const groundLead = new THREE.Mesh(new THREE.TubeGeometry(groundCurve, 56, 0.045, 8, false), steel);
  group.add(groundLead);

  // Point light inside the toroid
  const light = new THREE.PointLight(BLUE.clone(), 2.0, 8, 1.5);
  light.position.set(0, 6.05, 0);
  group.add(light);

  const tmpColor = new THREE.Color();

  function update(dt, elapsed, progress) {
    // 0.003 rad/frame & 0.001 rad/frame at 60fps, frame-rate independent
    toroid.rotation.z += 0.18 * dt;
    helix.rotation.y -= 0.06 * dt;
    lampMats[0].emissiveIntensity = 0.9 + Math.sin(elapsed * 4.2) * 0.35;
    lampMats[1].emissiveIntensity = 0.8 + Math.sin(elapsed * 2.1 + 1.4) * 0.18;

    // Standby blend: dim toroid to amber from 85% scroll onward
    const standby = smoothstep(0.85, 0.95, progress);

    tmpColor.copy(TOROID_BASE).lerp(AMBER, standby);
    toroidMat.emissive.copy(tmpColor);
    toroidMat.emissiveIntensity = 0.55 * (1 - standby * 0.65);

    tmpColor.copy(BLUE).lerp(AMBER, standby);
    light.color.copy(tmpColor);
    const pulse = 2.0 + Math.sin(elapsed * 3) * 0.8;
    light.intensity = pulse * (1 - standby * 0.6);

    ringMat.emissiveIntensity = (0.4 + Math.sin(elapsed * 3) * 0.15) * (1 - standby * 0.7);
  }

  return { group, update, toroidTop: new THREE.Vector3(0, 6.05, 0) };
}
