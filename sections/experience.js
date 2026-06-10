import * as THREE from 'three';
import { makeCardTexture } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

const ENTRIES = [
  {
    title: 'Student Research Assistant',
    tag: 'UOE · Michigan State · May 2025 — Sep 2025',
    body: 'Processed after-school program survey data across Michigan using Remark and SPSS. Communicated findings to department stakeholders through PowerPoint presentations.'
  },
  {
    title: 'Student Clerical Assistant',
    tag: 'Brody / West Circle · MSU · Nov 2022 — Present',
    body: 'Clerical support in a fast-paced university dormitory — mail and package processing, records, and front-desk support for hundreds of residents.'
  },
  {
    title: 'Data Analysis Intern',
    tag: 'HEXA · Jun 2022 — Aug 2022',
    body: 'Data analysis with MATLAB and Excel supporting project deliverables in a cross-functional engineering environment.'
  },
  {
    title: 'B.S. Electrical Engineering',
    tag: 'Michigan State University · Expected Aug 2027',
    body: 'MSU Cybersecurity Club · Student Trading Club · Sparta Hacks. Duke of Edinburgh’s Award (Bronze & Silver) · Regional Mathematics Olympiad · Honorable Mention, Biology Olympiad.'
  }
];

const PANEL_POSITIONS = [
  new THREE.Vector3(0.8, 5.4, 0.8),
  new THREE.Vector3(3.4, 4.8, 0.4),
  new THREE.Vector3(0.4, 3.2, 2.6),
  new THREE.Vector3(3.0, 2.6, 2.2)
];

export function createExperience(cameraStop = new THREE.Vector3(5, 1, 8)) {
  const group = new THREE.Group();
  const fadeMats = [];
  const panels = [];

  ENTRIES.forEach((e, i) => {
    const panel = new THREE.Group();

    // frosted glass with slight blue tint
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9fd8ff,
      transmission: 0.6,
      roughness: 0.4,
      metalness: 0,
      thickness: 0.3,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.1), glassMat);

    const textMat = new THREE.MeshBasicMaterial({
      map: makeCardTexture(e),
      transparent: true,
      depthWrite: false
    });
    const text = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), textMat);
    text.position.z = 0.025;

    panel.add(glass, text);
    panel.position.copy(PANEL_POSITIONS[i]);
    panel.lookAt(cameraStop);
    group.add(panel);

    fadeMats.push({ mat: glassMat, base: 0.8 }, { mat: textMat, base: 1 });
    panels.push({ panel, baseY: PANEL_POSITIONS[i].y, phase: i * 1.7 });
  });

  function update(progress, dt, elapsed) {
    const f = fadeWindow(progress, 0.69, 0.84, 0.05);
    group.visible = f > 0.01;
    fadeMats.forEach(({ mat, base }) => (mat.opacity = base * f));
    panels.forEach(({ panel, baseY, phase }) => {
      panel.position.y = baseY + Math.sin(elapsed * 0.6 + phase) * 0.07;
    });
  }

  return { group, update, interactives: [] };
}
