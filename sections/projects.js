import * as THREE from 'three';
import { makeCardTexture } from '../utils/text.js';
import { fadeWindow } from '../utils/scroll.js';

const PROJECTS = [
  {
    title: 'Motor Control System',
    tag: 'Analog / ECE 303',
    body: '3-stage analog controller: 555-timer PWM (5 kHz, 20–80% duty), RC low-pass filter to 800 mV reference, closed-loop current regulation via 741 op-amp with push-pull transistors and 10Ω shunt feedback.',
    link: null
  },
  {
    title: '8-Bit ALU',
    tag: 'Digital / ECE 331',
    body: 'Fully functional 8-bit Arithmetic Logic Unit in HDL using AMD Xilinx Vivado — RTL synthesis, functional simulation, and FPGA implementation.',
    link: null
  },
  {
    title: 'ShelterMEON',
    tag: 'Full-Stack · CalHacks 11.0',
    body: 'Emergency shelter-finder built at UC Berkeley — VAPI AI voice-to-text, Google Maps API, Fetch.AI data agents, SingleStore backend. React + Node.js/Express.',
    link: 'https://github.com/MeryemGurbanova/calhacks11'
  },
  {
    title: 'Portfolio Site',
    tag: 'Web / HTML·CSS·JS',
    body: 'This site — a procedural Three.js Tesla Coil electricity lab with a scroll-driven camera, deployed to GitHub Pages.',
    link: 'https://github.com/rafayetm0rtaza/Rafayets_den'
  },
  {
    title: 'STM32 Environmental Monitor',
    tag: 'Embedded / STM32·C·I2C·ADC',
    body: 'Real-time monitor on STM32F411RE — CO2 via MQ135 (12-bit ADC), DHT22 temp/humidity, SSD1306 OLED over I2C. Configured with STM32CubeMX.',
    link: 'https://github.com/rafayetm0rtaza/stm32-environmental-monitor'
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
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.55, 2.25), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.015;

    const cardMat = new THREE.MeshBasicMaterial({
      map: makeCardTexture(p),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.125), cardMat);
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
