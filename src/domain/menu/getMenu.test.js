import { describe, expect, it } from 'vitest'
import { AUTUMN_PRICES, menuSource } from '../../data/menuSource'
import { filterMenuByTags, findItem, getMenu } from './getMenu'

const source = {
  categories: [
    { id: 'classic', title: 'Классика', sort: 1, items: [{ id: 'latte', name: 'Латте', tags: ['кофейный'], volumes: [{ ml: 250, price: 150 }] }] },
    { id: 'bakery', title: 'Выпечка', sort: 7, items: [{ id: 'croissant', name: 'Круассан', price: 120 }] },
    {
      id: 'autumn',
      title: 'Осеннее меню',
      badge: 'Новинка',
      sort: 0,
      is_seasonal: true,
      available_from: '2026-09-11',
      available_to: '2026-11-30',
      items: [
        { id: 'pumpkin_latte', name: 'Тыквенный латте', tags: ['пряный', 'кофейный'], volumes: [{ ml: 450, price: 230 }] },
        { id: 'walnut_hot_chocolate', name: 'Грецкий горячий шоколад', tags: ['шоколадный', 'без кофе'], volumes: [{ ml: 450, price: 230 }] },
      ],
    },
    { id: 'empty', title: 'Пусто', sort: 9, items: [] },
  ],
}

const inSeason = new Date(2026, 9, 28)
const outOfSeason = new Date(2027, 0, 15)

describe('getMenu', () => {
  it('активная сезонная категория идёт первой, остальные по sort', () => {
    expect(getMenu(source, { now: inSeason }).map((c) => c.id)).toEqual(['autumn', 'classic', 'bakery'])
  })

  it('сезонная категория первой, даже если её sort больше остальных', () => {
    const shifted = { categories: source.categories.map((c) => (c.id === 'autumn' ? { ...c, sort: 100 } : c)) }
    expect(getMenu(shifted, { now: inSeason })[0].id).toBe('autumn')
  })

  it('вне сезона осеннее меню скрыто', () => {
    expect(getMenu(source, { now: outOfSeason }).map((c) => c.id)).toEqual(['classic', 'bakery'])
  })

  it('выключенная сезонная категория скрыта и в сезон', () => {
    const off = { categories: source.categories.map((c) => (c.id === 'autumn' ? { ...c, enabled: false } : c)) }
    expect(getMenu(off, { now: inSeason }).some((c) => c.id === 'autumn')).toBe(false)
  })

  it('пустые категории не показываются', () => {
    expect(getMenu(source, { now: inSeason }).some((c) => c.id === 'empty')).toBe(false)
  })

  it('пустой или отсутствующий источник даёт пустое меню', () => {
    expect(getMenu(null)).toEqual([])
    expect(getMenu({})).toEqual([])
  })
})

describe('filterMenuByTags', () => {
  const menu = getMenu(source, { now: inSeason })

  it('без тегов меню не меняется', () => {
    expect(filterMenuByTags(menu, [])).toBe(menu)
  })

  it('оставляет позиции со всеми выбранными тегами и убирает пустые категории', () => {
    const r = filterMenuByTags(menu, ['coffee'])
    expect(r.map((c) => c.id)).toEqual(['autumn', 'classic'])
    expect(r[0].items.map((i) => i.id)).toEqual(['pumpkin_latte'])
  })

  it('несколько тегов работают как «и»', () => {
    expect(filterMenuByTags(menu, ['chocolate', 'no_coffee']).flatMap((c) => c.items.map((i) => i.id))).toEqual(['walnut_hot_chocolate'])
    expect(filterMenuByTags(menu, ['chocolate', 'coffee'])).toEqual([])
  })
})

describe('реальное меню', () => {
  const menu = getMenu(menuSource, { now: inSeason })

  it('в сезон начинается с осеннего меню из 8 новинок', () => {
    expect(menu[0]).toMatchObject({ id: 'autumn', isSeasonal: true, badge: 'Новинка' })
    expect(menu[0].items).toHaveLength(8)
    expect(menu[0].items.every((i) => i.isNew)).toBe(true)
  })

  it('осенние цены берутся из одного места', () => {
    const prices = AUTUMN_PRICES.map((p) => p.price)
    for (const i of menu[0].items) expect(i.volumes.map((v) => v.price)).toEqual(prices)
  })

  it('у каждой позиции есть цена, а id уникальны', () => {
    const items = menu.flatMap((c) => c.items)
    expect(items.every((i) => i.minPrice > 0)).toBe(true)
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
  })

  it('американо 600 мл дешевле остальной классики', () => {
    expect(findItem(menu, 'americano').volumes.at(-1).price).toBe(280)
    expect(findItem(menu, 'latte').volumes.at(-1).price).toBe(290)
  })

  it('глинтвейн помечен безалкогольным, ноты рома не делают какао алкогольным', () => {
    expect(findItem(menu, 'grapefruit_mulled').tagIds).toContain('alcohol_free')
    expect(findItem(menu, 'caribbean_rum_cocoa').tagIds).toEqual(['chocolate', 'no_coffee'])
  })
})
