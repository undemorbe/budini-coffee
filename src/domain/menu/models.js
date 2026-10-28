// Модели меню и маппинг из DTO (src/data/menuSource.js или будущего API) в модели для UI.
//
// Category  { id, title, emoji, badge, note, sort, isSeasonal, enabled, availableFrom, availableTo, promo, items }
// MenuItem  { id, categoryId, name, emoji, description, tags, tagIds, volumes, unit, minPrice, isNew }
// Volume    { ml, price, label }
// Tag       { id, label }

// Словарь тегов: подпись из данных → стабильный id для фильтров и аналитики.
export const TAGS = {
  кофейный: 'coffee',
  'без кофе': 'no_coffee',
  шоколадный: 'chocolate',
  пряный: 'spicy',
  цитрусовый: 'citrus',
  сливочный: 'creamy',
  ореховый: 'nutty',
  фруктовый: 'fruity',
  чайный: 'tea',
  безалкогольный: 'alcohol_free',
}

// Теги, по которым фильтруется экран меню (в этом порядке)
export const FILTER_TAGS = ['coffee', 'no_coffee', 'chocolate', 'spicy', 'citrus']

const LABELS = Object.fromEntries(Object.entries(TAGS).map(([label, id]) => [id, label]))
export const tagLabel = (id) => LABELS[id] ?? id

export function mapTag(raw) {
  const label = String(raw).trim().toLowerCase()
  return { id: TAGS[label] ?? label, label }
}

const isPrice = (p) => typeof p === 'number' && Number.isFinite(p) && p > 0

// Объёмы: только с корректной ценой, по возрастанию объёма
export function mapVolumes(raw = []) {
  return raw
    .filter((x) => x && isPrice(x.price) && x.ml > 0)
    .map((x) => ({ ml: x.ml, price: x.price, label: `${x.ml} мл` }))
    .sort((a, b) => a.ml - b.ml)
}

export function mapMenuItem(dto, category = {}) {
  const tags = (dto.tags ?? []).map(mapTag)
  // напитки продаются по объёму, выпечка и десерты поштучно (поле price)
  const byVolume = Array.isArray(dto.volumes)
  const volumes = byVolume ? mapVolumes(dto.volumes) : isPrice(dto.price) ? [{ ml: null, price: dto.price, label: 'шт.' }] : []
  return {
    id: dto.id,
    categoryId: category.id ?? null,
    name: dto.name,
    emoji: dto.emoji ?? '',
    description: dto.description ?? '',
    tags,
    tagIds: tags.map((t) => t.id),
    volumes,
    unit: byVolume ? 'ml' : 'pcs',
    minPrice: volumes.length ? Math.min(...volumes.map((x) => x.price)) : null,
    isNew: dto.is_new ?? category.badge === 'Новинка',
  }
}

// 'YYYY-MM-DD' → Date в местном времени; конец периода включительно (до 23:59:59.999)
export function parseDay(value, endOfDay = false) {
  if (!value) return null
  const [y, m, d] = String(value).split('-').map(Number)
  if (!y || !m || !d) return null
  return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d)
}

export function mapCategory(dto) {
  const category = {
    id: dto.id,
    title: dto.title,
    emoji: dto.emoji ?? '',
    badge: dto.badge ?? null,
    note: dto.note ?? '',
    sort: dto.sort ?? 0,
    isSeasonal: Boolean(dto.is_seasonal),
    enabled: dto.enabled !== false,
    availableFrom: parseDay(dto.available_from),
    availableTo: parseDay(dto.available_to, true),
    promo: dto.promo ?? null,
    items: [],
  }
  // позиции без цены в меню не показываем
  category.items = (dto.items ?? []).map((i) => mapMenuItem(i, category)).filter((i) => i.volumes.length)
  return category
}

// Доступна ли категория на дату now: обычные всегда, сезонные только в свой период
export function isCategoryAvailable(category, now = new Date()) {
  if (!category.enabled) return false
  if (!category.isSeasonal) return true
  if (category.availableFrom && now < category.availableFrom) return false
  if (category.availableTo && now > category.availableTo) return false
  return true
}
