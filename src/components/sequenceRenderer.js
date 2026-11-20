import * as THREE from 'three';

/* =====================================================================
   Sequence renderers
   - createGLRenderer: Three.js WebGL renderer. Your frames are drawn by a
     custom shader (cross-dissolve, speed-based radial motion blur, chromatic
     aberration, lens bend, colour grade, light leak, vignette, film grain)
     with a 3D layer of sunlit dust particles on top.
   - createCanvasRenderer: plain 2D fallback for devices without WebGL.
   Both expose: draw(state), resize(), dispose(), kind
   ===================================================================== */

export const SEQ_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const seqFrag = taps => /* glsl */`
precision highp float;
#define TAPS ${taps}
uniform sampler2D tA;
uniform sampler2D tB;
uniform float uMix;
uniform float uVel;
uniform float uTime;
uniform float uLeak;
uniform float uScale;
uniform float uGrain;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uOff;
uniform vec2 uLeakPos;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 cover(vec2 uv){
  float ra = uRes.x / uRes.y; float ri = uImg.x / uImg.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  return (uv - 0.5) * s / uScale + 0.5 + uOff;
}
vec3 samp(vec2 uv){ return mix(texture2D(tA, uv).rgb, texture2D(tB, uv).rgb, uMix); }

void main(){
  vec2 uv = cover(vUv);
  vec2 d = uv - 0.5;
  float r2 = dot(d, d);
  uv += d * r2 * (0.05 + 0.55 * uVel);                 // lens bend, stronger at speed
  vec2 dir = uv - 0.5;
  float blur = 0.05 * uVel;                            // radial motion blur
  float ab = (0.0018 + 0.012 * uVel) * (0.4 + r2 * 3.0);  // chromatic aberration toward edges
  vec3 col = vec3(0.0);
  for (int i = 0; i < TAPS; i++) {
    float t = float(i) / float(TAPS - 1);
    vec2 u = uv - dir * blur * t;
    col += vec3(samp(u + dir * ab).r, samp(u).g, samp(u - dir * ab).b);
  }
  col /= float(TAPS);

  // grade: gentle contrast + saturation, warm shadows / cool highlights
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 1.08);
  col = (col - 0.5) * 1.05 + 0.5;
  col += vec3(0.022, 0.010, -0.018) * (1.0 - l) + vec3(-0.006, 0.0, 0.012) * l;

  // golden-hour light leak
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float lk = smoothstep(0.95, 0.0, distance(vUv * asp, uLeakPos * asp));
  col += vec3(1.0, 0.66, 0.33) * lk * lk * uLeak * 0.5;

  // vignette
  float v = smoothstep(1.2, 0.35, length((vUv - 0.5) * vec2(1.0, 0.92)) * 1.35);
  col *= mix(0.58, 1.0, v);

  // film grain
  col += (hash(vUv * uRes + fract(uTime * 7.0)) - 0.5) * uGrain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function dustSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,240,215,1)'); g.addColorStop(.35, 'rgba(255,220,170,.45)'); g.addColorStop(1, 'rgba(255,200,140,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

export function createGLRenderer(canvas, { mobile } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.autoClear = false;
  renderer.setClearColor(0x0d0c0a, 1);

  /* --- full-screen frame plane --- */
  const scene = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mkTex = () => { const t = new THREE.Texture(); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
  const texA = mkTex(), texB = mkTex();
  const U = {
    tA: { value: texA }, tB: { value: texB }, uMix: { value: 0 }, uVel: { value: 0 }, uTime: { value: 0 }, uLeak: { value: .5 },
    uScale: { value: 1.05 }, uGrain: { value: mobile ? .05 : .065 }, uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(16, 9) },
    uOff: { value: new THREE.Vector2() }, uLeakPos: { value: new THREE.Vector2(.82, .86) }
  };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: SEQ_VERT, fragmentShader: seqFrag(mobile ? 5 : 9), depthTest: false, depthWrite: false });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  /* --- 3D dust particles --- */
  const pScene = new THREE.Scene(); const pCam = new THREE.PerspectiveCamera(60, 1, .1, 200);
  const COUNT = mobile ? 380 : 900, pos = new Float32Array(COUNT * 3), spd = new Float32Array(COUNT);
  const rand = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < COUNT; i++) { pos[i * 3] = rand(-34, 34); pos[i * 3 + 1] = rand(-20, 20); pos[i * 3 + 2] = rand(-70, -2); spd[i] = rand(.5, 1.5); }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: .32, map: dustSprite(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe2b8, opacity: .6, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat); pScene.add(points);

  let W = 1, H = 1, last = performance.now();
  function resize() {
    W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(W, H, false); U.uRes.value.set(W, H); pCam.aspect = W / H; pCam.updateProjectionMatrix();
  }
  const setImg = (tex, img) => { if (img && tex.image !== img) { tex.image = img; tex.needsUpdate = true; } };

  function draw(s) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!s.a) return;
    setImg(texA, s.a); setImg(texB, s.b || s.a);
    U.uMix.value = s.b ? s.mix : 0; U.uVel.value = Math.min(1, s.vel * .32);
    U.uTime.value = s.time; U.uLeak.value = s.leak; U.uScale.value = s.scale;
    U.uImg.value.set(s.a.naturalWidth || s.a.width || 16, s.a.naturalHeight || s.a.height || 9);
    U.uOff.value.set(-s.ox / W * .5, s.oy / H * .5);
    // dust drifts toward the camera, rushing past when you scroll fast
    const p = pGeo.attributes.position; const fwd = (.6 + Math.min(40, s.vel * 18)) * dt * s.dir;
    for (let i = 0; i < COUNT; i++) {
      let z = p.array[i * 3 + 2] + fwd * spd[i];
      p.array[i * 3] += Math.sin(s.time * .3 + i) * .004; p.array[i * 3 + 1] += (Math.cos(s.time * .25 + i * 1.7) * .003 + .002);
      if (z > -1) { z = -70; } else if (z < -70) { z = -1.5; }
      if (p.array[i * 3 + 1] > 20) p.array[i * 3 + 1] = -20;
      p.array[i * 3 + 2] = z;
    }
    p.needsUpdate = true;
    pMat.opacity = s.dust; pMat.size = .32 + Math.min(.4, s.vel * .08);
    pCam.rotation.y = -s.mx * .08; pCam.rotation.x = s.my * .05;
    renderer.clear(); renderer.render(scene, cam); if (s.dust > .01) renderer.render(pScene, pCam);
  }
  resize();
  return { kind: 'gl', draw, resize, dispose() { renderer.dispose(); mat.dispose(); pGeo.dispose(); pMat.dispose(); texA.dispose(); texB.dispose(); } };
}

/* ---------- 2D fallback ---------- */
export function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let W = 1, H = 1, dpr = 1; const filterOK = 'filter' in ctx;
  function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  const img = (im, alpha, scale, ox, oy) => { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; const k = Math.max(W / iw, H / ih) * scale; ctx.globalAlpha = alpha; ctx.drawImage(im, (W - iw * k) / 2 + ox, (H - ih * k) / 2 + oy, iw * k, ih * k); };
  function draw(s) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#0d0c0a'; ctx.fillRect(0, 0, W, H);
    if (!s.a) return;
    const blur = Math.min(3.5, s.vel * .9);
    if (filterOK) ctx.filter = blur > .25 ? `blur(${blur.toFixed(2)}px) saturate(1.06) contrast(1.04)` : 'saturate(1.06) contrast(1.04)';
    img(s.a, 1, s.scale, s.ox, s.oy); if (s.b && s.mix > .01) img(s.b, s.mix, s.scale, s.ox, s.oy);
    if (filterOK) ctx.filter = 'none'; ctx.globalAlpha = 1;
  }
  resize();
  return { kind: '2d', draw, resize, dispose() { } };
}
