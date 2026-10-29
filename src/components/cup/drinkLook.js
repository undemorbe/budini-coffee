// Как напиток выглядит в стакане конструктора: цвет основы по названию позиции,
// молоко и сиропы из выбранных добавок, подача (лёд, тапиока, пузырьки тоника).
import { findMilk, findSyrups } from '../../domain/menu/order'

const ESPRESSO = '#3b2216'

// порядок важен: «Мокко пряный апельсин» шоколадный, «Апельсиновый бамбл» апельсиновый
const BASES = [
  [/matcha/, '#86b04a'],
  [/anchan/, '#5a58cf'],
  [/blueberry/, '#6f49a8'],
  [/seabuckthorn/, '#ef9d32'],
  [/grapefruit/, '#e0604a'],
  [/apple/, '#cf9748'],
  [/cherry/, '#8c1d38'],
  [/strawberry/, '#d8607a'],
  [/raspberry/, '#c8456a'],
  [/chocolate|cocoa|mocha|nutella|oreo|snickers/, '#4b2818'],
  [/orange/, '#ea8a28'],
  [/pumpkin/, '#c9772f'],
  [/chai/, '#a8683a'],
  [/tea_green/, '#c6be68'],
  [/tea_black/, '#8a4520'],
  [/tonic/, '#c58b50'],
]

export function baseColor(item) {
  return BASES.find(([re]) => re.test(item.id))?.[1] ?? ESPRESSO
}

// Свойства для <DrinkCup>: основа, молоко, сиропы и подача
export function drinkLook(item, config, modifiers) {
  const milk = findMilk(modifiers, config.milk)
  return {
    base: baseColor(item),
    milk: milk?.color ?? null,
    syrups: findSyrups(modifiers, config.syrups).map((s) => ({ id: s.id, color: s.color ?? '#c67b2c' })),
    size: item.volumes.length > 1 ? config.volumeIndex / (item.volumes.length - 1) : 0.5,
    cold: item.cold,
    pearls: item.tapioca,
    fizz: /tonic/.test(item.id),
  }
}

// Цвет напитка в миниатюре подноса: основа, разбавленная молоком
export function swatch(item, config, modifiers) {
  const look = drinkLook(item, config, modifiers)
  return { body: look.milk ? mix(look.base, look.milk, 0.6) : look.base, top: look.base, syrups: look.syrups.map((s) => s.color) }
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function mix(a, b, t) {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}
