// Сырые данные меню «Будини Кофе» в формате будущего API (snake_case).
// Источник: меню на Яндекс Картах, обновлено 11.09. Цены в рублях.
// Модели для интерфейса собираются из этих DTO в src/domain/menu/models.js.

// Молоко (milk у категории, у позиции главнее): true — напиток на молоке, его можно заменить;
// 'optional' — по желанию; false — без молока. cold: подаётся холодным, tapioca: с шариками тапиоки.

// ---- сетки цен по объёму ----
const v = (ml, price) => ({ ml, price })
const CLASSIC = [v(250, 150), v(450, 230), v(600, 290)]
const AMERICANO = [v(250, 150), v(450, 230), v(600, 280)]
const ESPRESSO = [v(40, 150), v(80, 230), v(120, 280)]
const FLAT_WHITE = [v(250, 220), v(450, 270)]
const SIGNATURE = [v(250, 150), v(450, 230), v(600, 290)]
const SIGNATURE_LARGE = [v(450, 230), v(600, 290)]
const BUBBLE = [v(500, 320), v(650, 420)]
const BUMBLE = [v(450, 280), v(600, 310)]
const SEASONAL = [v(450, 230), v(600, 280)]

// TODO: prices not confirmed. Цены осеннего меню пока неизвестны,
// временно взята сетка авторских напитков 450 / 600 мл.
export const AUTUMN_PRICES = [v(450, 230), v(600, 290)]

// Добавки конструктора напитка. color нужен только анимации стакана.
// TODO: prices not confirmed. Набор молока и сиропов и наценки примерные, уточнить у кофейни.
const modifiers = {
  milks: [
    { id: 'cow', name: 'Классическое', price: 0, color: '#f4ecdc' },
    { id: 'lactose_free', name: 'Безлактозное', price: 40, color: '#f2e8d2' },
    { id: 'oat', name: 'Овсяное', price: 60, color: '#e6d2a6', is_plant: true },
    { id: 'coconut', name: 'Кокосовое', price: 60, color: '#fbf8f1', is_plant: true },
    { id: 'almond', name: 'Миндальное', price: 60, color: '#efdcc0', is_plant: true },
    { id: 'banana', name: 'Банановое', price: 60, color: '#f5e08f', is_plant: true },
  ],
  syrups: [
    { id: 'caramel', name: 'Карамель', price: 40, color: '#c67b2c' },
    { id: 'salted_caramel', name: 'Солёная карамель', price: 40, color: '#a85a1e' },
    { id: 'vanilla', name: 'Ваниль', price: 40, color: '#f0d595' },
    { id: 'hazelnut', name: 'Лесной орех', price: 40, color: '#8a5a2e' },
    { id: 'coconut', name: 'Кокос', price: 40, color: '#f3efe6' },
    { id: 'chocolate', name: 'Шоколад', price: 40, color: '#4a2416' },
    { id: 'lavender', name: 'Лаванда', price: 40, color: '#a68ad8' },
    { id: 'mint', name: 'Мята', price: 40, color: '#66d4be' },
    { id: 'raspberry', name: 'Малина', price: 40, color: '#d23a68' },
    { id: 'pumpkin_spice', name: 'Тыквенный пряный', price: 40, color: '#d9822b' },
  ],
  syrup_limit: 3,
}

export const menuSource = {
  updated_at: '2026-09-11',
  modifiers,
  categories: [
    {
      id: 'autumn',
      title: 'Осеннее меню',
      emoji: '🍂',
      badge: 'Новинка',
      sort: 0,
      milk: true,
      // Сезонная категория: показывается только в этот период (даты включительно).
      // Чтобы выключить осень, поменяйте даты или поставьте enabled: false. UI менять не нужно.
      is_seasonal: true,
      enabled: true,
      available_from: '2026-09-11', // TODO verify: даты сезона уточнить у кофейни
      available_to: '2026-11-30',
      promo: {
        title: 'А мы ввели осень в меню! 🍂',
        text: 'Время тёплых чашек, пряностей, шоколада и тех самых вкусов, ради которых начинаешь чуть больше любить прохладные дни. Встречайте наше новое осеннее меню — восемь напитков с совершенно разным характером.',
        question: 'Какой вкус вашей осени? 🍂',
        footer: 'Новинки уже ждут вас — приходите пробовать и выбирать своего фаворита 🤎',
      },
      items: [
        { id: 'pumpkin_latte', emoji: '🎃', name: 'Тыквенный латте', description: 'Пряный, нежный и по-настоящему осенний — с тыквенными нотами, мускатным орехом и ароматной корицей.', tags: ['пряный', 'кофейный'], volumes: AUTUMN_PRICES },
        { id: 'spiced_orange_mocha', emoji: '🍊', name: 'Мокко «Пряный апельсин»', description: 'Насыщенный шоколадный вкус с яркими цитрусовыми нотами, нежной сливочностью и лёгким карамельным акцентом.', tags: ['шоколадный', 'цитрусовый', 'кофейный'], volumes: AUTUMN_PRICES },
        { id: 'vanilla_black_sesame_raf', emoji: '🖤', name: 'Раф «Ваниль — чёрный кунжут»', description: 'Нежный ванильный раф с необычным ореховым оттенком чёрного кунжута.', tags: ['сливочный', 'ореховый', 'кофейный'], volumes: AUTUMN_PRICES },
        { id: 'apple_crumble_caramel', milk: false, emoji: '🍎', name: 'Яблочный крамбл с карамелью', description: 'Согревающий яблочный напиток с ароматными специями, бадьяном и лёгкой карамельной ноткой.', tags: ['фруктовый', 'пряный', 'без кофе'], volumes: AUTUMN_PRICES },
        { id: 'grapefruit_mulled', milk: false, emoji: '🍊', name: 'Грейпфрутовый глинтвейн', description: 'Яркий, терпкий и пряный — с насыщенным вкусом грейпфрута, цитрусовыми оттенками и согревающими специями.', tags: ['цитрусовый', 'пряный', 'без кофе', 'безалкогольный'], volumes: AUTUMN_PRICES },
        { id: 'chai_raf', emoji: '☕', name: 'Чайный раф', description: 'Мягкий и сливочный напиток с насыщенным ароматом масала и тёплыми пряными нотами.', tags: ['сливочный', 'пряный', 'чайный'], volumes: AUTUMN_PRICES },
        // ноты рома, амаретто и ирландского крема вкусовые (сиропы), напиток безалкогольный
        { id: 'caribbean_rum_cocoa', emoji: '🥥', name: 'Какао «Карибский ром»', description: 'Насыщенное какао с оттенками ирландского крема, амаретто и лёгкой ромовой ноткой.', tags: ['шоколадный', 'без кофе'], volumes: AUTUMN_PRICES },
        { id: 'walnut_hot_chocolate', emoji: '🍫', name: 'Грецкий горячий шоколад', description: 'Горячий шоколад с оттенками грецкого ореха и насыщенным вкусом шоколадной пасты.', tags: ['шоколадный', 'ореховый', 'без кофе'], volumes: AUTUMN_PRICES },
      ],
    },
    {
      id: 'classic',
      title: 'Классика',
      sort: 1,
      milk: true,
      items: [
        { id: 'espresso', milk: 'optional', name: 'Эспрессо', tags: ['кофейный'], volumes: ESPRESSO },
        { id: 'americano', milk: 'optional', name: 'Американо', tags: ['кофейный'], volumes: AMERICANO },
        { id: 'cappuccino', name: 'Капучино', tags: ['кофейный'], volumes: CLASSIC },
        { id: 'latte', name: 'Латте', tags: ['кофейный'], volumes: CLASSIC },
        { id: 'flat_white', name: 'Флэт уайт', tags: ['кофейный'], volumes: FLAT_WHITE },
        { id: 'raf', name: 'Раф', tags: ['кофейный', 'сливочный'], volumes: CLASSIC },
        { id: 'hot_chocolate', name: 'Горячий шоколад', tags: ['шоколадный', 'без кофе'], volumes: CLASSIC },
        { id: 'cocoa', name: 'Какао', tags: ['шоколадный', 'без кофе'], volumes: CLASSIC },
        { id: 'tea_green', milk: false, name: 'Чай зелёный', tags: ['чайный', 'без кофе'], volumes: CLASSIC },
        { id: 'tea_black', milk: 'optional', name: 'Чай чёрный', tags: ['чайный', 'без кофе'], volumes: CLASSIC },
        { id: 'matcha', name: 'Матча', tags: ['чайный', 'без кофе'], volumes: CLASSIC },
        { id: 'tea_seabuckthorn_ginger', milk: false, name: 'Чай облепиха-имбирь', tags: ['чайный', 'фруктовый', 'пряный', 'без кофе'], volumes: CLASSIC },
      ],
    },
    {
      id: 'signature',
      title: 'Авторские',
      sort: 2,
      milk: true,
      items: [
        { id: 'cappuccino_snickers', name: 'Капучино сникерс', tags: ['кофейный', 'шоколадный', 'ореховый'], volumes: SIGNATURE },
        { id: 'peanut_raf', name: 'Арахисовый раф', tags: ['кофейный', 'сливочный', 'ореховый'], volumes: SIGNATURE },
        { id: 'latte_snickers', name: 'Латте сникерс', tags: ['кофейный', 'шоколадный', 'ореховый'], volumes: SIGNATURE },
        { id: 'lavender_raf', name: 'Лавандовый раф', tags: ['кофейный', 'сливочный'], volumes: SIGNATURE },
        { id: 'latte_cream_cheese', name: 'Латте сливочный сыр', tags: ['кофейный', 'сливочный'], volumes: SIGNATURE },
        { id: 'latte_macadamia_white_chocolate', name: 'Латте макадамия и белый шоколад', tags: ['кофейный', 'ореховый', 'шоколадный'], volumes: SIGNATURE },
        { id: 'latte_raspberry_pistachio', name: 'Латте малина-фисташка со сливочной пенкой', tags: ['кофейный', 'фруктовый', 'ореховый'], volumes: SIGNATURE_LARGE },
        { id: 'cappuccino_strawberry_banana', name: 'Сливочный капучино клубника-банан', tags: ['кофейный', 'фруктовый', 'сливочный'], volumes: SIGNATURE_LARGE },
        { id: 'caramel_chantilly_mocha', name: 'Карамельный шанти-мокко', tags: ['кофейный', 'шоколадный'], volumes: SIGNATURE_LARGE },
        { id: 'latte_nutella', name: 'Латте нутелла', tags: ['кофейный', 'шоколадный', 'ореховый'], volumes: SIGNATURE_LARGE },
      ],
    },
    {
      id: 'bubble_coffee',
      title: 'Бабл ти кофейные',
      sort: 3,
      milk: true,
      cold: true,
      tapioca: true,
      items: [
        { id: 'iced_latte_oreo', name: 'Айс-латте Орео', tags: ['кофейный', 'шоколадный'], volumes: BUBBLE },
        { id: 'latte_double_caramel', name: 'Латте дабл карамель', tags: ['кофейный'], volumes: BUBBLE },
        { id: 'spanish_latte_tapioca', name: 'Спаниш латте с тапиокой', tags: ['кофейный', 'сливочный'], volumes: BUBBLE },
        { id: 'banana_mocha', name: 'Банановый мокко', tags: ['кофейный', 'шоколадный', 'фруктовый'], volumes: BUBBLE },
        { id: 'dubai_latte', name: 'Латте дубайский', tags: ['кофейный', 'шоколадный', 'ореховый'], volumes: BUBBLE },
      ],
    },
    {
      id: 'bubble_tea',
      title: 'Бабл ти',
      sort: 4,
      cold: true,
      tapioca: true,
      items: [
        { id: 'matcha_mango_latte', milk: true, name: 'Латте матча манго', tags: ['чайный', 'фруктовый', 'без кофе'], volumes: BUBBLE },
        { id: 'anchan_coconut_latte', milk: true, name: 'Латте анчан с кокосом', tags: ['чайный', 'без кофе'], volumes: BUBBLE },
        { id: 'matcha_tonic_mango', name: 'Матча тоник сочный манго', tags: ['чайный', 'фруктовый', 'без кофе'], volumes: BUBBLE },
        { id: 'blueberry_cloud', milk: true, name: 'Черничный клауд', tags: ['фруктовый', 'без кофе'], volumes: BUBBLE },
      ],
    },
    {
      id: 'bumble',
      title: 'Бамбл',
      note: 'Холодный или горячий',
      sort: 5,
      items: [
        { id: 'orange_bumble', name: 'Апельсиновый бамбл', tags: ['кофейный', 'цитрусовый'], volumes: BUMBLE },
        { id: 'cherry_caramel_bumble', name: 'Вишнёвый бамбл с карамелью', tags: ['кофейный', 'фруктовый'], volumes: BUMBLE },
      ],
    },
    {
      id: 'seasonal',
      title: 'Сезонные',
      sort: 6,
      cold: true,
      items: [
        { id: 'espresso_tonic', name: 'Эспрессо тоник', tags: ['кофейный', 'цитрусовый'], volumes: SEASONAL },
        { id: 'latte_tiramisu', milk: true, cold: false, name: 'Латте тирамису', tags: ['кофейный', 'сливочный'], volumes: SEASONAL },
      ],
    },
    {
      id: 'bakery',
      title: 'Выпечка',
      sort: 7,
      items: [
        { id: 'croissant_classic', name: 'Круассан классический', price: 120 },
        { id: 'croissant_napoleon', name: 'Круассан наполеон', price: 140 },
        { id: 'croissant_almond', name: 'Круассан миндальный', price: 140 },
        { id: 'croissant_coconut', name: 'Круассан кокосовый', price: 140 },
        { id: 'croissant_pistachio', name: 'Круассан фисташковый', price: 140 },
        { id: 'banana_in_chocolate', name: 'Банан в шоколаде', price: 180 },
        { id: 'strawberry_in_chocolate', name: 'Клубника в шоколаде', price: 180 },
      ],
    },
    {
      id: 'dessert',
      title: 'Десерты',
      sort: 8,
      items: [
        { id: 'layered_dessert', name: 'Корпусный десерт', description: 'Вкусы: малина, кофе, вишня, черника.', price: 360 },
      ],
    },
  ],
}
