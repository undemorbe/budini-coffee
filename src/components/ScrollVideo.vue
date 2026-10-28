<script setup>
// Scroll-video по методике скилла scroll-video-website:
// фиксированная сцена + canvas, WebP-кадры с прогрессивной загрузкой,
// плавный плейхед и смешивание соседних кадров. Текстовые «моменты» задаются
// в слоте атрибутами data-in / data-out (доля прогресса от 0 до 1).
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  frameCount: { type: Number, required: true },
  path: { type: String, default: 'frames/frame_' },
  ext: { type: String, default: 'webp' },
  height: { type: String, default: '460vh' },
  // кадр, который держим при prefers-reduced-motion (по умолчанию последний)
  stillFrame: { type: Number, default: null },
  background: { type: String, default: '#050608' },
  // вертикальная версия для телефонов: { frameCount, path }. Включается на портретных экранах.
  portrait: { type: Object, default: null },
})

const section = ref(null)
const stage = ref(null)
const canvas = ref(null)
const overlay = ref(null)
const ready = ref(false)

let cleanup = () => {}

// Запуск сцены для одного набора кадров. Возвращает функцию очистки, поэтому при смене
// ориентации экрана можно остановить текущий набор и запустить другой.
const start = ({ frameCount: N, path, stillFrame, light }) => {
  const ctx = canvas.value.getContext('2d', { alpha: false })
  const base = import.meta.env.BASE_URL
  const url = (i) => `${base}${path}${String(i + 1).padStart(4, '0')}.${props.ext}`

  const images = new Array(N)
  const loaded = new Uint8Array(N)
  const requested = new Uint8Array(N)
  const queue = []
  let active = 0
  const MAX_PARALLEL = 6
  let needsDraw = true
  let destroyed = false

  const pump = () => {
    while (!destroyed && active < MAX_PARALLEL && queue.length) {
      const i = queue.shift()
      active++
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        images[i] = img
        loaded[i] = 1
        active--
        needsDraw = true
        lastCenter = -1
        if (i === 0) onFirstFrame()
        pump()
      }
      img.onerror = () => {
        active--
        pump()
      }
      img.src = url(i)
    }
  }
  const request = (i) => {
    if (requested[i]) return
    requested[i] = 1
    queue.push(i)
  }

  // 1) первый кадр → 2) каждый восьмой по всей шкале → 3) остальные
  const onFirstFrame = () => {
    for (let i = 8; i < N; i += 8) request(i)
    request(N - 1)
    for (let i = 1; i < N; i++) request(i)
    pump()
  }
  request(0)
  pump()

  const nearest = (i) => {
    if (loaded[i]) return i
    for (let d = 1; d < N; d++) {
      if (i - d >= 0 && loaded[i - d]) return i - d
      if (i + d < N && loaded[i + d]) return i + d
    }
    return -1
  }

  // Окно заранее декодированных кадров вокруг плейхеда: img.decode() декодирует кадр
  // вне главного потока, поэтому drawImage при торможении не подвисает на декодировании.
  // ImageBitmap здесь не используем: в Chrome частое создание ImageBitmap и их отрисовка
  // в 2D canvas роняют вкладку (GPU: «Failure to deserialize transfer cache entry»).
  const decoded = new Set()
  const pendingDecode = new Set()
  // на телефоне окно меньше: меньше памяти, вкладку не выгрузит
  const WINDOW = light ? 10 : 16
  const KEEP = light ? 20 : 36
  let lastCenter = -1
  const ensureWindow = (center) => {
    if (center === lastCenter) return
    lastCenter = center
    // вышедшие из окна кадры браузер может выгрузить; при возврате декодируем заново
    for (const i of decoded) if (Math.abs(i - center) > KEEP) decoded.delete(i)
    for (let d = 0; d <= WINDOW; d++) {
      for (const i of d ? [center + d, center - d] : [center]) {
        if (i < 0 || i >= N || !loaded[i] || decoded.has(i) || pendingDecode.has(i)) continue
        if (pendingDecode.size >= 4) return
        pendingDecode.add(i)
        images[i]
          .decode()
          .then(() => {
            pendingDecode.delete(i)
            if (destroyed) return
            decoded.add(i)
            lastCenter = -1 // дозаполнить окно на следующем кадре
          })
          .catch(() => pendingDecode.delete(i))
      }
    }
  }

  // ---- размеры canvas с учётом DPR (не больше 2) ----
  let cssW = 0
  let cssH = 0
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cssW = stage.value.clientWidth
    cssH = stage.value.clientHeight
    canvas.value.width = Math.round(cssW * dpr)
    canvas.value.height = Math.round(cssH * dpr)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    needsDraw = true
    measure()
  }

  const drawCover = (img, alpha) => {
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    const s = Math.max(cssW / iw, cssH / ih)
    const dw = iw * s
    const dh = ih * s
    ctx.globalAlpha = alpha
    ctx.drawImage(img, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh)
  }

  let current = 0
  let target = 0
  let progress = 0

  const draw = () => {
    ctx.globalAlpha = 1
    ctx.fillStyle = props.background
    ctx.fillRect(0, 0, cssW, cssH)
    const a = Math.floor(current)
    const b = Math.min(a + 1, N - 1)
    const frac = current - a
    const ia = nearest(a)
    if (ia >= 0) drawCover(images[ia], 1)
    if (frac > 0.002) {
      const ib = nearest(b)
      if (ib >= 0 && ib !== ia) drawCover(images[ib], frac)
    }
    ctx.globalAlpha = 1
    if (!ready.value && ia >= 0) ready.value = true
  }

  // ---- прогресс считаем только по своей секции ----
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const measure = () => {
    const rect = section.value.getBoundingClientRect()
    const range = section.value.offsetHeight - window.innerHeight
    progress = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0
    if (reduce.matches) {
      target = stillFrame ?? N - 1
    } else {
      target = progress * (N - 1)
    }
  }
  const onReduceChange = () => {
    measure()
    if (reduce.matches) {
      current = target
      velocity = 0
    }
    needsDraw = true
  }

  // ---- текстовые моменты поверх видео ----
  const moments = [...overlay.value.querySelectorAll('[data-in]')].map((el) => ({
    el,
    a: parseFloat(el.dataset.in),
    b: parseFloat(el.dataset.out ?? '1.01'),
  }))
  // мягкое появление: smoothstep по прогрессу и сдвиг с замедлением в конце
  const FADE = 0.075
  const smooth = (x) => x * x * (3 - 2 * x)
  const updateMoments = (p) => {
    for (const m of moments) {
      let o = 1
      if (m.a > 0) o = Math.min(o, (p - m.a) / FADE)
      if (m.b < 1) o = Math.min(o, (m.b - p) / FADE)
      o = smooth(Math.max(0, Math.min(1, o)))
      m.el.style.opacity = o.toFixed(3)
      m.el.style.transform = `translate3d(0, ${((1 - o) * (1 - o) * 28).toFixed(2)}px, 0)`
      m.el.style.visibility = o < 0.005 ? 'hidden' : 'visible'
    }
  }

  // ---- единый цикл requestAnimationFrame ----
  // Плейхед ведёт критически затухающая пружина: разгон и торможение плавные,
  // без резкого рывка в начале и без «удара» при остановке прокрутки.
  const STIFFNESS = 30
  const DAMPING = 2 * Math.sqrt(STIFFNESS)
  let velocity = 0
  let raf = 0
  let last = performance.now()
  let lastP = -1
  const loop = (now) => {
    let dt = Math.min((now - last) / 1000, 0.1)
    last = now
    const prev = current
    // мелкие шаги, чтобы пружина была устойчивой при редких кадрах
    while (dt > 0) {
      const h = Math.min(dt, 1 / 120)
      velocity += (STIFFNESS * (target - current) - DAMPING * velocity) * h
      current += velocity * h
      dt -= h
    }
    current = Math.min(N - 1, Math.max(0, current))
    if (Math.abs(target - current) < 0.002 && Math.abs(velocity) < 0.02) {
      current = target
      velocity = 0
    }
    ensureWindow(Math.round(current))
    if (needsDraw || current !== prev) {
      draw()
      needsDraw = false
    }
    // текст следует за сглаженным видео, а не за «сырой» прокруткой
    const p = reduce.matches ? progress : current / (N - 1)
    if (Math.abs(p - lastP) > 0.00005) {
      updateMoments(p)
      lastP = p
    }
    raf = requestAnimationFrame(loop)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(stage.value)
  window.addEventListener('scroll', measure, { passive: true })
  window.addEventListener('resize', measure)
  reduce.addEventListener('change', onReduceChange)
  resize()
  if (reduce.matches) current = target
  updateMoments(reduce.matches ? progress : current / (N - 1))
  raf = requestAnimationFrame(loop)

  // отладка плавности в dev-режиме: window.__sv() отдаёт состояние плейхеда
  if (import.meta.env.DEV) window.__sv = () => ({ current, target, velocity, progress, decoded: decoded.size })

  return () => {
    destroyed = true
    cancelAnimationFrame(raf)
    ro.disconnect()
    window.removeEventListener('scroll', measure)
    window.removeEventListener('resize', measure)
    reduce.removeEventListener('change', onReduceChange)
    queue.length = 0
    decoded.clear()
    for (const img of images) if (img) img.src = ''
  }
}

onMounted(() => {
  const portraitMq = window.matchMedia('(max-aspect-ratio: 4/5)')
  let stop = () => {}
  const run = () => {
    stop()
    const usePortrait = props.portrait && portraitMq.matches
    stop = start(
      usePortrait
        ? { ...props.portrait, light: true }
        : { frameCount: props.frameCount, path: props.path, stillFrame: props.stillFrame, light: false },
    )
  }
  run()
  portraitMq.addEventListener('change', run)
  cleanup = () => {
    portraitMq.removeEventListener('change', run)
    stop()
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <section ref="section" class="sv" :style="{ height }">
    <div ref="stage" class="sv__stage">
      <canvas ref="canvas" class="sv__canvas" :class="{ 'is-ready': ready }" aria-hidden="true"></canvas>
      <div ref="overlay" class="sv__overlay">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.sv {
  position: relative;
}

.sv__stage {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background: #050608;
}

.sv__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(1.035);
  transition:
    opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1),
    transform 2.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.sv__canvas.is-ready {
  opacity: 1;
  transform: none;
}

.sv__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sv__overlay :deep([data-in]) {
  will-change: opacity, transform;
}

.sv__overlay :deep(a),
.sv__overlay :deep(button) {
  pointer-events: auto;
}
</style>
