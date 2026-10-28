import { describe, expect, it } from 'vitest'
import { isCategoryAvailable, mapCategory, mapMenuItem, mapTag, mapVolumes, parseDay, tagLabel } from './models'

describe('mapTag', () => {
  it('переводит подпись тега в стабильный id', () => {
    expect(mapTag('кофейный')).toEqual({ id: 'coffee', label: 'кофейный' })
    expect(mapTag('без кофе')).toEqual({ id: 'no_coffee', label: 'без кофе' })
  })

  it('нормализует регистр и пробелы', () => {
    expect(mapTag('  Пряный ')).toEqual({ id: 'spicy', label: 'пряный' })
  })

  it('неизвестный тег не теряется: id совпадает с подписью', () => {
    expect(mapTag('ягодный')).toEqual({ id: 'ягодный', label: 'ягодный' })
  })

  it('tagLabel возвращает подпись по id', () => {
    expect(tagLabel('citrus')).toBe('цитрусовый')
  })
})

describe('mapVolumes', () => {
  it('сортирует по объёму и подписывает в мл', () => {
    expect(mapVolumes([{ ml: 600, price: 290 }, { ml: 250, price: 150 }])).toEqual([
      { ml: 250, price: 150, label: '250 мл' },
      { ml: 600, price: 290, label: '600 мл' },
    ])
  })

  it('отбрасывает объёмы без корректной цены', () => {
    const raw = [{ ml: 250, price: null }, { ml: 450, price: 0 }, { ml: 600, price: 290 }, null]
    expect(mapVolumes(raw).map((v) => v.ml)).toEqual([600])
  })
})

describe('mapMenuItem', () => {
  const autumn = { id: 'autumn', badge: 'Новинка' }

  it('собирает напиток с объёмами, тегами и минимальной ценой', () => {
    const item = mapMenuItem(
      { id: 'pumpkin_latte', emoji: '🎃', name: 'Тыквенный латте', description: 'Пряный', tags: ['пряный', 'кофейный'], volumes: [{ ml: 600, price: 290 }, { ml: 450, price: 230 }] },
      autumn,
    )
    expect(item).toMatchObject({
      id: 'pumpkin_latte',
      categoryId: 'autumn',
      emoji: '🎃',
      tagIds: ['spicy', 'coffee'],
      unit: 'ml',
      minPrice: 230,
      isNew: true,
    })
    expect(item.volumes.map((v) => v.ml)).toEqual([450, 600])
  })

  it('выпечка продаётся поштучно', () => {
    const item = mapMenuItem({ id: 'croissant_classic', name: 'Круассан классический', price: 120 }, { id: 'bakery' })
    expect(item.unit).toBe('pcs')
    expect(item.volumes).toEqual([{ ml: null, price: 120, label: 'шт.' }])
    expect(item.minPrice).toBe(120)
    expect(item.isNew).toBe(false)
    expect(item.tagIds).toEqual([])
  })

  it('явный is_new в позиции важнее бейджа категории', () => {
    expect(mapMenuItem({ id: 'x', name: 'X', price: 100, is_new: false }, autumn).isNew).toBe(false)
  })
})

describe('mapCategory', () => {
  const dto = {
    id: 'autumn',
    title: 'Осеннее меню',
    emoji: '🍂',
    badge: 'Новинка',
    sort: 0,
    is_seasonal: true,
    available_from: '2026-09-11',
    available_to: '2026-11-30',
    items: [
      { id: 'a', name: 'A', volumes: [{ ml: 450, price: 230 }] },
      { id: 'b', name: 'Без цены', volumes: [] },
    ],
  }

  it('переносит сезонность и период в модель', () => {
    const c = mapCategory(dto)
    expect(c.isSeasonal).toBe(true)
    expect(c.enabled).toBe(true)
    expect(c.availableFrom).toEqual(new Date(2026, 8, 11))
    expect(c.availableTo).toEqual(new Date(2026, 10, 30, 23, 59, 59, 999))
  })

  it('убирает позиции без цены', () => {
    expect(mapCategory(dto).items.map((i) => i.id)).toEqual(['a'])
  })

  it('обычная категория без периода', () => {
    const c = mapCategory({ id: 'classic', title: 'Классика', items: [] })
    expect(c).toMatchObject({ isSeasonal: false, availableFrom: null, availableTo: null, sort: 0, badge: null })
  })
})

describe('isCategoryAvailable', () => {
  const season = mapCategory({ id: 's', title: 'S', is_seasonal: true, available_from: '2026-09-11', available_to: '2026-11-30', items: [] })

  it('сезонная доступна внутри периода, включая границы', () => {
    expect(isCategoryAvailable(season, new Date(2026, 8, 11, 0, 0))).toBe(true)
    expect(isCategoryAvailable(season, new Date(2026, 9, 28, 12, 0))).toBe(true)
    expect(isCategoryAvailable(season, new Date(2026, 10, 30, 22, 59))).toBe(true)
  })

  it('сезонная скрыта до и после периода', () => {
    expect(isCategoryAvailable(season, new Date(2026, 8, 10, 23, 59))).toBe(false)
    expect(isCategoryAvailable(season, new Date(2026, 11, 1, 0, 0))).toBe(false)
  })

  it('enabled: false выключает категорию без учёта дат', () => {
    expect(isCategoryAvailable({ ...season, enabled: false }, new Date(2026, 9, 28))).toBe(false)
  })

  it('обычная категория доступна всегда', () => {
    expect(isCategoryAvailable(mapCategory({ id: 'c', title: 'C', items: [] }), new Date(2001, 0, 1))).toBe(true)
  })
})

describe('parseDay', () => {
  it('пустое или кривое значение даёт null', () => {
    expect(parseDay(null)).toBeNull()
    expect(parseDay('осень')).toBeNull()
  })
})
