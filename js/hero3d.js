/* Flowing particle "data stream" background — Three.js */
import * as THREE from 'three';

(function initDataStream() {
  const canvas = document.getElementById('bg3d');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    canvas.style.display = 'none';
    return;
  }

  const COUNT = window.innerWidth < 720 ? 700 : 1500;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06060c, 0.028);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 34);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle positions + per-particle color (cyan <-> violet) + speed
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);
  const tmp = new THREE.Color();

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 90;      // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;  // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;  // z
    speeds[i] = 0.6 + Math.random() * 1.8;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.32,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Faint connecting "pipeline" lines for depth
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) {
    linePos[i * 3] = (Math.random() - 0.5) * 80;
    linePos[i * 3 + 1] = (Math.random() - 0.5) * 50;
    linePos[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.07 })
  );
  scene.add(lines);

  // Theme-aware particle colors, synced with the site theme switcher
  const THEME_COLORS = {
    nebula:    { c1: 0x22d3ee, c2: 0x8b5cf6, line: 0x22d3ee, fog: 0x06060c },
    terminal:  { c1: 0x33ff66, c2: 0xffb000, line: 0x33ff66, fog: 0x040604 },
    dashboard: { c1: 0x38e1ff, c2: 0xa06bff, line: 0x38e1ff, fog: 0x0a0d18 },
    blueprint: { c1: 0x7fd8ff, c2: 0xffd166, line: 0x7fd8ff, fog: 0x123a6d },
    light:     { c1: 0x6d28d9, c2: 0x4f46e5, line: 0x6d28d9, fog: 0xfaf9fc }
  };
  const colA = new THREE.Color(), colB = new THREE.Color();
  const colorAttr = geo.getAttribute('color');
  function paintTheme(name) {
    const t = THEME_COLORS[name] || THEME_COLORS.nebula;
    colA.setHex(t.c1); colB.setHex(t.c2);
    for (let i = 0; i < COUNT; i++) {
      tmp.copy(colA).lerp(colB, Math.random());
      colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
    }
    colorAttr.needsUpdate = true;
    lines.material.color.setHex(t.line);
    scene.fog.color.setHex(t.fog);
  }
  const initialTheme = (document.documentElement.dataset && document.documentElement.dataset.theme) || 'nebula';
  paintTheme(initialTheme);
  window.__setHeroTheme = paintTheme;

  // Mouse parallax
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) clock.getDelta();
  });

  const clock = new THREE.Clock();
  const posAttr = geo.getAttribute('position');

  (function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    const arr = posAttr.array;
    for (let i = 0; i < COUNT; i++) {
      // rise like a stream, with a gentle sinusoidal sway
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(t * 0.6 + phases[i]) * dt * 0.7;
      if (arr[i * 3 + 1] > 32) {
        arr[i * 3 + 1] = -32;
        arr[i * 3] = (Math.random() - 0.5) * 90;
      }
    }
    posAttr.needsUpdate = true;

    // ease camera toward mouse
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    camera.position.x = mx * 4;
    camera.position.y = -my * 3;
    camera.lookAt(0, 0, 0);

    points.rotation.y = t * 0.02;
    renderer.render(scene, camera);
  })();
})();
