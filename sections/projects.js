import * as THREE from 'three';
import { makeCardTexture } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

const PROJECTS = [
  {
    title: 'Motor Control System',
    tag: 'Analog · ECE 303 · Fall 2025',
    body: 'Three-stage closed-loop DC motor controller: 5 kHz 555 PWM, 800 mV filtered reference, and 741 op-amp current regulation driving a TIP31/TIP32 push-pull stage. Bench verified.',
    link: null
  },
  {
    title: 'STM32 Environmental Monitor',
    tag: 'Embedded · C · STM32F411RE',
    body: 'Real-time monitor integrating an MQ135 through the 12-bit ADC, DHT22 temperature and humidity over 1-wire, and an SSD1306 OLED over I2C1.',
    link: 'https://github.com/rafayetm0rtaza'
  },
  {
    title: 'Bare-Metal Arm Cortex-M0+',
    tag: 'Firmware · Assembly · ECE 331',
    body: 'FRDM-KL25Z in Arm Thumb assembly: direct-register GPIO, NVIC interrupt handling, ISR state transitions, and memory-level debugging in Keil µVision.',
    link: null
  },
  {
    title: '8-Bit Arithmetic Logic Unit',
    tag: 'HDL · AMD Xilinx Vivado',
    body: 'Designed and implemented an 8-bit ALU across RTL synthesis, functional simulation, and the FPGA implementation workflow.',
    link: null
  },
  {
    title: 'ShelterMEON',
    tag: 'Full-Stack · CalHacks 11.0',
    body: 'Emergency shelter-finder built at CalHacks 11.0 with React and Node.js/Express, voice-to-text search, and Google Maps visualization.',
    link: 'https://github.com/MeryemGurbanova/calhacks11'
  },
  {
    title: 'Portfolio Site',
    tag: 'Web / HTML·CSS·JS',
    body: 'This site — a procedural Three.js Tesla Coil electricity lab with a scroll-driven camera, deployed to GitHub Pages.',
    link: 'https://github.com/rafayetm0rtaza/Rafayets_den'
  }
];

export function createProjects() {
  const group = new THREE.Group();
  const interactives = [];
  const fadeMats = [];
  const panels = [];

  PROJECTS.forEach((p, i) => {
    const holder = new THREE.Group();
    const angle = (i / PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 5.6;
    holder.position.set(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);

    // glow border under the card
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 2.05), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.015;

    const cardMat = new THREE.MeshBasicMaterial({
      map: makeCardTexture(p),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.94), cardMat);
    // flat on the ground, all cards upright from the overhead camera (screen-up = -Z)
    card.rotation.x = -Math.PI / 2;

    card.userData = {
      link: p.link,
      hovered: false,
      hoverTarget: holder,
      label: p.title
    };

    holder.add(glow, card);
    group.add(holder);
    if (p.link) interactives.push(card);
    fadeMats.push({ mat: cardMat, base: 1 });
    fadeMats.push({ mat: glowMat, base: 0.25, card });
    panels.push(holder);
  });

  function update(progress) {
    const f = fadeWindow(progress, 0.27, 0.46, 0.06);
    group.visible = f > 0.01;
    fadeMats.forEach(({ mat, base, card }) => {
      const b = card && card.userData.hovered ? 0.7 : base;
      mat.opacity = b * f;
    });
    // rise from the ground as they fade in
    panels.forEach(h => { h.position.y = 0.05 - (1 - f) * 1.2; });
  }

  return { group, update, interactives };
}
