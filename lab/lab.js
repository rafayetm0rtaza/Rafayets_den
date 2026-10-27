const startButton = document.getElementById("start-lab");
const pauseButton = document.getElementById("pause-lab");
const statusText = document.getElementById("lab-status");
const stage = document.getElementById("lab-stage");
const canvas = document.getElementById("lab-canvas");
startButton.hidden = false;
startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  statusText.textContent = "Loading the 3D scene…";
  let renderer;
  try {
    const [THREE, { createCoil }, { LightningSystem }, { createParticles }] =
      await Promise.all([
        import("three"),
        import("./scene/coil.js"),
        import("./scene/lightning.js"),
        import("./scene/particles.js"),
      ]);
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05070d");
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight("#b0c7d2", 1.1));
    const fill = new THREE.DirectionalLight("#e0f1ff", 2.2);
    fill.position.set(5, 9, 6);
    scene.add(fill);
    const coil = createCoil();
    scene.add(coil.group);
    const lightning = new LightningSystem(scene, coil.toroidTop, {
      maxArcs: 4,
      coronaArcs: 2,
    });
    const particles = createParticles(180);
    scene.add(particles.mesh);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let elapsed = 0,
      last = 0;
    let inView = true;
    function draw(time = 0) {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      if (!paused) {
        elapsed += dt;
        coil.update(dt, elapsed, 0);
        lightning.update(dt, 0.5, false);
        particles.update(dt);
      }
      const angle = paused ? 0.35 : 0.35 + elapsed * 0.035;
      const distance = camera.aspect < 0.9 ? 21 : 16;
      camera.position.set(
        Math.sin(angle) * distance,
        5,
        Math.cos(angle) * distance,
      );
      camera.lookAt(0, 3.3, 0);
      renderer.render(scene, camera);
    }
    function sync() {
      last = 0;
      pauseButton.textContent = paused ? "Resume animation" : "Pause animation";
      statusText.textContent = paused
        ? "Animation paused. The scene is still available to view."
        : "Animation running. You can pause it at any time.";
      renderer.setAnimationLoop(
        !paused && !document.hidden && inView ? draw : null,
      );
      if (paused) draw();
    }
    const observer = new ResizeObserver(() => {
      const w = stage.clientWidth,
        h = stage.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (paused) draw();
    });
    observer.observe(stage);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    visibility.observe(stage);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        paused = true;
        sync();
      }
    });
    pauseButton.addEventListener("click", () => {
      paused = !paused;
      sync();
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      paused = true;
      renderer.setAnimationLoop(null);
      pauseButton.disabled = true;
      statusText.textContent =
        "The graphics context was lost. Reload this page to try again, or return to the portfolio.";
    });
    document.getElementById("lab-placeholder").hidden = true;
    startButton.hidden = true;
    pauseButton.hidden = false;
    pauseButton.focus();
    sync();
  } catch (error) {
    if (renderer) {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    }
    statusText.textContent =
      "The 3D scene could not load. Your browser may not support WebGL, or the graphics library may be unavailable. The portfolio remains fully accessible.";
    startButton.disabled = false;
    startButton.textContent = "Try loading again";
  }
});
