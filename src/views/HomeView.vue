<script setup>
import { ref } from 'vue'
import DrinkCard from '../components/DrinkCard.vue'
import OrderAlarm from '../components/OrderAlarm.vue'
import ScrollVideo from '../components/ScrollVideo.vue'
import { useReveal } from '../composables/useReveal'
import { cafes, hoursText, openState } from '../data/cafes'
import { menu } from '../data/menu'

// Реальное число кадров, извлечённых из media/budini-hero.mp4 (15 с, 30 к/с).
const FRAME_COUNT = 450
// Вертикальная версия той же сцены для телефонов: 540×960, 225 кадров.
const PORTRAIT = { frameCount: 225, path: 'frames-m/frame_' }

const root = ref(null)
useReveal(root)

// Сезонная категория (осень), если она сейчас активна; иначе показываем классику
const season = menu.find((c) => c.isSeasonal) ?? null
const showcase = season ? season.items : (menu.find((c) => c.id === 'classic')?.items ?? []).slice(0, 4)
const ticker = ['Осеннее меню', 'Тыквенный латте', 'Бабл ти', 'Кофе с собой', 'Можно с животными', 'Ежедневно до 23:00']
// разделы-примеры для будущей версии сайта (на страницах есть плашка «Пример раздела»)
const more = [
  { to: '/bonus', k: 'Бонусы', t: 'Бонусная программа', d: 'Пример раздела: как может работать карта гостя.' },
  { to: '/events', k: 'События', t: 'Каппинги и латте-арт', d: 'Пример афиши мероприятий в кофейнях.' },
  { to: '/gift', k: 'Сертификаты', t: 'Подари бодрое утро', d: 'Пример электронного подарочного сертификата.' },
]
const why = [
  { n: '01', t: `${cafes.length} кофеен`, d: 'Лиговский, Испытателей, Долгоозёрная, Коломяжский в Петербурге и Пражская в Кудрово.' },
  { n: '02', t: 'Ежедневно до 23:00', d: 'Вечером тоже можно зайти за кофе: все точки работают без выходных.' },
  { n: '03', t: 'С питомцами', d: 'Можно с животными и кофе с собой. Оплата картой, по СБП, QR-коду или наличными.' },
]
</script>

<template>
  <div ref="root">
    <ScrollVideo :frame-count="FRAME_COUNT" :portrait="PORTRAIT" height="520vh">
      <!-- Надписи стоят на сплошных чёрных плашках, как на обложке «Будини»: без свечения и градиентов. -->
      <div class="m m--hero" data-in="0" data-out="0.18">
        <p class="m__tag">Кофейня · ежедневно до 23:00</p>
        <div class="m__band">
          <h1 class="display m__title">Буди<span class="neon">ни</span></h1>
        </div>
        <p class="m__tag m__tag--text">Кофе, который разбудит. Листай вниз, чтобы налить себе первую чашку.</p>
        <span class="m__cue" aria-hidden="true"><span></span></span>
      </div>

      <div class="m m--plate m--left" data-in="0.24" data-out="0.44">
        <p class="m__step"><span class="neon">01</span> Осень</p>
        <h2 class="display m__h">Осеннее меню уже здесь</h2>
        <p class="m__text">Восемь новых напитков: тыквенный латте, мокко «Пряный апельсин», чайный раф, грейпфрутовый глинтвейн и не только.</p>
      </div>

      <div class="m m--plate m--right" data-in="0.52" data-out="0.74">
        <p class="m__step"><span class="neon">02</span> Крышка</p>
        <h2 class="display m__h">Кофе с собой</h2>
        <p class="m__text">Пять кофеен в Петербурге и Кудрово. Можно зайти с питомцем.</p>
      </div>

      <div class="m m--plate m--final" data-in="0.82">
        <p class="m__step"><span class="neon">03</span> В путь</p>
        <h2 class="display m__h m__h--big">Просыпайся<br /><span class="neon">с нами</span></h2>
        <div class="m__actions">
          <RouterLink to="/menu" class="btn">Смотреть меню</RouterLink>
          <RouterLink to="/addresses" class="btn btn--ghost">Адреса</RouterLink>
        </div>
      </div>
    </ScrollVideo>

    <div class="ticker" aria-hidden="true">
      <div class="ticker__track">
        <template v-for="k in 2" :key="k">
          <span v-for="t in ticker" :key="t + k" class="ticker__item display">{{ t }}<i class="ticker__bean"></i></span>
        </template>
      </div>
    </div>

    <section class="why wrap" aria-labelledby="why-title">
      <h2 id="why-title" class="sr-only">Почему Будини</h2>
      <article v-for="(w, i) in why" :key="w.n" class="why__item reveal" :style="{ '--d': i * 0.1 + 's' }">
        <span class="why__n display neon">{{ w.n }}</span>
        <h3 class="why__t">{{ w.t }}</h3>
        <p class="why__d">{{ w.d }}</p>
      </article>
    </section>

    <OrderAlarm />

    <section class="hits wrap" aria-labelledby="hits-title">
      <div class="hits__head reveal">
        <div>
          <p class="eyebrow">{{ season ? 'Новинка сезона' : 'В меню' }}</p>
          <h2 id="hits-title" class="display hits__title">
            <template v-if="season">Осеннее <span class="neon">меню</span> {{ season.emoji }}</template>
            <template v-else>Классика <span class="neon">Будини</span></template>
          </h2>
          <p v-if="season?.promo" class="hits__lead">{{ season.promo.text }}</p>
        </div>
        <RouterLink :to="season ? { path: '/menu', hash: '#cat-' + season.id } : '/menu'" class="btn btn--ghost">Всё меню</RouterLink>
      </div>
      <div class="hits__grid">
        <div v-for="(h, i) in showcase" :key="h.id" class="reveal" :style="{ '--d': (i % 4) * 0.08 + 's' }">
          <DrinkCard :item="h" />
        </div>
      </div>
      <p v-if="season?.promo" class="hits__foot reveal">{{ season.promo.question }} {{ season.promo.footer }}</p>
    </section>

    <section class="near wrap" aria-labelledby="near-title">
      <div class="hits__head reveal">
        <div>
          <p class="eyebrow">{{ cafes.length }} кофеен · Петербург и Кудрово</p>
          <h2 id="near-title" class="display hits__title">Где нас <span class="neon">найти</span></h2>
        </div>
        <RouterLink to="/addresses" class="btn btn--ghost">Все адреса</RouterLink>
      </div>
      <ul class="near__list">
        <li v-for="(c, i) in cafes" :key="c.id" class="near__item reveal" :style="{ '--d': i * 0.07 + 's' }">
          <RouterLink :to="{ path: '/addresses', hash: '#' + c.id }" class="near__link">
            <span class="near__street display">{{ c.street }}</span>
            <span class="near__meta">{{ c.landmark || c.city }} · {{ hoursText(c) }}</span>
            <span class="near__state" :class="{ open: openState(c).open }">{{ openState(c).label }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="more wrap" aria-labelledby="more-title">
      <h2 id="more-title" class="sr-only">Ещё в Будини</h2>
      <RouterLink v-for="(c, i) in more" :key="c.to" :to="c.to" class="more__card reveal" :class="{ 'more__card--mint': i === 0 }" :style="{ '--d': i * 0.08 + 's' }">
        <span class="more__k">{{ c.k }}</span>
        <span class="more__t display">{{ c.t }}</span>
        <span class="more__d">{{ c.d }}</span>
        <span class="more__arrow" aria-hidden="true">→</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
/* ---- текстовые моменты поверх scroll-video ---- */
.m {
  position: absolute;
  opacity: 0;
  visibility: hidden;
}

/* первый экран: чёрная лента во всю ширину, как на брендовой обложке */
.m--hero {
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
}

.m__band {
  width: 100%;
  background: #000;
  padding: clamp(10px, 1.6vw, 22px) var(--gutter);
}

.m__title {
  margin: 0;
  font-size: clamp(44px, 11.5vw, 168px);
  color: #fff;
}

.m__tag {
  margin: 0;
  padding: 8px 14px;
  background: #000;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mint);
}

.m__tag--text {
  max-width: min(46ch, calc(100% - 2 * var(--gutter)));
  padding: 12px 18px;
  font-family: var(--font-body);
  font-size: 16px;
  letter-spacing: 0;
  text-transform: none;
  color: var(--text);
}

/* остальные моменты: сплошные плашки с мятной кромкой */
.m--plate {
  max-width: 500px;
  padding: 26px 30px 30px;
  background: var(--ink);
  border-left: 3px solid var(--mint);
}

.m--left {
  left: var(--gutter);
  top: 50%;
  margin-top: -130px;
}

.m--right {
  right: var(--gutter);
  top: 50%;
  margin-top: -130px;
}

.m--final {
  left: var(--gutter);
  bottom: 9vh;
  max-width: min(920px, calc(100% - 2 * var(--gutter)));
}

.m__text {
  margin: 0;
  font-size: 17px;
  color: var(--muted);
}

.m__step {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

.m__h {
  margin: 0 0 14px;
  font-size: clamp(26px, 3.4vw, 46px);
}

.m__h--big {
  font-size: clamp(30px, 4.8vw, 70px);
}

.m__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.m__cue {
  display: inline-block;
  margin-top: 8px;
  width: 26px;
  height: 42px;
  border: 1.5px solid var(--mint);
  border-radius: 14px;
  background: #000;
  position: relative;
}

.m__cue span {
  position: absolute;
  left: 50%;
  top: 8px;
  width: 4px;
  height: 8px;
  margin-left: -2px;
  border-radius: 2px;
  background: var(--mint);
  animation: cue 2.4s var(--ease-io) infinite;
}

@keyframes cue {
  0% { transform: translateY(0); opacity: 0; }
  25% { opacity: 1; }
  70% { transform: translateY(12px); opacity: 0; }
  100% { transform: translateY(12px); opacity: 0; }
}

@media (max-width: 760px) {
  .m--plate {
    left: var(--gutter);
    right: var(--gutter);
    top: auto;
    bottom: 6vh;
    margin-top: 0;
    max-width: none;
    padding: 20px 22px 22px;
  }
}

/* ---- бегущая строка ---- */
.ticker {
  overflow: hidden;
  border-block: 1px solid var(--line);
  background: var(--mint);
  color: var(--ink);
  transform: rotate(-1.5deg) scale(1.03);
  margin-top: -1px;
}

.ticker__track {
  display: flex;
  width: max-content;
  animation: ticker 48s linear infinite;
}

.ticker__item {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  padding: 18px 14px;
  font-size: clamp(18px, 2.4vw, 30px);
  white-space: nowrap;
}

.ticker__bean {
  width: 16px;
  height: 22px;
  border-radius: 50%;
  background: var(--ink);
  transform: rotate(-25deg);
}

@keyframes ticker {
  to { transform: translateX(-50%); }
}

/* ---- почему ---- */
.why {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding-block: 120px 0;
}

.why__item {
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.why__n {
  font-size: 54px;
}

.why__t {
  margin: 18px 0 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
}

.why__d {
  margin: 0;
  color: var(--muted);
}

/* ---- хиты и адреса ---- */
.hits,
.near {
  padding-top: 120px;
}

.hits__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.hits__lead {
  max-width: 62ch;
  margin: 16px 0 0;
  color: var(--muted);
}

.hits__foot {
  margin: 28px 0 0;
  color: var(--muted);
}

.hits__title {
  margin: 12px 0 0;
  font-size: clamp(36px, 6vw, 76px);
}

.hits__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.hits__grid > div {
  display: flex;
}

.hits__grid > div > * {
  flex: 1;
}

.near__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.near__link {
  display: grid;
  grid-template-columns: 1.3fr 1.4fr auto;
  align-items: center;
  gap: 18px;
  padding: 24px 6px;
  border-bottom: 1px solid var(--line);
  transition: background 0.5s var(--ease), padding 0.6s var(--ease);
}

@media (hover: hover) {
  .near__link:hover {
    background: rgba(102, 212, 190, 0.05);
    padding-left: 18px;
  }
}

.near__street {
  font-size: clamp(18px, 2.4vw, 28px);
}

.near__meta {
  color: var(--muted);
  font-size: 15px;
}

.near__state {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--muted);
  white-space: nowrap;
}

.near__state.open {
  border-color: var(--mint);
  color: var(--mint);
}

.more {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  padding-top: 120px;
}

.more__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 240px;
  padding: 28px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--ink-2);
  transition: border-color 0.5s var(--ease), transform 0.6s var(--ease);
}

@media (hover: hover) {
  .more__card:hover {
    border-color: var(--mint);
    transform: translateY(-3px);
  }
}

.more__card--mint {
  background: var(--mint);
  border-color: var(--mint);
  color: var(--ink);
}

.more__k {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
}

.more__t {
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.08; /* мелкий заголовок в карточке: при 0.95 строки слипаются */
}

.more__d {
  margin-top: auto;
  opacity: 0.75;
  max-width: 30ch;
}

.more__arrow {
  position: absolute;
  right: 26px;
  bottom: 22px;
  font-size: 26px;
  transition: transform 0.6s var(--ease);
}

@media (hover: hover) {
  .more__card:hover .more__arrow {
    transform: translateX(6px);
  }
}

@media (max-width: 900px) {
  .more {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1000px) {
  .hits__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .why {
    grid-template-columns: 1fr;
    padding-top: 80px;
  }
  .near__link {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .near__state {
    width: fit-content;
  }
}

@media (max-width: 520px) {
  .hits__grid {
    grid-template-columns: 1fr;
  }
}
</style>
