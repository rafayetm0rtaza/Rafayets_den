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

  // Base: octagonal prism
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.9, 8), metal);
  base.position.y = 0.45;
  group.add(base);

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
  const helixMat = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    roughness: 0.35,
    metalness: 0.95,
    emissive: 0x1a0e00,
    emissiveIntensity: 0.3
  });
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

  // Point light inside the toroid
  const light = new THREE.PointLight(BLUE.clone(), 2.0, 8, 1.5);
  light.position.set(0, 6.05, 0);
  group.add(light);

  const tmpColor = new THREE.Color();

  function update(dt, elapsed, progress) {
    // 0.003 rad/frame & 0.001 rad/frame at 60fps, frame-rate independent
    toroid.rotation.z += 0.18 * dt;
    helix.rotation.y -= 0.06 * dt;

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
