<script setup>
// Живой стакан конструктора: canvas-анимация напитка в прозрачном стакане Будини.
// Основа наливается струёй, молоко доливается и меняет цвет, сиропы падают каплями и ложатся
// слоями на дно, размер меняется с пружиной, поверхность колышется. seal() надевает крышку
// (у холодных напитков купол с трубочкой) и резолвится, когда стакан закрыт.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { hexToRgb } from './drinkLook'

const props = defineProps({
  base: { type: String, required: true },
  milk: { type: String, default: null },
  syrups: { type: Array, default: () => [] }, // [{ id, color }]
  size: { type: Number, default: 0.5 }, // 0 — меньший объём, 1 — больший
  cold: Boolean,
  pearls: Boolean,
  fizz: Boolean,
})

// логическая сцена, на экране масштабируется
const W = 320
const H = 440
const CX = W / 2
const BOTTOM = 404
const FILL = 0.84

const canvas = ref(null)
let ctx = null
let raf = 0
let ro = null
let last = 0
const timers = []
const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

const rand = (a, b) => a + Math.random() * (b - a)
const lerp = (a, b, t) => a + (b - a) * t
const mixRgb = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
// насыщенность цвета относительно его серого той же яркости
function saturate(c, k) {
  const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]
  return c.map((v) => Math.max(0, Math.min(255, l + (v - l) * k)))
}
const easeOutBack =(x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2)

// пружина: k жёсткость, c затухание
const spring = (v, k, c) => ({ v, vel: 0, to: v, k, c })
function stepSpring(s, dt) {
  if (reduce) {
    s.v = s.to
    s.vel = 0
    return
  }
  s.vel += (-s.k * (s.v - s.to) - s.c * s.vel) * dt
  s.v += s.vel * dt
}

const dims = (size) => ({ h: 270 * (0.7 + 0.3 * size), w: 196 * (0.84 + 0.16 * size) })

const d0 = dims(props.size)
const st = {
  t: 0,
  h: spring(d0.h, 190, 12),
  w: spring(d0.w, 190, 12),
  level: spring(0, 9, 6),
  slosh: spring(0, 55, 2.6),
  amp: 4,
  body: hexToRgb(props.base),
  bodyTo: hexToRgb(props.base),
  top: hexToRgb(props.base),
  topAmt: 0,
  topAmtTo: 0,
  foam: 0,
  foamTo: 0,
  bands: [],
  streams: [],
  drops: [],
  splashes: [],
  rings: [],
  bubbles: [],
  steam: [],
  steamClock: 0,
  fizzClock: 0,
  lid: 0,
  straw: 0,
  sealing: null,
  pearls: Array.from({ length: 18 }, (_, i) => ({ u: (i % 6) / 5, row: Math.floor(i / 6), j: rand(-0.06, 0.06), ph: rand(0, 6) })),
  ice: [-0.42, 0.02, 0.4].map((u, i) => ({ u, ph: i * 2.1, rot: rand(-0.4, 0.4) })),
}

// ---- геометрия стакана ----
function geo() {
  const h = st.h.v
  const w = st.w.v
  const top = BOTTOM - h
  return { h, w, top, bw: w * 0.74 }
}

// полуширина внутренней стенки на высоте y
function halfAt(g, y) {
  const k = Math.min(1, Math.max(0, (BOTTOM - y) / g.h))
  return lerp(g.bw / 2, g.w / 2, k) - 4
}

function cupPath(c, g, inset = 0) {
  const r = 16
  const tl = CX - g.w / 2 + inset
  const tr = CX + g.w / 2 - inset
  const bl = CX - g.bw / 2 + inset
  const br = CX + g.bw / 2 - inset
  const t = g.top + inset * 0.5
  const b = BOTTOM - inset
  c.beginPath()
  c.moveTo(tl, t)
  c.lineTo(tr, t)
  c.lineTo(br + 1, b - r)
  c.quadraticCurveTo(br, b, br - r, b)
  c.lineTo(bl + r, b)
  c.quadraticCurveTo(bl, b, bl - 1, b - r)
  c.closePath()
}

function levelY(g) {
  return BOTTOM - 4 - (g.h - 8) * st.level.v
}

function surfaceY(g, x) {
  const half = g.w / 2
  const a = reduce ? 0 : st.amp
  return levelY(g) + a * (0.6 * Math.sin(x * 0.045 + st.t * 2.4) + 0.4 * Math.sin(x * 0.09 - st.t * 3.3)) + (st.slosh.v * (x - CX)) / half
}

// ---- события ----
function pour(color, dur = 900) {
  if (reduce) return
  st.streams.push({ color: hexToRgb(color), x: CX + rand(-14, 14), t0: st.t, dur: dur / 1000 })
}

function drop(syrup) {
  const band = { id: syrup.id, color: hexToRgb(syrup.color), g: 0, to: 0 }
  st.bands.push(band)
  if (reduce) {
    band.g = band.to = 1
    return
  }
  st.drops.push({ band, color: band.color, x: CX + rand(-30, 30), y: 20, vy: 0 })
}

function splash(x, y, color, n = 7) {
  st.rings.push({ x, y, r: 3, a: 0.9 })
  for (let i = 0; i < n; i++) st.splashes.push({ x, y, vx: rand(-90, 90), vy: rand(-260, -120), r: rand(1.6, 3.6), color, life: 1 })
  st.amp = Math.min(st.amp + 3, 9)
  st.slosh.vel += rand(-30, 30)
}

function applyTargets(initial = false) {
  const base = hexToRgb(props.base)
  const milk = props.milk ? hexToRgb(props.milk) : null
  // простое смешение с белым даёт серый, поэтому смесь делаем насыщеннее: латте карамельный, а не мышиный
  st.bodyTo = milk ? saturate(mixRgb(base, milk, 0.56), 1.7) : base
  st.top = base
  st.topAmtTo = milk ? 1 : 0
  st.foamTo = milk && !props.cold ? 1 : 0
  if (initial || reduce) {
    st.body = [...st.bodyTo]
    st.topAmt = st.topAmtTo
    st.foam = st.foamTo
  }
}

// крышка: резолвится, когда стакан закрыт (у холодных ещё и трубочка вставлена)
function seal() {
  if (reduce) {
    st.lid = 1
    st.straw = 1
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    st.sealing = { t0: st.t, resolve, hit: false }
  })
}

defineExpose({ seal, canvas })

// ---- кадр ----
function update(dt) {
  st.t += dt
  const g = geo()
  stepSpring(st.h, dt)
  stepSpring(st.w, dt)
  stepSpring(st.level, dt)
  stepSpring(st.slosh, dt)
  st.amp = lerp(st.amp, 1.3, 1 - Math.exp(-dt * 1.6))

  const k = 1 - Math.exp(-dt * 4)
  st.body = mixRgb(st.body, st.bodyTo, k)
  st.topAmt = lerp(st.topAmt, st.topAmtTo, k)
  st.foam = lerp(st.foam, st.foamTo, k)

  for (const b of st.bands) b.g = lerp(b.g, b.to, 1 - Math.exp(-dt * 5))
  st.bands = st.bands.filter((b) => !(b.to === 0 && b.g < 0.02 && !st.drops.some((d) => d.band === b)))

  // струя: пока льётся, поверхность бурлит и поднимаются пузырьки
  for (const s of st.streams) {
    const p = (st.t - s.t0) / s.dur
    if (p > 0.1 && p < 0.8 && Math.random() < 0.6) {
      st.bubbles.push({ x: s.x + rand(-10, 10), y: levelY(g) + rand(10, 50), r: rand(1.5, 3.5), vy: rand(30, 70) })
      st.amp = Math.min(st.amp + dt * 9, 6)
    }
  }
  st.streams = st.streams.filter((s) => st.t - s.t0 < s.dur)

  for (const d of st.drops) {
    d.vy += 1900 * dt
    d.y += d.vy * dt
    const sy = surfaceY(g, d.x)
    if (d.y >= sy) {
      d.done = true
      d.band.to = d.band.to === 0 && !d.band.removed ? 1 : d.band.to
      splash(d.x, sy, d.color)
    }
  }
  st.drops = st.drops.filter((d) => !d.done)

  for (const p of st.splashes) {
    p.vy += 900 * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt * 1.8
  }
  st.splashes = st.splashes.filter((p) => p.life > 0 && p.y < surfaceY(g, p.x) + 2)
  for (const r of st.rings) {
    r.r += dt * 70
    r.a -= dt * 1.6
  }
  st.rings = st.rings.filter((r) => r.a > 0)

  // пузырьки тоника и после струи
  if (props.fizz && !reduce) {
    st.fizzClock += dt
    while (st.fizzClock > 0.08) {
      st.fizzClock -= 0.08
      const y = BOTTOM - 10
      st.bubbles.push({ x: CX + rand(-1, 1) * halfAt(g, y) * 0.8, y, r: rand(1, 2.6), vy: rand(40, 90) })
    }
  }
  for (const b of st.bubbles) {
    b.y -= b.vy * dt
    b.x += Math.sin(st.t * 6 + b.r * 9) * 0.3
  }
  st.bubbles = st.bubbles.filter((b) => b.y > surfaceY(g, b.x) + 2)

  // пар над горячим напитком
  if (!props.cold && !reduce && st.level.v > 0.5) {
    st.steamClock += dt
    while (st.steamClock > 0.5) {
      st.steamClock -= 0.5
      st.steam.push({ x: CX + rand(-0.28, 0.28) * g.w, t0: st.t, life: rand(2.4, 3.4), seed: rand(0, 10) })
    }
  }
  st.steam = st.steam.filter((s) => st.t - s.t0 < s.life)

  if (st.sealing) {
    const p = (st.t - st.sealing.t0) / 0.55
    st.lid = Math.min(1, Math.max(0, p))
    if (p >= 0.62 && !st.sealing.hit) {
      st.sealing.hit = true
      st.h.vel -= 160
      st.amp = 7
    }
    const sp = props.cold ? (st.t - st.sealing.t0 - 0.5) / 0.45 : 1
    st.straw = Math.min(1, Math.max(0, sp))
    if (p >= 1 && sp >= 1) {
      st.sealing.resolve()
      st.sealing = null
    }
  }
}

function draw() {
  const c = ctx
  const g = geo()
  c.clearRect(0, 0, W, H)

  // неоновый отсвет под стаканом
  const glow = c.createRadialGradient(CX, BOTTOM + 6, 4, CX, BOTTOM + 6, g.w * 0.9)
  glow.addColorStop(0, 'rgba(102,212,190,0.28)')
  glow.addColorStop(1, 'rgba(102,212,190,0)')
  c.fillStyle = glow
  c.beginPath()
  c.ellipse(CX, BOTTOM + 6, g.w * 0.9, 22, 0, 0, Math.PI * 2)
  c.fill()

  cupPath(c, g)
  c.fillStyle = 'rgba(232,243,241,0.045)'
  c.fill()

  // ---- содержимое, обрезанное стенками ----
  c.save()
  cupPath(c, g, 4)
  c.clip()

  const lv = levelY(g)
  if (st.level.v > 0.005) {
    const left = CX - g.w / 2
    const right = CX + g.w / 2
    const surf = new Path2D()
    surf.moveTo(left, surfaceY(g, left))
    for (let x = left + 4; x <= right; x += 4) surf.lineTo(x, surfaceY(g, x))
    surf.lineTo(right, BOTTOM + 2)
    surf.lineTo(left, BOTTOM + 2)
    surf.closePath()

    const depth = BOTTOM - lv
    const grad = c.createLinearGradient(0, lv - 6, 0, BOTTOM)
    grad.addColorStop(0, rgba(mixRgb(st.body, st.top, st.topAmt * 0.9)))
    grad.addColorStop(Math.min(0.9, 0.3 * st.topAmt + 0.02), rgba(st.body))
    grad.addColorStop(1, rgba(mixRgb(st.body, [0, 0, 0], 0.18)))
    c.fillStyle = grad
    c.fill(surf)

    // сиропы слоями на дне
    let y = BOTTOM
    st.bands.forEach((b, i) => {
      const hgt = depth * 0.075 * b.g
      if (hgt < 0.5) return
      const t = y - hgt
      const bandGrad = c.createLinearGradient(0, t - 3, 0, y)
      bandGrad.addColorStop(0, rgba(b.color, 0.35))
      bandGrad.addColorStop(0.35, rgba(b.color, 0.92))
      bandGrad.addColorStop(1, rgba(b.color, 0.95))
      c.fillStyle = bandGrad
      c.beginPath()
      c.moveTo(left, y)
      for (let x = left; x <= right; x += 6) c.lineTo(x, t + Math.sin(x * 0.07 + st.t * 1.3 + i * 2) * 1.6 * b.g)
      c.lineTo(right, y)
      c.closePath()
      c.fill()
      y = t
    })

    // тапиока на дне
    if (props.pearls) {
      for (const p of st.pearls) {
        const py = BOTTOM - 12 - p.row * 13 + Math.sin(st.t * 1.7 + p.ph) * 1.4
        if (py < lv + 8) continue
        const half = halfAt(g, py) - 10
        const px = CX + (p.u * 2 - 1 + p.j) * half + (p.row % 2) * 6
        c.fillStyle = '#24140d'
        c.beginPath()
        c.arc(px, py, 6.5, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = 'rgba(255,255,255,0.28)'
        c.beginPath()
        c.arc(px - 2, py - 2.2, 1.8, 0, Math.PI * 2)
        c.fill()
      }
    }

    // пена у горячих напитков с молоком
    if (st.foam > 0.02) {
      c.fillStyle = `rgba(247,240,228,${0.92 * st.foam})`
      c.beginPath()
      c.moveTo(left, surfaceY(g, left))
      for (let x = left + 4; x <= right; x += 4) c.lineTo(x, surfaceY(g, x))
      for (let x = right; x >= left; x -= 4) c.lineTo(x, surfaceY(g, x) + 9 * st.foam + Math.sin(x * 0.2 + st.t) * 0.8)
      c.closePath()
      c.fill()
    }

    for (const b of st.bubbles) {
      c.strokeStyle = 'rgba(255,255,255,0.45)'
      c.lineWidth = 1
      c.beginPath()
      c.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      c.stroke()
    }

    // лёд у холодных
    if (props.cold && st.level.v > 0.4) {
      for (const ice of st.ice) {
        const half = halfAt(g, lv)
        const ix = CX + ice.u * half
        const iy = surfaceY(g, ix) + 4 + Math.sin(st.t * 1.4 + ice.ph) * 2.5
        c.save()
        c.translate(ix, iy)
        c.rotate(ice.rot + Math.sin(st.t * 0.9 + ice.ph) * 0.06)
        c.fillStyle = 'rgba(235,250,248,0.22)'
        c.strokeStyle = 'rgba(235,250,248,0.6)'
        c.lineWidth = 1.2
        c.beginPath()
        c.roundRect(-15, -15, 30, 30, 6)
        c.fill()
        c.stroke()
        c.strokeStyle = 'rgba(255,255,255,0.7)'
        c.beginPath()
        c.moveTo(-9, -9)
        c.lineTo(3, -9)
        c.stroke()
        c.restore()
      }
    }

    for (const r of st.rings) {
      c.strokeStyle = `rgba(255,255,255,${r.a * 0.6})`
      c.lineWidth = 1.5
      c.beginPath()
      c.ellipse(r.x, r.y + 1, r.r, r.r * 0.22, 0, 0, Math.PI * 2)
      c.stroke()
    }
  }

  // блик стекла
  const hl = c.createLinearGradient(CX - g.w / 2, 0, CX - g.w / 2 + 38, 0)
  hl.addColorStop(0, 'rgba(255,255,255,0)')
  hl.addColorStop(0.45, 'rgba(255,255,255,0.13)')
  hl.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = hl
  c.fillRect(CX - g.w / 2 + 10, g.top + 14, 38, g.h - 40)
  c.restore()

  // ---- струи, капли, брызги поверх ----
  for (const s of st.streams) {
    const p = (st.t - s.t0) / s.dur
    const head = Math.min(1, p / 0.18) // струя долетает до поверхности
    const tail = Math.max(0, (p - 0.72) / 0.28) // и обрывается сверху
    const sy = surfaceY(g, s.x)
    const y0 = lerp(-10, sy, tail)
    const y1 = lerp(-10, sy, head)
    const w = 9 * Math.sin(Math.PI * Math.min(1, p * 1.15)) + 2
    c.strokeStyle = rgba(s.color)
    c.lineCap = 'round'
    c.lineWidth = w
    c.beginPath()
    c.moveTo(s.x + Math.sin(st.t * 9) * 1.5, y0)
    c.quadraticCurveTo(s.x + Math.sin(st.t * 7) * 3, (y0 + y1) / 2, s.x, y1)
    c.stroke()
  }

  for (const d of st.drops) {
    c.fillStyle = rgba(d.color)
    c.beginPath()
    c.moveTo(d.x, d.y - 15)
    c.quadraticCurveTo(d.x + 6, d.y - 3, d.x, d.y + 5)
    c.quadraticCurveTo(d.x - 6, d.y - 3, d.x, d.y - 15)
    c.fill()
    c.fillStyle = 'rgba(255,255,255,0.4)'
    c.beginPath()
    c.arc(d.x - 1.6, d.y - 2, 1.4, 0, Math.PI * 2)
    c.fill()
  }

  for (const p of st.splashes) {
    c.fillStyle = rgba(p.color, Math.max(0, p.life))
    c.beginPath()
    c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    c.fill()
  }

  // трубочка у холодных: входит в купол сверху после крышки
  if (props.cold && st.straw > 0) {
    const off = (1 - easeOutBack(st.straw)) * -220
    c.save()
    c.translate(CX + 22, g.top - 70 + off)
    c.rotate(0.12)
    c.fillStyle = '#66d4be'
    const sw = props.pearls ? 14 : 9
    c.fillRect(-sw / 2, 0, sw, g.h + 50)
    c.fillStyle = 'rgba(255,255,255,0.35)'
    c.fillRect(-sw / 2 + 2, 0, 2, g.h + 50)
    c.restore()
  }

  // стенки, ободок и наклейка
  cupPath(c, g)
  c.strokeStyle = 'rgba(232,243,241,0.42)'
  c.lineWidth = 2
  c.stroke()
  c.strokeStyle = 'rgba(232,243,241,0.55)'
  c.lineWidth = 1.5
  c.beginPath()
  c.ellipse(CX, g.top, g.w / 2, 5, 0, 0, Math.PI * 2)
  c.stroke()

  const ly = g.top + g.h * 0.58
  c.fillStyle = '#66d4be'
  c.beginPath()
  c.roundRect(CX - 40, ly - 12, 80, 24, 12)
  c.fill()
  c.fillStyle = '#07090c'
  c.font = '800 10.5px Unbounded, "Arial Black", sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText('БУДИНИ', CX, ly + 0.5)

  drawLid(c, g)

  for (const s of st.steam) {
    const p = (st.t - s.t0) / s.life
    const y0 = st.lid > 0.9 ? g.top - (props.cold ? 46 : 22) : levelY(g) - 6
    const len = 40 + 120 * p
    c.strokeStyle = `rgba(232,243,241,${0.16 * Math.sin(Math.PI * p)})`
    c.lineWidth = 6 + 10 * p
    c.lineCap = 'round'
    c.beginPath()
    for (let i = 0; i <= 12; i++) {
      const q = i / 12
      const y = y0 - 10 - p * 60 - q * len
      const x = s.x + Math.sin(s.seed + q * 4 + st.t * 1.6) * 10 * (0.3 + q)
      if (i === 0) c.moveTo(x, y)
      else c.lineTo(x, y)
    }
    c.stroke()
  }
}

function drawLid(c, g) {
  if (st.lid <= 0) return
  const e = easeOutBack(st.lid)
  const y = g.top - 4 - (1 - e) * 170
  c.save()
  c.globalAlpha = Math.min(1, st.lid * 3)
  if (props.cold) {
    // прозрачный купол
    c.fillStyle = 'rgba(232,243,241,0.08)'
    c.strokeStyle = 'rgba(232,243,241,0.6)'
    c.lineWidth = 2
    c.beginPath()
    c.ellipse(CX, y, g.w / 2 + 2, 48, 0, Math.PI, 0)
    c.fill()
    c.stroke()
    c.fillStyle = 'rgba(232,243,241,0.75)'
    c.beginPath()
    c.roundRect(CX - g.w / 2 - 6, y - 3, g.w + 12, 9, 4)
    c.fill()
  } else {
    // плоская крышка как на стакане с вывески
    c.fillStyle = '#e8f3f1'
    c.beginPath()
    c.roundRect(CX - g.w / 2 - 7, y - 6, g.w + 14, 14, 7)
    c.fill()
    c.fillStyle = '#cfdedb'
    c.beginPath()
    c.moveTo(CX - g.w * 0.42, y - 5)
    c.lineTo(CX - g.w * 0.36, y - 20)
    c.lineTo(CX + g.w * 0.36, y - 20)
    c.lineTo(CX + g.w * 0.42, y - 5)
    c.closePath()
    c.fill()
    c.fillStyle = '#07090c'
    c.beginPath()
    c.roundRect(CX + g.w * 0.08, y - 16, 30, 5, 2.5)
    c.fill()
    c.strokeStyle = '#66d4be'
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(CX - g.w / 2 - 4, y + 8)
    c.lineTo(CX + g.w / 2 + 4, y + 8)
    c.stroke()
  }
  c.restore()
}

function frame(now) {
  // на медленном устройстве шаг крупнее, но не больше 0.1 с: после свёрнутой вкладки без рывка
  const dt = Math.min(0.1, (now - last) / 1000 || 0.016)
  last = now
  // мелкий шаг, чтобы пружины не разносило на редких кадрах
  const n = Math.ceil(dt / 0.012)
  for (let i = 0; i < n; i++) update(dt / n)
  draw()
  raf = requestAnimationFrame(frame)
}

function resize() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const cssW = el.clientWidth || W
  el.width = Math.round(cssW * dpr)
  el.height = Math.round((cssW * H * dpr) / W)
  const s = el.width / W
  ctx.setTransform(s, 0, 0, s, 0, 0)
}

// ---- реакция на выбор ----
watch(
  () => props.size,
  (v) => {
    const d = dims(v)
    st.h.to = d.h
    st.w.to = d.w
    st.amp = Math.min(st.amp + 3, 8)
    st.slosh.vel += 40
  },
)

watch(
  () => [props.base, props.milk],
  ([, milk], [, was]) => {
    if (milk === was) return applyTargets()
    // струя молока (или основы, если молоко убрали), цвет меняется, когда она долетела
    pour(milk ?? props.base, 950)
    timers.push(setTimeout(() => applyTargets(), reduce ? 0 : 260))
  },
)

watch(
  () => props.syrups.map((s) => s.id).join(','),
  () => {
    const ids = props.syrups.map((s) => s.id)
    for (const b of st.bands) {
      if (!ids.includes(b.id) && !b.removed) {
        b.removed = true
        b.to = 0
      }
    }
    const live = st.bands.filter((b) => !b.removed).map((b) => b.id)
    for (const s of props.syrups) if (!live.includes(s.id)) drop(s)
  },
)

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(canvas.value)
  // стакан наполняется: сначала основа, затем молоко
  applyTargets(true)
  st.level.to = FILL
  pour(props.base, 1100)
  if (props.milk && !reduce) {
    st.body = st.bodyTo = hexToRgb(props.base)
    st.topAmt = st.topAmtTo = st.foam = st.foamTo = 0
    timers.push(
      setTimeout(() => {
        pour(props.milk ?? props.base, 900)
        timers.push(setTimeout(() => applyTargets(), 260))
      }, 650),
    )
  }
  for (const s of props.syrups) drop(s)
  last = performance.now()
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  timers.forEach(clearTimeout)
  ro?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="cup" role="img" aria-label="Стакан с напитком: меняется вместе с выбором"></canvas>
</template>

<style scoped>
.cup {
  width: 100%;
  aspect-ratio: 320 / 440;
  height: auto;
}
</style>
