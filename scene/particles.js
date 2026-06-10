import * as THREE from 'three';

const NEAR_COLOR = new THREE.Color('#cfe9ff'); // white-blue near center
const FAR_COLOR = new THREE.Color('#3a1466');  // deep purple at edges

export function createParticles(count = 800) {
  const geo = new THREE.SphereGeometry(0.03, 6, 6);
  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const dummy = new THREE.Object3D();
  const tmp = new THREE.Color();

  function respawn(i) {
    const r = 2 + Math.random() * 10;
    const a = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = Math.random() * 10;
    positions[i * 3 + 2] = Math.sin(a) * r;
    velocities[i * 3] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    setColor(i);
  }

  function setColor(i) {
    const x = positions[i * 3], z = positions[i * 3 + 2];
    const d = Math.min(1, Math.sqrt(x * x + z * z) / 11);
    tmp.copy(NEAR_COLOR).lerp(FAR_COLOR, d);
    mesh.setColorAt(i, tmp);
  }

  for (let i = 0; i < count; i++) respawn(i);
  mesh.instanceColor.needsUpdate = true;

  function update(dt) {
    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;

      // Brownian jitter
      velocities[ix] += (Math.random() - 0.5) * 0.4 * dt;
      velocities[iy] += (Math.random() - 0.5) * 0.4 * dt;
      velocities[iz] += (Math.random() - 0.5) * 0.4 * dt;

      // slight gravity toward coil center axis
      const px = positions[ix], py = positions[iy], pz = positions[iz];
      const d = Math.sqrt(px * px + pz * pz) || 1;
      velocities[ix] -= (px / d) * 0.06 * dt;
      velocities[iz] -= (pz / d) * 0.06 * dt;
      velocities[iy] += (3.5 - py) * 0.004 * dt;

      // damping
      velocities[ix] *= 1 - 0.3 * dt;
      velocities[iy] *= 1 - 0.3 * dt;
      velocities[iz] *= 1 - 0.3 * dt;

      positions[ix] += velocities[ix] * dt * 60 * 0.016;
      positions[iy] += velocities[iy] * dt * 60 * 0.016;
      positions[iz] += velocities[iz] * dt * 60 * 0.016;

      // wrap if drifted too far (or too close to the coil column)
      const r2 = positions[ix] ** 2 + positions[iz] ** 2;
      if (r2 > 196 || r2 < 1 || positions[iy] < -0.5 || positions[iy] > 12) {
        respawn(i);
      }

      dummy.position.set(positions[ix], positions[iy], positions[iz]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
  }

  return { mesh, update };
}
