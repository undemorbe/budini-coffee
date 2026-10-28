import { describe, expect, it } from 'vitest'
import { cafesSource } from '../../data/cafesSource'
import { hoursText, mapCafe, openState } from './models'

const byId = (id) => mapCafe(cafesSource.find((c) => c.id === id))
// 28.10.2026 среда, 31.10.2026 суббота
const wed = (h, m = 0) => new Date(2026, 9, 28, h, m)
const sat = (h, m = 0) => new Date(2026, 9, 31, h, m)
const fri = (h, m = 0) => new Date(2026, 9, 30, h, m)

describe('mapCafe', () => {
  it('собирает адрес, ссылки на Яндекс Карты и координаты', () => {
    const cafe = byId('ispytateley_5')
    expect(cafe).toMatchObject({
      address: 'Санкт-Петербург, пр. Испытателей, 5',
      orgId: '171409115100',
      coords: { lat: 60.003781, lng: 30.298449 },
      yandexUrl: 'https://yandex.ru/maps/org/budini_coffee/171409115100/',
    })
    expect(cafe.mapUrl).toContain('ll=30.298449,60.003781')
  })

  it('без координат карта строится по id организации', () => {
    const cafe = byId('ligovsky_44')
    expect(cafe.coords).toBeNull()
    expect(cafe.mapUrl).toBe('https://yandex.ru/map-widget/v1/org/budini_coffee/2340088431/?z=16')
  })

  it('без отдельного расписания выходных берутся будни', () => {
    const cafe = mapCafe({ ...cafesSource[0], hours: { weekdays: ['09:00', '21:00'] } })
    expect(cafe.hours.weekend).toEqual(['09:00', '21:00'])
  })

  it('все точки закрываются в 23:00', () => {
    for (const c of cafesSource.map(mapCafe)) {
      expect(c.hours.weekdays[1]).toBe('23:00')
      expect(c.hours.weekend[1]).toBe('23:00')
    }
  })
})

describe('openState', () => {
  it('днём открыто до 23:00', () => {
    expect(openState(byId('ligovsky_44'), wed(12))).toEqual({ open: true, label: 'Открыто до 23:00' })
  })

  it('до открытия и после закрытия', () => {
    expect(openState(byId('ligovsky_44'), wed(7, 59))).toEqual({ open: false, label: 'Откроется в 08:00' })
    expect(openState(byId('ligovsky_44'), wed(23)).open).toBe(false)
  })

  it('Кудрово: в будни с 7:30, в выходные с 8:00', () => {
    const cafe = byId('kudrovo_prazhskaya_6k1')
    expect(openState(cafe, wed(7, 45)).open).toBe(true)
    expect(openState(cafe, sat(7, 45))).toEqual({ open: false, label: 'Откроется в 08:00' })
    // в пятницу вечером подсказываем субботнее время
    expect(openState(cafe, fri(23, 30)).label).toBe('Закрыто, завтра с 08:00')
  })
})

describe('hoursText', () => {
  it('одинаковое расписание показывается как «ежедневно»', () => {
    expect(hoursText(byId('kolomyazhsky_15k2'))).toBe('Ежедневно 07:30-23:00')
  })

  it('разное расписание будней и выходных', () => {
    expect(hoursText(byId('kudrovo_prazhskaya_6k1'))).toBe('Пн-Пт 07:30-23:00 · Сб-Вс 08:00-23:00')
  })
})
