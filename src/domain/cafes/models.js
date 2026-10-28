// Модель кофейни и расписание.
// Cafe { id, city, street, address, landmark, entrance, orgId, coords, yandexUrl, mapUrl, hours }

const YANDEX_ORG = 'https://yandex.ru/maps/org/budini_coffee/'
const YANDEX_WIDGET = 'https://yandex.ru/map-widget/v1/org/budini_coffee/'

export function mapCafe(dto) {
  const coords = Array.isArray(dto.coords) ? { lat: dto.coords[0], lng: dto.coords[1] } : null
  return {
    id: dto.id,
    city: dto.city,
    street: dto.street,
    address: `${dto.city}, ${dto.street}`,
    landmark: dto.landmark ?? '',
    entrance: dto.entrance ?? '',
    orgId: dto.org_id,
    coords,
    yandexUrl: `${YANDEX_ORG}${dto.org_id}/`,
    // встраиваемая карта Яндекса с карточкой организации
    mapUrl: `${YANDEX_WIDGET}${dto.org_id}/?z=16${coords ? `&ll=${coords.lng},${coords.lat}` : ''}`,
    hours: { weekdays: dto.hours.weekdays, weekend: dto.hours.weekend ?? dto.hours.weekdays },
  }
}

const toMin = (s) => {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6
const rangeFor = (cafe, date) => (isWeekend(date) ? cafe.hours.weekend : cafe.hours.weekdays)

// Открыто ли сейчас и что показать гостю; date можно передать для тестов.
export function openState(cafe, date = new Date()) {
  const [open, close] = rangeFor(cafe, date)
  const now = date.getHours() * 60 + date.getMinutes()
  if (now >= toMin(open) && now < toMin(close)) return { open: true, label: `Открыто до ${close}` }
  if (now < toMin(open)) return { open: false, label: `Откроется в ${open}` }
  // после закрытия подсказываем время открытия завтра
  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return { open: false, label: `Закрыто, завтра с ${rangeFor(cafe, tomorrow)[0]}` }
}

export function hoursText(cafe) {
  const [wo, wc] = cafe.hours.weekdays
  const [eo, ec] = cafe.hours.weekend
  if (wo === eo && wc === ec) return `Ежедневно ${wo}-${wc}`
  return `Пн-Пт ${wo}-${wc} · Сб-Вс ${eo}-${ec}`
}
