// Поднос: собранные в меню позиции. Общий на всё приложение, хранится в localStorage
// (только id позиции и настройка, цены всегда считаются по текущему меню).
import { computed, nextTick, ref, watch } from 'vue'
import { menu, modifiers } from '../data/menu'
import { findItem } from '../domain/menu/getMenu'
import { describeConfig, lineKey, linePrice } from '../domain/menu/order'

const KEY = 'budini-tray'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((l) => l && findItem(menu, l.itemId)) : []
  } catch {
    return []
  }
}

const stored = ref(load())
watch(
  stored,
  (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      // приватный режим или запрет хранилища: поднос живёт до перезагрузки
    }
  },
  { deep: true },
)

// кнопка подноса: сюда прилетают добавленные напитки
const target = ref(null)
const bump = ref(0)
// позиции в полёте: поднос показывается заранее, чтобы первому напитку было куда лететь
const incoming = ref(0)

const lines = computed(() =>
  stored.value.map((l) => {
    const item = findItem(menu, l.itemId)
    return { ...l, item, details: describeConfig(item, l.config, modifiers), total: linePrice(item, l.config, modifiers) }
  }),
)
const count = computed(() => stored.value.reduce((n, l) => n + l.config.qty, 0))
const total = computed(() => lines.value.reduce((s, l) => s + l.total, 0))

function add(item, config) {
  const key = lineKey(item.id, config)
  const same = stored.value.find((l) => l.key === key)
  if (same) same.config.qty += config.qty
  else stored.value.push({ key, itemId: item.id, config: { ...config, syrups: [...config.syrups] } })
  bump.value++
}

function setQty(key, qty) {
  const line = stored.value.find((l) => l.key === key)
  if (!line) return
  if (qty <= 0) stored.value = stored.value.filter((l) => l !== line)
  else line.config.qty = Math.min(qty, 20)
}

const clear = () => {
  stored.value = []
}

// Полёт к подносу по дуге: внешний слой ведёт по X, внутренний по Y со своим ускорением.
// node: элемент, который летит (canvas-снимок стакана или кружок «+1»)
async function fly(node, from) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  incoming.value++
  await nextTick()
  const to = target.value?.getBoundingClientRect()
  if (!to?.width) {
    incoming.value--
    return
  }
  const outer = document.createElement('div')
  const inner = document.createElement('div')
  Object.assign(outer.style, { position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, zIndex: 300, pointerEvents: 'none' })
  Object.assign(node.style, { width: '100%', height: '100%', display: 'block' })
  inner.style.cssText = 'width:100%;height:100%'
  inner.appendChild(node)
  outer.appendChild(inner)
  document.body.appendChild(outer)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const scale = Math.max(0.08, Math.min(0.4, 56 / from.height))
  const dur = Math.min(1100, 650 + Math.hypot(dx, dy) * 0.35)
  outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], { duration: dur, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' })
  const lift = Math.min(-80, dy * 0.25 - 120)
  const anim = inner.animate(
    [
      { transform: 'translateY(0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translateY(${lift}px) scale(${(1 + scale) / 1.6}) rotate(-8deg)`, opacity: 1, offset: 0.35 },
      { transform: `translateY(${dy}px) scale(${scale}) rotate(10deg)`, opacity: 0.9 },
    ],
    { duration: dur, easing: 'cubic-bezier(.3,0,.7,1)', fill: 'forwards' },
  )
  await anim.finished
  outer.remove()
  incoming.value--
}

export function useTray() {
  return { lines, count, total, add, setQty, clear, fly, target, bump, incoming }
}
