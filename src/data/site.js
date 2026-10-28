// Общие данные сети «Будини Кофе».
export const brand = {
  name: 'Будини Кофе',
  nameLatin: 'Budini Coffee',
  city: 'Санкт-Петербург и Кудрово',
  // для всех кофеен сети
  amenities: ['Карта, СБП, QR, наличные', 'Можно с животными', 'Кофе с собой'],
  payment: 'Карта, СБП, QR-код, наличные',
}

export const contacts = {
  phone: '+7 (911) 026-84-86',
  phoneHref: 'tel:+79110268486',
  whatsapp: 'https://wa.me/79110268486',
  telegram: 'https://t.me/budinicoffee',
  telegramLabel: '@budinicoffee',
  vk: 'https://vk.ru/budinicoffee',
  vkLabel: 'vk.ru/budinicoffee',
  hours: 'Ежедневно до 23:00',
}

// Ссылка в WhatsApp с готовым текстом сообщения
export const whatsappWithText = (text) => `${contacts.whatsapp}?text=${encodeURIComponent(text)}`

// Главное меню (шапка) и полный список разделов (мобильное меню, подвал).
export const mainNav = [
  { to: '/menu', label: 'Меню' },
  { to: '/order', label: 'Заказ' },
  { to: '/addresses', label: 'Адреса' },
  { to: '/bonus', label: 'Бонусы' },
  { to: '/about', label: 'О нас' },
]

export const extraNav = [
  { to: '/events', label: 'События' },
  { to: '/gift', label: 'Сертификаты' },
  { to: '/careers', label: 'Вакансии' },
  { to: '/contacts', label: 'Контакты' },
]
