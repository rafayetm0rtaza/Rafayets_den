import * as THREE from 'three';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Scroll stops from the design spec
const STOPS = [0, 0.15, 0.35, 0.55, 0.75, 0.90, 1.0];
const POSITIONS = [
  v(0, 3, 12),     // 0%   hero
  v(8, 5, 10),     // 15%  about
  v(0.5, 14, 2.5), // 35%  projects (overhead)
  v(-10, 2, 6),    // 55%  skills
  v(5, 1, 8),      // 75%  experience (low angle)
  v(0, 2, 14),     // 90%  contact
  v(0, 2.5, 14.5)  // 100% standby
];
const TARGETS = [
  v(0, 3.5, 0),
  v(2, 3.5, 0),
  v(0, 0, 0),
  v(0, 3, 0),
  v(2, 4, 1.5),
  v(0, 2, 4),
  v(0, 3, 0)
];

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.posCurve = new THREE.CatmullRomCurve3(POSITIONS);
    this.tgtCurve = new THREE.CatmullRomCurve3(TARGETS);
    this.curPos = POSITIONS[0].clone();
    this.curTgt = TARGETS[0].clone();
    this.desiredPos = new THREE.Vector3();
    this.desiredTgt = new THREE.Vector3();
    camera.position.copy(this.curPos);
    camera.lookAt(this.curTgt);
  }

  // map scroll progress to curve parameter (stops are non-uniform)
  mapU(p) {
    const n = STOPS.length - 1;
    for (let i = 0; i < n; i++) {
      if (p <= STOPS[i + 1]) {
        const local = (p - STOPS[i]) / (STOPS[i + 1] - STOPS[i]);
        return (i + local) / n;
      }
    }
    return 1;
  }

  update(progress, dt) {
    const u = this.mapU(progress);
    this.posCurve.getPoint(u, this.desiredPos);
    this.tgtCurve.getPoint(u, this.desiredTgt);

    // lerp factor 0.05 per frame at 60fps, scaled for frame-rate independence
    const k = 1 - Math.pow(1 - 0.05, dt * 60);
    this.curPos.lerp(this.desiredPos, k);
    this.curTgt.lerp(this.desiredTgt, k);

    this.camera.position.copy(this.curPos);
    this.camera.lookAt(this.curTgt);
  }
}
