// Кофейни «Будини Кофе». Адреса и часы работы с карточек организаций на Яндекс Картах
// (виджет карты, проверено 28.10.2026). Модели собираются в src/domain/cafes/models.js.
// hours: [открытие, закрытие] для будней (Пн-Пт) и выходных (Сб-Вс).

const DAILY_8 = { weekdays: ['08:00', '23:00'], weekend: ['08:00', '23:00'] }
const DAILY_730 = { weekdays: ['07:30', '23:00'], weekend: ['07:30', '23:00'] }

export const cafesSource = [
  {
    id: 'ligovsky_44',
    city: 'Санкт-Петербург',
    street: 'Лиговский пр., 44',
    landmark: 'м. Площадь Восстания, ~430 м',
    org_id: '2340088431',
    hours: DAILY_8,
    coords: null, // TODO: геокодировать
  },
  {
    id: 'ispytateley_5',
    city: 'Санкт-Петербург',
    street: 'пр. Испытателей, 5',
    landmark: 'м. Пионерская, ~270 м',
    org_id: '171409115100',
    hours: DAILY_8,
    coords: [60.003781, 30.298449],
  },
  {
    id: 'dolgoozernaya_12k1',
    city: 'Санкт-Петербург',
    street: 'Долгоозёрная ул., 12к1',
    landmark: 'м. Комендантский пр., ~1,4 км',
    entrance: 'Вход с улицы, 1 этаж',
    org_id: '222846572296',
    hours: DAILY_8,
    coords: [60.016784, 30.244443],
  },
  {
    id: 'kolomyazhsky_15k2',
    city: 'Санкт-Петербург',
    street: 'Коломяжский пр., 15к2',
    landmark: 'м. Пионерская, ~140 м',
    org_id: '182003925228',
    hours: DAILY_730,
    coords: null, // TODO: геокодировать
  },
  {
    id: 'kudrovo_prazhskaya_6k1',
    city: 'Кудрово',
    street: 'Пражская ул., 6к1',
    landmark: null,
    org_id: '143219685030',
    hours: { weekdays: ['07:30', '23:00'], weekend: ['08:00', '23:00'] },
    coords: null, // TODO: геокодировать
  },
]
