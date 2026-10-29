import { describe, expect, it } from 'vitest'
import { menu, modifiers } from '../../data/menu'
import { findItem } from './getMenu'
import { mapMenuItem } from './models'
import { defaultConfig, describeConfig, lineKey, linePrice, mapModifiers, milkOptions, syrupOptions, toggleSyrup, unitPrice } from './order'

const mods = mapModifiers({
  milks: [
    { id: 'cow', name: 'Классическое', price: 0 },
    { id: 'oat', name: 'Овсяное', price: 60, is_plant: true },
  ],
  syrups: [
    { id: 'caramel', name: 'Карамель', price: 40 },
    { id: 'vanilla', name: 'Ваниль', price: 40 },
    { id: 'mint', name: 'Мята', price: 40 },
  ],
  syrup_limit: 2,
})

const volumes = [
  { ml: 250, price: 150 },
  { ml: 450, price: 230 },
  { ml: 600, price: 290 },
]
const latte = mapMenuItem({ id: 'latte', name: 'Латте', milk: true, volumes }, { id: 'classic' })
const americano = mapMenuItem({ id: 'americano', name: 'Американо', milk: 'optional', volumes }, { id: 'classic' })
const tea = mapMenuItem({ id: 'tea_green', name: 'Чай', volumes }, { id: 'classic' })
const croissant = mapMenuItem({ id: 'croissant', name: 'Круассан', price: 120 }, { id: 'bakery' })

describe('mapModifiers', () => {
  it('приводит добавки к моделям и задаёт лимит сиропов', () => {
    expect(mods.milks[1]).toEqual({ id: 'oat', name: 'Овсяное', price: 60, color: null, isPlant: true })
    expect(mods.syrupLimit).toBe(2)
    expect(mapModifiers({}).syrupLimit).toBe(3)
  })

  it('некорректная наценка считается нулевой', () => {
    expect(mapModifiers({ syrups: [{ id: 'x', name: 'X', price: -5 }] }).syrups[0].price).toBe(0)
  })
})

describe('варианты молока и сиропов', () => {
  it('напиток на молоке: выбор среди видов молока', () => {
    expect(milkOptions(latte, mods).map((m) => m.id)).toEqual(['cow', 'oat'])
  })

  it('молоко по желанию: первым идёт «Без молока»', () => {
    expect(milkOptions(americano, mods).map((m) => m.id)).toEqual(['none', 'cow', 'oat'])
  })

  it('без молока и выпечка: молоко не выбирается', () => {
    expect(milkOptions(tea, mods)).toEqual([])
    expect(milkOptions(croissant, mods)).toEqual([])
    expect(syrupOptions(croissant, mods)).toEqual([])
  })
})

describe('defaultConfig', () => {
  it('средний объём из трёх и первое молоко', () => {
    expect(defaultConfig(latte, mods)).toEqual({ volumeIndex: 1, milk: 'cow', syrups: [], qty: 1 })
  })

  it('берёт объём из карточки, если он есть', () => {
    expect(defaultConfig(latte, mods, 2).volumeIndex).toBe(2)
    expect(defaultConfig(latte, mods, 7).volumeIndex).toBe(1)
  })

  it('без выбора молока milk = null', () => {
    expect(defaultConfig(tea, mods).milk).toBeNull()
    expect(defaultConfig(americano, mods).milk).toBe('none')
  })
})

describe('toggleSyrup', () => {
  it('добавляет, убирает и не превышает лимит', () => {
    let s = toggleSyrup([], 'caramel', 2)
    s = toggleSyrup(s, 'vanilla', 2)
    expect(toggleSyrup(s, 'mint', 2)).toEqual(['caramel', 'vanilla'])
    expect(toggleSyrup(s, 'caramel', 2)).toEqual(['vanilla'])
  })
})

describe('цена', () => {
  it('объём + молоко + сиропы, умноженное на количество', () => {
    const config = { volumeIndex: 2, milk: 'oat', syrups: ['caramel', 'vanilla'], qty: 2 }
    expect(unitPrice(latte, config, mods)).toBe(290 + 60 + 80)
    expect(linePrice(latte, config, mods)).toBe(860)
  })

  it('выпечка стоит своей цены', () => {
    expect(unitPrice(croissant, { volumeIndex: 0, milk: null, syrups: [], qty: 3 }, mods)).toBe(120)
    expect(linePrice(croissant, { volumeIndex: 0, milk: null, syrups: [], qty: 3 }, mods)).toBe(360)
  })
})

describe('строка подноса', () => {
  it('ключ не зависит от порядка сиропов', () => {
    const a = lineKey('latte', { volumeIndex: 1, milk: 'oat', syrups: ['vanilla', 'caramel'] })
    const b = lineKey('latte', { volumeIndex: 1, milk: 'oat', syrups: ['caramel', 'vanilla'] })
    expect(a).toBe(b)
    expect(a).not.toBe(lineKey('latte', { volumeIndex: 1, milk: 'cow', syrups: ['caramel', 'vanilla'] }))
  })

  it('описание опускает классическое молоко', () => {
    expect(describeConfig(latte, { volumeIndex: 1, milk: 'cow', syrups: [] }, mods)).toBe('450 мл')
    expect(describeConfig(latte, { volumeIndex: 0, milk: 'oat', syrups: ['mint'] }, mods)).toBe('250 мл · овсяное · мята')
    expect(describeConfig(americano, { volumeIndex: 0, milk: 'none', syrups: [] }, mods)).toBe('250 мл · без молока')
  })
})

describe('реальное меню', () => {
  it('у всех напитков с молоком есть выбор молока, у выпечки нет', () => {
    expect(milkOptions(findItem(menu, 'latte'), modifiers).length).toBeGreaterThan(1)
    expect(milkOptions(findItem(menu, 'espresso'), modifiers)[0].id).toBe('none')
    expect(milkOptions(findItem(menu, 'tea_green'), modifiers)).toEqual([])
    expect(milkOptions(findItem(menu, 'croissant_classic'), modifiers)).toEqual([])
  })

  it('бабл ти холодные и с тапиокой, классика горячая', () => {
    expect(findItem(menu, 'matcha_mango_latte')).toMatchObject({ cold: true, tapioca: true, milk: 'base' })
    expect(findItem(menu, 'latte')).toMatchObject({ cold: false, tapioca: false })
    expect(findItem(menu, 'latte_tiramisu').cold).toBe(false)
  })
})
