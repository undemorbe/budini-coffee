// Детерминированная 3D-сцена «Будини»: стакан навынос, кофейная воронка в фирменных
// мятных разводах, зёрна и пар. window.renderFrame(i) рисует кадр i из window.FRAMES —
// так кадры можно снять по одному и собрать из них scroll-video последовательность.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import '@fontsource/unbounded/700.css'

// Параметры из адреса: /render.html?w=720&h=1280&fov=56&frames=225 рендерит вертикальную
// версию для телефонов. Без параметров получается основная 16:9.
const q = new URLSearchParams(location.search)
const W = Number(q.get('w')) || 1600
const H = Number(q.get('h')) || 900
const FOV = Number(q.get('fov')) || 35
const FRAMES = Number(q.get('frames')) || 450
// shift > 0 поднимает объект в кадре (доля высоты): на телефоне снизу стоят плашки с текстом
const SHIFT = Number(q.get('shift')) || 0

const MINT = '#66D4BE'
const TEAL = '#3ABBB0'
const DEEP = '#1E6E69'
const INK = '#050608'

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1)
renderer.setSize(W, H)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(INK)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.55

const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.05, 120)
if (SHIFT) camera.setViewOffset(W, H, 0, Math.round(H * SHIFT), W, H)

// ---------- свет ----------
const key = new THREE.DirectionalLight('#ffffff', 2.4)
key.position.set(4, 9, 6)
scene.add(key)
const rimA = new THREE.PointLight(MINT, 70, 22)
rimA.position.set(-4.5, 3, -3)
scene.add(rimA)
const rimB = new THREE.PointLight(TEAL, 45, 22)
rimB.position.set(4.5, 0.5, -4)
scene.add(rimB)
scene.add(new THREE.AmbientLight(DEEP, 0.5))

// ---------- шейдер фирменных разводов ----------
const swirlChunk = /* glsl */ `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int k = 0; k < 5; k++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  // Полосы как на брендовом фоне: волнистые мятные разводы на чёрном.
  float stripes(vec2 p, float t){
    vec2 q = vec2(fbm(p * 1.3 + t * 0.15), fbm(p * 1.3 - t * 0.1 + 4.7));
    float s = sin((p.x * 2.2 + p.y * 1.1 + 3.6 * q.x + 2.4 * q.y) * 3.1 + t * 0.6);
    return smoothstep(0.32, 0.92, s * 0.5 + 0.5);
  }
`

function swirlMaterial({ intensity = 1, polar = false, side = THREE.FrontSide } = {}) {
  return new THREE.ShaderMaterial({
    side,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uDark: { value: new THREE.Color('#020406') },
      uMid: { value: new THREE.Color(TEAL) },
      uLight: { value: new THREE.Color('#9BE6D8') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uIntensity;
      uniform vec3 uDark; uniform vec3 uMid; uniform vec3 uLight;
      varying vec2 vUv;
      ${swirlChunk}
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        ${polar ? `
        float r = length(p);
        float a = atan(p.y, p.x);
        // воронка: закручиваем пространство сильнее к центру
        float twist = 2.6 * (1.0 - r) + uTime * 0.9;
        p = vec2(cos(a + twist), sin(a + twist)) * r;
        ` : ''}
        float s = stripes(p * 2.2, uTime);
        float hi = smoothstep(0.75, 1.0, s);
        vec3 col = mix(uDark, uMid, s);
        col = mix(col, uLight, hi * 0.55);
        ${polar ? `col *= smoothstep(1.02, 0.88, length(vUv * 2.0 - 1.0)) * 0.85 + 0.15;` : ''}
        gl_FragColor = vec4(col * uIntensity, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
}

// Фоновая «комната» из тех же разводов, сильно приглушённая.
const backdropMat = swirlMaterial({ intensity: 0.16, side: THREE.BackSide })
const backdrop = new THREE.Mesh(new THREE.SphereGeometry(45, 64, 32), backdropMat)
scene.add(backdrop)

// ---------- пол со свечением ----------
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(30, 64),
  new THREE.MeshBasicMaterial({ color: INK }),
)
floor.rotation.x = -Math.PI / 2
floor.position.y = -1.62
scene.add(floor)

function radialTexture(inner, outer, size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, inner)
  grd.addColorStop(1, outer)
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const glow = new THREE.Mesh(
  new THREE.PlaneGeometry(9, 9),
  new THREE.MeshBasicMaterial({ map: radialTexture('rgba(102,212,190,0.55)', 'rgba(102,212,190,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
)
glow.rotation.x = -Math.PI / 2
glow.position.y = -1.6
scene.add(glow)

// ---------- стакан навынос ----------
const cup = new THREE.Group()
scene.add(cup)

const profile = []
for (let i = 0; i <= 24; i++) {
  const y = -1.5 + (i / 24) * 3
  profile.push(new THREE.Vector2(0.74 + (i / 24) * 0.3, y))
}
const body = new THREE.Mesh(
  new THREE.LatheGeometry(profile, 96),
  new THREE.MeshStandardMaterial({ color: MINT, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide }),
)
cup.add(body)
const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.74, 64), body.material)
bottom.rotation.x = Math.PI / 2
bottom.position.y = -1.5
cup.add(bottom)

const rimRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.045, 0.045, 16, 96),
  new THREE.MeshStandardMaterial({ color: '#9BE6D8', roughness: 0.3 }),
)
rimRing.rotation.x = Math.PI / 2
rimRing.position.y = 1.5
cup.add(rimRing)

// Чёрная манжета с надписью БУДИНИ COFFEE (текстура рисуется на canvas).
function sleeveTexture() {
  const c = document.createElement('canvas')
  c.width = 4096
  c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#0A0D12'
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = MINT
  g.font = '700 210px Unbounded'
  g.textBaseline = 'middle'
  const label = 'БУДИНИ  COFFEE  '
  const w = g.measureText(label).width
  for (let x = 40; x < c.width; x += w + 60) {
    // зерно-эмблема перед надписью
    g.save()
    g.translate(x + 70, 256)
    g.rotate(-0.5)
    g.beginPath()
    g.ellipse(0, 0, 52, 78, 0, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#0A0D12'
    g.lineWidth = 12
    g.beginPath()
    g.moveTo(0, -66)
    g.bezierCurveTo(-26, -20, 26, 20, 0, 66)
    g.stroke()
    g.restore()
    g.fillText(label, x + 170, 262)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}
const sleeveProfile = []
for (let i = 0; i <= 8; i++) {
  const y = -0.55 + (i / 8) * 1.2
  const r = 0.74 + ((y + 1.5) / 3) * 0.3 + 0.025
  sleeveProfile.push(new THREE.Vector2(r, y))
}
const sleeve = new THREE.Mesh(
  new THREE.LatheGeometry(sleeveProfile, 128),
  new THREE.MeshStandardMaterial({ map: sleeveTexture(), roughness: 0.6, metalness: 0.05 }),
)
cup.add(sleeve)

// Поверхность кофе: закрученная воронка в фирменных разводах.
const liquidMat = swirlMaterial({ intensity: 1, polar: true })
const liquid = new THREE.Mesh(new THREE.CircleGeometry(1.0, 96), liquidMat)
liquid.rotation.x = -Math.PI / 2
liquid.position.y = 1.32
cup.add(liquid)

// Крышка: падает сверху и защёлкивается.
const lid = new THREE.Group()
const lidMat = new THREE.MeshStandardMaterial({ color: '#0B0F14', roughness: 0.35, metalness: 0.2 })
const lidProfile = [
  new THREE.Vector2(0.0, 0.22), new THREE.Vector2(0.55, 0.22), new THREE.Vector2(0.72, 0.18),
  new THREE.Vector2(0.86, 0.12), new THREE.Vector2(1.07, 0.06), new THREE.Vector2(1.1, -0.02),
  new THREE.Vector2(1.07, -0.08),
]
lid.add(new THREE.Mesh(new THREE.LatheGeometry(lidProfile, 96), lidMat))
const sip = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 6, 16), new THREE.MeshStandardMaterial({ color: MINT, emissive: MINT, emissiveIntensity: 0.6 }))
sip.rotation.z = Math.PI / 2
sip.position.set(0, 0.235, 0.62)
lid.add(sip)
scene.add(lid)

// ---------- кофейные зёрна ----------
const rand = (s) => {
  const x = Math.sin(s * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// Зерно строится из сферы: длинная ось z, выпуклая спинка снизу, плоская сторона сверху
// с S-образной бороздкой. Бороздка вдавлена в геометрию (а не наклеена сверху), её края
// чуть приподняты, а на дне видна светлая серебристая плёнка, как у настоящего обжаренного зерна.
const ROAST = new THREE.Color('#3A2012')
const ROAST_EDGE = new THREE.Color('#4C2C18')
const CREASE = new THREE.Color('#170B05')
const CHAFF = new THREE.Color('#9C7550')
function beanGeometry(seed) {
  let g = new THREE.SphereGeometry(1, 192, 96)
  g.rotateX(Math.PI / 2) // полюса сферы уходят на кончики зерна
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)

  const halfLen = 0.23 * (0.94 + rand(seed + 1) * 0.12)
  const halfWid = 0.165 * (0.92 + rand(seed + 2) * 0.12)
  const back = 0.118 // выпуклая сторона
  const face = 0.058 // плоская сторона
  const bend = 0.24 + rand(seed + 3) * 0.12 // насколько бороздка закручена буквой S
  const egg = (rand(seed + 4) - 0.5) * 0.12 // один конец чуть шире другого

  const pos = g.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)

    // плоская сторона: pow < 1 даёт ровную площадку со скруглёнными краями
    let py = y > 0 ? face * Math.pow(y, 0.62) : -back * Math.pow(-y, 0.92)
    let px = x * halfWid * (1 + egg * z)
    const pz = z * halfLen

    // бороздка: гауссов жёлоб вдоль S-кривой, к кончикам сходит на нет
    const top = THREE.MathUtils.smoothstep(y, 0.05, 0.4)
    const along = 1 - THREE.MathUtils.smoothstep(Math.abs(z), 0.62, 0.95)
    const cx = bend * z * z * z - 0.03 * z
    const w = 0.062 * (1 - 0.35 * z * z)
    const d = (x - cx) / w
    const groove = Math.exp(-d * d) * along * top
    const lips = Math.exp(-((Math.abs(d) - 2.1) ** 2 / 1.4)) * along * top
    py += -0.068 * groove + 0.006 * lips

    // половинки зерна чуть заворачиваются внутрь бороздки
    px -= Math.sign(d) * 0.012 * groove * halfWid

    // лёгкая неровность поверхности, у каждого зерна своя
    const n = Math.sin(x * 4 + seed * 3.1) * Math.sin(y * 3 + seed * 1.7) * Math.sin(z * 5 + seed * 2.3)
    const k = 1 + n * 0.012
    pos.setXYZ(i, px * k, py * k, pz * k)

    c.copy(ROAST).lerp(ROAST_EDGE, Math.max(0, 1 - Math.abs(y) * 3) * 0.6)
    c.lerp(CREASE, Math.min(1, groove * 1.25))
    const chaff = Math.exp(-(((x - cx) / (w * 0.22)) ** 2)) * along * top
    c.lerp(CHAFF, chaff * 0.55 * (0.6 + 0.4 * Math.sin(z * 14 + seed)))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}
const beanGeos = [0, 1, 2, 3].map((s) => beanGeometry(s * 17 + 5))
// обжаренное зерно матовое с маслянистым блеском
const beanMat = new THREE.MeshPhysicalMaterial({
  vertexColors: true,
  roughness: 0.55,
  metalness: 0,
  clearcoat: 0.45,
  clearcoatRoughness: 0.38,
})
const beans = []
for (let i = 0; i < 34; i++) {
  const b = new THREE.Group()
  b.add(new THREE.Mesh(beanGeos[i % beanGeos.length], beanMat))
  b.userData = {
    a0: rand(i + 1) * Math.PI * 2,
    r: 2.1 + rand(i + 11) * 1.4,
    y: -1.1 + rand(i + 21) * 3.2,
    spd: 0.55 + rand(i + 31) * 0.6,
    spin: new THREE.Vector3(rand(i + 41), rand(i + 51), rand(i + 61)).multiplyScalar(6),
    s: 0.8 + rand(i + 71) * 0.5,
  }
  b.scale.setScalar(b.userData.s)
  scene.add(b)
  beans.push(b)
}

// ---------- пар ----------
const steamTex = radialTexture('rgba(220,255,248,0.5)', 'rgba(220,255,248,0)')
const steam = []
for (let i = 0; i < 9; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }))
  s.userData = { off: rand(i + 101), x: (rand(i + 111) - 0.5) * 0.35 }
  scene.add(s)
  steam.push(s)
}

// ---------- таймлайн ----------
// Одна непрерывная траектория без остановок между «актами»: камера и объекты
// разгоняются и тормозят плавно, поэтому при прокрутке нет рывков.
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const seg = (t, a, b) => clamp01((t - a) / (b - a))
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10)
// ∫₀ᵗ smoother(seg(s, a, b)) ds в замкнутом виде (первообразная smoother: x⁶ − 3x⁵ + 2.5x⁴)
const smootherArea = (t, a, b) => {
  const x = seg(t, a, b)
  return (b - a) * x * x * x * x * (x * (x - 3) + 2.5) + Math.max(0, t - b)
}
const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2
const lerp = (a, b, k) => a + (b - a) * k
const v3 = (x, y, z) => new THREE.Vector3(x, y, z)

const camPath = new THREE.CatmullRomCurve3(
  [v3(0.0, 2.75, 0.02), v3(0.12, 4.0, 0.3), v3(0.5, 6.2, 1.4), v3(2.9, 5.2, 4.8), v3(5.4, 2.9, 6.5), v3(2.0, 1.8, 8.8), v3(-4.2, 1.15, 8.4)],
  false,
  'centripetal',
)
const lookPath = new THREE.CatmullRomCurve3(
  [v3(0, 1.32, 0), v3(0, 1.26, 0), v3(0, 1.05, 0), v3(0, 0.65, 0), v3(0, 0.38, 0), v3(0, 0.25, 0), v3(0, 0.15, 0)],
  false,
  'centripetal',
)

function cameraAt(t) {
  // мягкий старт и мягкое прибытие, но без «мёртвой зоны» в начале прокрутки
  const u = 0.2 * t + 0.8 * easeInOutSine(t)
  camera.position.copy(camPath.getPointAt(u))
  const look = lookPath.getPointAt(u)
  // сверху воронка медленно «раскручивается», затем горизонт плавно выравнивается
  const a = 0.7 * (1 - smoother(seg(t, 0, 0.45)))
  const upTop = v3(Math.sin(a), 0, -Math.cos(a))
  camera.up.copy(upTop.lerp(v3(0, 1, 0), smoother(seg(t, 0.16, 0.55))).normalize())
  camera.lookAt(look)
}

function update(t) {
  const time = t * 8 // «секунды» ролика
  liquidMat.uniforms.uTime.value = time * 1.15
  backdropMat.uniforms.uTime.value = time * 0.5

  cameraAt(t)

  // стакан медленно поворачивается и показывает надпись
  cup.rotation.y = -0.6 + smoother(seg(t, 0.38, 1)) * Math.PI * 0.85

  // крышка плавно опускается и мягко садится с едва заметным отскоком
  const kl = seg(t, 0.5, 0.74)
  const fall = smoother(kl)
  const settle = seg(t, 0.7, 0.8)
  const bounce = Math.sin(settle * Math.PI) * 0.05
  lid.position.set(0, lerp(9, 1.52, fall) + bounce, 0)
  lid.rotation.y = cup.rotation.y
  lid.rotation.x = (1 - fall) * 0.3
  lid.visible = t > 0.48

  // зёрна проявляются (растут из нуля) и по спирали подлетают к стакану
  const grow = smoother(seg(t, 0.12, 0.34))
  const kin = smoother(seg(t, 0.08, 0.66))
  // Угловая скорость орбиты падает с 0.3 до 0.22 по мере подлёта. Фазу берём интегралом
  // скорости: если умножить time на меняющуюся скорость, производная произведения даёт
  // всплеск в середине подлёта. Скорости подобраны так, чтобы зерно смещалось на экране
  // не больше ~10 px за кадр: иначе смешивание соседних кадров в ScrollVideo даёт двоение.
  const orbit = 8 * (0.3 * t - 0.08 * smootherArea(t, 0.08, 0.66))
  for (const b of beans) {
    const d = b.userData
    // стартовый радиус и высота небольшие: при дальнем подлёте зёрна проносились у самой камеры
    const r = lerp(0.8 + d.r * 1.4, d.r, kin)
    const a = d.a0 + orbit * d.spd
    b.position.set(Math.cos(a) * r, lerp(d.y + 0.6, d.y, kin) + Math.sin(time * 1.1 + d.a0) * 0.1, Math.sin(a) * r)
    b.rotation.set(d.spin.x * time * 0.15, d.spin.y * time * 0.15, d.spin.z * time * 0.15)
    b.scale.setScalar(d.s * Math.max(grow, 0.0001))
    b.visible = grow > 0.001
  }

  // пар появляется постепенно после того, как крышка села
  const ks = smoother(seg(t, 0.72, 0.95))
  for (const s of steam) {
    const d = s.userData
    const life = (time * 0.4 + d.off) % 1
    s.position.set(d.x + Math.sin(life * 6 + d.off * 10) * 0.12, 1.85 + life * 2.2, 0.62)
    s.position.applyAxisAngle(v3(0, 1, 0), cup.rotation.y)
    const size = 0.5 + life * 1.3
    s.scale.set(size, size, 1)
    s.material.opacity = ks * Math.sin(life * Math.PI) * 0.5
  }

  // свет «дышит» мятой, медленно
  rimA.intensity = 58 + Math.sin(time * 1.1) * 10
  glow.material.opacity = 0.6 + Math.sin(time * 0.9) * 0.1
}

window.FRAMES = FRAMES
window.renderFrame = (i) => {
  update(i / (FRAMES - 1))
  renderer.render(scene, camera)
  return true
}
window.sceneReady = document.fonts.load('700 210px Unbounded').then(() => {
  sleeve.material.map = sleeveTexture()
  sleeve.material.needsUpdate = true
  window.renderFrame(0)
  return true
})

// для отладки сцены из консоли: крупный план зерна и т. п.
if (import.meta.env.DEV) window.__scene = { THREE, scene, camera, renderer, beans, update }
