// Меню «Будини». buzz — «бодрость» от 0 (без кофеина) до 3.
// prices: цена по размерам S / M / L (null, если размер не готовим).
export const sizes = [
  { id: 'S', ml: 250 },
  { id: 'M', ml: 350 },
  { id: 'L', ml: 450 },
]

export const categories = [
  { id: 'coffee', title: 'Кофе' },
  { id: 'signature', title: 'Авторское' },
  { id: 'cold', title: 'Холодное' },
  { id: 'nocoffee', title: 'Без кофе' },
  { id: 'bakery', title: 'Выпечка' },
]

export const menu = [
  { id: 'espresso', cat: 'coffee', name: 'Эспрессо', desc: 'Двойной шот на бленде Будини: шоколад, орех, лёгкая кислинка.', prices: [150, null, null], buzz: 3, plant: false },
  { id: 'americano', cat: 'coffee', name: 'Американо', desc: 'Эспрессо и горячая вода. Чистый вкус, чтобы проснуться без сюрпризов.', prices: [170, 210, 250], buzz: 2, plant: false },
  { id: 'cappuccino', cat: 'coffee', name: 'Капучино', desc: 'Плотная молочная пена и мягкий эспрессо.', prices: [210, 250, 290], buzz: 2, plant: true, hit: true },
  { id: 'latte', cat: 'coffee', name: 'Латте', desc: 'Больше молока, меньше горечи. Хорош на овсяном.', prices: [220, 260, 300], buzz: 1, plant: true, hit: true },
  { id: 'flatwhite', cat: 'coffee', name: 'Флэт уайт', desc: 'Двойной эспрессо и тонкий слой бархатного молока.', prices: [260, null, null], buzz: 3, plant: true },
  { id: 'raf', cat: 'coffee', name: 'Раф ванильный', desc: 'Сливки, эспрессо и ваниль, взбитые в облако.', prices: [260, 300, 340], buzz: 1, plant: true },

  { id: 'mintraf', cat: 'signature', name: 'Мятный раф', desc: 'Фирменный напиток: сливки, эспрессо, свежая мята и белый шоколад.', prices: [290, 330, 370], buzz: 1, plant: true, hit: true, isNew: true },
  { id: 'budilnik', cat: 'signature', name: 'Будильник', desc: 'Двойной эспрессо, тоник и цедра лайма. Работает быстрее будильника.', prices: [null, 290, null], buzz: 3, plant: false, cold: true, hit: true },
  { id: 'caramel', cat: 'signature', name: 'Латте солёная карамель', desc: 'Латте с домашней карамелью и щепоткой морской соли.', prices: [270, 310, 350], buzz: 1, plant: true },
  { id: 'halva', cat: 'signature', name: 'Халва-капучино', desc: 'Капучино с кунжутной халвой и корицей.', prices: [260, 300, null], buzz: 2, plant: true, isNew: true },

  { id: 'icelatte', cat: 'cold', name: 'Айс латте', desc: 'Латте на льду, можно на кокосовом молоке.', prices: [null, 270, 310], buzz: 1, plant: true, cold: true },
  { id: 'coldbrew', cat: 'cold', name: 'Колд брю', desc: 'Кофе холодной экстракции 16 часов. Мягкий и бодрый.', prices: [null, 260, 300], buzz: 3, plant: false, cold: true },
  { id: 'lemonade', cat: 'cold', name: 'Мятный лимонад', desc: 'Мята, лайм и газированная вода. Без кофеина.', prices: [null, 230, 270], buzz: 0, plant: true, cold: true },

  { id: 'cocoa', cat: 'nocoffee', name: 'Какао', desc: 'Настоящий какао-порошок и молоко. Детям тоже можно.', prices: [190, 230, 270], buzz: 0, plant: true },
  { id: 'matcha', cat: 'nocoffee', name: 'Матча латте', desc: 'Японская матча и молоко на выбор.', prices: [240, 280, 320], buzz: 1, plant: true },
  { id: 'tea', cat: 'nocoffee', name: 'Чай листовой', desc: 'Чёрный, зелёный или травяной. Чайник на 400 мл.', prices: [null, 180, null], buzz: 1, plant: true },
  { id: 'decaf', cat: 'nocoffee', name: 'Капучино без кофеина', desc: 'Вкус капучино, но спать вечером можно спокойно.', prices: [220, 260, 300], buzz: 0, plant: true },

  { id: 'croissant', cat: 'bakery', name: 'Круассан', desc: 'Сливочный, хрустящий, печём каждое утро.', prices: [150, null, null], buzz: 0, plant: false, single: true },
  { id: 'cinnabon', cat: 'bakery', name: 'Синнабон', desc: 'Булочка с корицей и сливочным кремом.', prices: [190, null, null], buzz: 0, plant: false, single: true, hit: true },
  { id: 'syrnik', cat: 'bakery', name: 'Сырник', desc: 'Пышный, со сметаной или ягодным соусом.', prices: [170, null, null], buzz: 0, plant: false, single: true },
]

export const buzzLabel = ['Без кофеина', 'Мягко бодрит', 'Бодрит', 'Будит наверняка']

export function minPrice(item) {
  return Math.min(...item.prices.filter((p) => p != null))
}
