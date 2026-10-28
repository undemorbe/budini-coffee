// Общие данные сайта. Контакты демонстрационные: замените на реальные.
export const contacts = {
  phone: '+7 900 000-00-00',
  phoneHref: 'tel:+79000000000',
  email: 'hello@budini.coffee',
  jobsEmail: 'team@budini.coffee',
  hours: 'Каждый день 7:30-22:00',
  telegram: '@budini_coffee',
  vk: 'vk.com/budini',
}

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
