// Демо-данные: адреса и часы условные, замените на реальные точки «Будини».
// x / y: положение точки на схематичной карте (в процентах).
export const cafes = [
  {
    id: 'lenina',
    name: 'Будини на Ленина',
    street: 'ул. Ленина, 12',
    note: 'У выхода из метро, окно выдачи навынос',
    hours: { weekdays: ['07:00', '22:00'], weekend: ['08:00', '22:00'] },
    wait: 4,
    features: ['Окно навынос', 'Растительное молоко', 'Оплата СБП'],
    x: 34,
    y: 38,
  },
  {
    id: 'mira',
    name: 'Будини на Мира',
    street: 'пр. Мира, 45',
    note: 'Большой зал, розетки и Wi-Fi',
    hours: { weekdays: ['07:30', '22:00'], weekend: ['09:00', '23:00'] },
    wait: 7,
    features: ['Зал на 30 мест', 'Wi-Fi', 'Десерты'],
    x: 63,
    y: 27,
  },
  {
    id: 'sadovaya',
    name: 'Будини на Садовой',
    street: 'ул. Садовая, 3',
    note: 'Островок в бизнес-центре, 1 этаж',
    hours: { weekdays: ['07:30', '20:00'], weekend: null },
    wait: 3,
    features: ['Быстрая выдача', 'Только навынос'],
    x: 48,
    y: 62,
  },
  {
    id: 'naberezhnaya',
    name: 'Будини на Набережной',
    street: 'Набережная, 8',
    note: 'Летняя веранда с видом на воду',
    hours: { weekdays: ['08:00', '22:00'], weekend: ['08:00', '23:00'] },
    wait: 6,
    features: ['Веранда', 'Можно с собакой', 'Холодные напитки'],
    x: 78,
    y: 70,
  },
]

const toMin = (s) => {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

// Открыто ли сейчас и до скольки; date можно передать для тестов.
export function openState(cafe, date = new Date()) {
  const day = date.getDay()
  const weekend = day === 0 || day === 6
  const range = weekend ? cafe.hours.weekend : cafe.hours.weekdays
  if (!range) return { open: false, label: weekend ? 'В выходные закрыто' : 'Сегодня закрыто' }
  const now = date.getHours() * 60 + date.getMinutes()
  const [from, to] = range.map(toMin)
  if (now >= from && now < to) return { open: true, label: `Открыто до ${range[1]}` }
  if (now < from) return { open: false, label: `Откроется в ${range[0]}` }
  return { open: false, label: 'Уже закрыто, ждём завтра' }
}

export function hoursText(cafe) {
  const w = cafe.hours.weekdays
  const e = cafe.hours.weekend
  return `Пн-Пт ${w[0]}-${w[1]} · Сб-Вс ${e ? `${e[0]}-${e[1]}` : 'выходной'}`
}
