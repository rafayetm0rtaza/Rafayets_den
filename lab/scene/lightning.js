import * as THREE from 'three';

const COLOR_CORE = new THREE.Color('#ffffff');
const COLOR_MID = new THREE.Color('#7b2fff');
const COLOR_TIP = new THREE.Color('#00cfff');

const SEGMENTS = 16; // 17 vertices (2^4 + 1) for midpoint displacement

function midpointDisplace(pts, i0, i1, amp) {
  if (i1 - i0 < 2) return;
  const mid = (i0 + i1) >> 1;
  pts[mid].copy(pts[i0]).add(pts[i1]).multiplyScalar(0.5);
  pts[mid].x += (Math.random() - 0.5) * amp;
  pts[mid].y += (Math.random() - 0.5) * amp;
  pts[mid].z += (Math.random() - 0.5) * amp;
  midpointDisplace(pts, i0, mid, amp * 0.55);
  midpointDisplace(pts, mid, i1, amp * 0.55);
}

class Arc {
  constructor(parent, origin, { corona = false } = {}) {
    this.origin = origin;
    this.corona = corona;
    this.pts = Array.from({ length: SEGMENTS + 1 }, () => new THREE.Vector3());

    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array((SEGMENTS + 1) * 3);
    this.colors = new Float32Array((SEGMENTS + 1) * 3);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const baseOpacity = corona ? 0.22 : 0.9;
    this.coreMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: baseOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.baseOpacity = baseOpacity;

    this.group = new THREE.Group();
    this.group.add(new THREE.Line(this.geometry, this.coreMat));

    // Simulated bloom: offset duplicate lines at 30% opacity (fake 2x thickness)
    if (!corona) {
      this.bloomMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const b1 = new THREE.Line(this.geometry, this.bloomMat);
      const b2 = new THREE.Line(this.geometry, this.bloomMat);
      b1.position.set(0.035, 0.035, 0);
      b2.position.set(-0.035, 0, 0.035);
      this.group.add(b1, b2);
    }

    parent.add(this.group);
    this.age = 0;
    this.lifespan = 0;
    this.spawn();
  }

  spawn() {
    const angle = Math.random() * Math.PI * 2;
    const reachMin = this.corona ? 4 : 2.5;
    const reachVar = this.corona ? 4 : 3;
    const reach = reachMin + Math.random() * reachVar;

    const start = this.pts[0];
    start.copy(this.origin);
    start.x += Math.cos(angle) * 1.1;
    start.z += Math.sin(angle) * 1.1;

    const end = this.pts[SEGMENTS];
    end.set(
      this.origin.x + Math.cos(angle) * reach,
      Math.max(0.2, this.origin.y + (Math.random() * 2 - 1.4) * reach * 0.5),
      this.origin.z + Math.sin(angle) * reach
    );

    midpointDisplace(this.pts, 0, SEGMENTS, reach * 0.45);

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      this.positions[i * 3] = this.pts[i].x;
      this.positions[i * 3 + 1] = this.pts[i].y;
      this.positions[i * 3 + 2] = this.pts[i].z;

      // gradient: white core -> purple mid -> cyan tips
      const c = t < 0.5
        ? COLOR_CORE.clone().lerp(COLOR_MID, t * 2)
        : COLOR_MID.clone().lerp(COLOR_TIP, (t - 0.5) * 2);
      this.colors[i * 3] = c.r;
      this.colors[i * 3 + 1] = c.g;
      this.colors[i * 3 + 2] = c.b;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.computeBoundingSphere();

    this.age = 0;
    this.lifespan = this.corona
      ? 0.4 + Math.random() * 0.9
      : 0.05 + Math.random() * 0.15;
  }

  update(dt) {
    this.age += dt;
    if (this.age > this.lifespan) this.spawn();
    this.coreMat.opacity = this.baseOpacity * (0.55 + Math.random() * 0.45);
  }

  setVisible(v) {
    this.group.visible = v;
  }

  dispose() {
    this.geometry.dispose();
    this.coreMat.dispose();
    if (this.bloomMat) this.bloomMat.dispose();
  }
}

export class LightningSystem {
  constructor(scene, origin, { maxArcs = 12, coronaArcs = 6 } = {}) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.maxArcs = maxArcs;
    this.arcs = Array.from({ length: maxArcs }, () => new Arc(this.group, origin));
    this.coronas = Array.from({ length: coronaArcs }, () => new Arc(this.group, origin, { corona: true }));
    this.standbyTimer = 0;
  }

  // intensity 0..1 scales active arc count; standby = one slow arc every 3s
  update(dt, intensity, standby) {
    if (standby) {
      this.standbyTimer += dt;
      const show = (this.standbyTimer % 3) < 0.3;
      this.arcs.forEach((arc, i) => {
        arc.setVisible(i === 0 && show);
        if (i === 0 && show) arc.update(dt);
      });
      this.coronas.forEach(c => c.setVisible(false));
      return;
    }

    const active = Math.max(2, Math.round(this.maxArcs * intensity));
    this.arcs.forEach((arc, i) => {
      const on = i < active;
      arc.setVisible(on);
      if (on) arc.update(dt);
    });
    const activeCorona = Math.round(this.coronas.length * intensity);
    this.coronas.forEach((c, i) => {
      const on = i < activeCorona;
      c.setVisible(on);
      if (on) c.update(dt);
    });
  }
}
