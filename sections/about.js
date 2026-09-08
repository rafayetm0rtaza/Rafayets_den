import * as THREE from 'three';
import { makeCanvasTexture, wrapText } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

const BIO_1 = "Electrical Engineering student at Michigan State University focused on analog and digital circuit design, embedded systems, robotics, and hardware-software integration.";
const BIO_2 = "My work moves from first-principles analysis to bench verification: closed-loop motor control, STM32 sensing, bare-metal Arm firmware, and HDL design.";
const BIO_3 = "Electrical Co-Lead for Spartan Autonomous Robotics, helping own the power, wiring, sensors, firmware bring-up, and documentation behind a quadruped robot.";

export function createAbout(cameraStop = new THREE.Vector3(8, 5, 10)) {
  const group = new THREE.Group();

  // Frosted glass backing panel
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fd8ff,
    transmission: 0.6,
    roughness: 0.35,
    metalness: 0,
    thickness: 0.4,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.6), glassMat);

  const tex = makeCanvasTexture((ctx, W, H) => {
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#4fc3f7';
    ctx.font = '400 28px "Space Grotesk", sans-serif';
    ctx.fillText('// 01 — ABOUT', 48, 40);

    ctx.fillStyle = '#e8eaf6';
    ctx.font = '600 64px "Space Grotesk", sans-serif';
    ctx.fillText('WHO I AM', 48, 86);

    ctx.fillStyle = '#cfd8e8';
    ctx.font = '300 26px "Space Grotesk", sans-serif';
    let y = wrapText(ctx, BIO_1, 48, 190, W - 96, 36);
    y = wrapText(ctx, BIO_2, 48, y + 14, W - 96, 36);
    wrapText(ctx, BIO_3, 48, y + 14, W - 96, 36);
  }, 1024, 640);

  const textMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const text = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.375), textMat);
  text.position.z = 0.03;

  const panel = new THREE.Group();
  panel.add(glass, text);
  panel.position.set(4.2, 4, 3.2);
  panel.lookAt(cameraStop);
  group.add(panel);

  function update(progress, dt, elapsed) {
    const f = fadeWindow(progress, 0.10, 0.26, 0.05);
    group.visible = f > 0.01;
    glassMat.opacity = 0.85 * f;
    textMat.opacity = f;
    panel.position.y = 4 + Math.sin(elapsed * 0.7) * 0.06;
  }

  return { group, update, interactives: [] };
}
