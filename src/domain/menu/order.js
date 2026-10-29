// Конструктор напитка и поднос: добавки, настройка позиции и её цена.
//
// Modifiers  { milks: Milk[], syrups: Syrup[], syrupLimit }
// Milk       { id, name, price, color, isPlant }
// Syrup      { id, name, price, color }
// Config     { volumeIndex, milk, syrups, qty }  milk: id молока, 'none' или null (молоко не выбирается)

export const NO_MILK = { id: 'none', name: 'Без молока', price: 0, color: null, isPlant: false }

const price = (p) => (typeof p === 'number' && Number.isFinite(p) && p >= 0 ? p : 0)

export function mapModifiers(dto = {}) {
  const milks = (dto.milks ?? []).map((m) => ({ id: m.id, name: m.name, price: price(m.price), color: m.color ?? null, isPlant: Boolean(m.is_plant) }))
  const syrups = (dto.syrups ?? []).map((s) => ({ id: s.id, name: s.name, price: price(s.price), color: s.color ?? null }))
  return { milks, syrups, syrupLimit: dto.syrup_limit > 0 ? dto.syrup_limit : 3 }
}

// Настраивается только напиток: выпечка и десерты идут в поднос как есть
export const isCustomizable = (item) => item.unit === 'ml'

// Варианты молока для позиции: у напитка на молоке выбор среди видов, «по желанию» добавляет «Без молока»
export function milkOptions(item, modifiers) {
  if (!isCustomizable(item) || item.milk === 'none') return []
  return item.milk === 'optional' ? [NO_MILK, ...modifiers.milks] : modifiers.milks
}

export function syrupOptions(item, modifiers) {
  return isCustomizable(item) ? modifiers.syrups : []
}

// По умолчанию средний объём из трёх, иначе самый маленький; молоко первое из списка
export function defaultConfig(item, modifiers, volumeIndex) {
  const idx = Number.isInteger(volumeIndex) && item.volumes[volumeIndex] ? volumeIndex : item.volumes.length >= 3 ? 1 : 0
  return { volumeIndex: idx, milk: milkOptions(item, modifiers)[0]?.id ?? null, syrups: [], qty: 1 }
}

// Сироп добавляется в конец, повторное нажатие убирает; больше лимита не добавить
export function toggleSyrup(syrups, id, limit) {
  if (syrups.includes(id)) return syrups.filter((s) => s !== id)
  return syrups.length >= limit ? syrups : [...syrups, id]
}

export function findMilk(modifiers, id) {
  if (id === NO_MILK.id) return NO_MILK
  return modifiers.milks.find((m) => m.id === id) ?? null
}

export const findSyrups = (modifiers, ids = []) => ids.map((id) => modifiers.syrups.find((s) => s.id === id)).filter(Boolean)

// Цена одной порции: объём + молоко + сиропы
export function unitPrice(item, config, modifiers) {
  const volume = item.volumes[config.volumeIndex] ?? item.volumes[0]
  if (!volume) return 0
  if (!isCustomizable(item)) return volume.price
  const milk = findMilk(modifiers, config.milk)
  const syrups = findSyrups(modifiers, config.syrups)
  return volume.price + (milk?.price ?? 0) + syrups.reduce((sum, s) => sum + s.price, 0)
}

export const linePrice = (item, config, modifiers) => unitPrice(item, config, modifiers) * Math.max(1, config.qty ?? 1)

// Одинаковые напитки складываются в одну строку подноса; порядок сиропов не важен
export function lineKey(itemId, config) {
  const syrups = [...(config.syrups ?? [])].sort().join('+')
  return [itemId, config.volumeIndex ?? 0, config.milk ?? '-', syrups || '-'].join('|')
}

// «450 мл · овсяное · карамель, ваниль»
export function describeConfig(item, config, modifiers) {
  const volume = item.volumes[config.volumeIndex] ?? item.volumes[0]
  const parts = []
  if (volume?.ml) parts.push(volume.label)
  const milk = findMilk(modifiers, config.milk)
  // классическое молоко подразумевается, его не пишем
  if (milk && milk.id !== modifiers.milks[0]?.id) parts.push(milk.name.toLowerCase())
  const syrups = findSyrups(modifiers, config.syrups)
  if (syrups.length) parts.push(syrups.map((s) => s.name.toLowerCase()).join(', '))
  return parts.join(' · ')
}
