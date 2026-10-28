<script setup>
import { ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

const stats = [
  { v: '4', l: 'кофейни в городе' },
  { v: '14', l: 'дней максимум от обжарки до чашки' },
  { v: '2', l: 'минуты на заказ' },
  { v: '7:30', l: 'открываемся каждый день' },
]

const path = [
  { t: 'Зерно', d: 'Покупаем зелёное зерно небольшими лотами из Бразилии, Эфиопии и Колумбии у проверенных импортёров.' },
  { t: 'Обжарка', d: 'Обжариваем раз в неделю у партнёров-обжарщиков: средняя обжарка для эспрессо, светлая для фильтра.' },
  { t: 'Настройка', d: 'Каждое утро бариста настраивают помол и пробуют эспрессо, прежде чем открыть двери.' },
  { t: 'Чашка', d: 'Готовим по единым рецептам, чтобы твой латте был одинаковым в любой из наших кофеен.' },
]

const story = [
  { y: '2021', t: 'Окно навынос у метро', d: 'Первая точка «Будини»: два метра стойки, одна кофемашина и очередь из соседних офисов.' },
  { y: '2022', t: 'Мятный раф', d: 'Придумали фирменный напиток, который до сих пор заказывают чаще всего.' },
  { y: '2024', t: 'Большой зал на Мира', d: 'Открыли кофейню, где можно остаться: розетки, Wi-Fi и десерты от своего пекаря.' },
  { y: '2026', t: 'Предзаказ «Будильник»', d: 'Запустили заказ к нужному времени, чтобы утро начиналось без очереди.' },
]

const values = [
  { t: 'Быстро, но не на бегу', d: 'Скорость важна, но каждый напиток проходит по рецепту, без компромиссов во вкусе.' },
  { t: 'Честный состав', d: 'У каждого напитка в меню видно бодрость, состав и можно ли заменить молоко на растительное.' },
  { t: 'Своя команда', d: 'Бариста учатся у нас с нуля, лучшие становятся тренерами и шифт-лидерами.' },
]
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="О нас"
      title="Кофейня, которая"
      accent="будит"
      lead="«Будини» начиналась с окна навынос у метро. Сейчас это четыре кофейни, свежая обжарка каждую неделю и команда, которая знает тебя по любимому напитку."
    />

    <section class="stats wrap" aria-label="Будини в цифрах">
      <div v-for="(s, i) in stats" :key="s.l" class="stat reveal" :style="{ '--d': i * 0.08 + 's' }">
        <p class="stat__v display neon">{{ s.v }}</p>
        <p class="stat__l">{{ s.l }}</p>
      </div>
    </section>

    <section class="band" aria-labelledby="path-title">
      <div class="wrap">
        <h2 id="path-title" class="display sec__title reveal">От зерна <span class="neon">до чашки</span></h2>
        <ol class="path">
          <li v-for="(p, i) in path" :key="p.t" class="path__item reveal" :style="{ '--d': i * 0.1 + 's' }">
            <span class="path__n">0{{ i + 1 }}</span>
            <h3 class="path__t display">{{ p.t }}</h3>
            <p class="path__d">{{ p.d }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="wrap story" aria-labelledby="story-title">
      <h2 id="story-title" class="display sec__title reveal">История</h2>
      <ol class="story__list">
        <li v-for="s in story" :key="s.y" class="story__item reveal">
          <span class="story__y display">{{ s.y }}</span>
          <div>
            <h3 class="story__t">{{ s.t }}</h3>
            <p class="story__d">{{ s.d }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="wrap values" aria-labelledby="values-title">
      <h2 id="values-title" class="display sec__title reveal">Во что <span class="neon">верим</span></h2>
      <div class="values__grid">
        <article v-for="(v, i) in values" :key="v.t" class="value reveal" :style="{ '--d': i * 0.1 + 's' }">
          <h3 class="value__t">{{ v.t }}</h3>
          <p class="value__d">{{ v.d }}</p>
        </article>
      </div>
      <div class="cta reveal">
        <p class="cta__t display">Хочешь в команду?</p>
        <RouterLink to="/careers" class="btn">Смотреть вакансии</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 64px;
}

.stat {
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.stat__v {
  margin: 0;
  font-size: clamp(40px, 5vw, 64px);
}

.stat__l {
  margin: 8px 0 0;
  color: var(--muted);
}

.sec__title {
  margin: 0 0 40px;
  font-size: clamp(32px, 5vw, 64px);
}

.band {
  margin-top: 110px;
  padding-block: 90px;
  background: var(--ink-2);
  border-block: 1px solid var(--line);
}

.path {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.path__item {
  padding: 26px;
  border-radius: var(--radius);
  background: var(--ink);
  border: 1px solid var(--line);
}

.path__n {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.2em;
  color: var(--mint);
}

.path__t {
  margin: 14px 0 10px;
  font-size: 22px;
}

.path__d {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

.story,
.values {
  padding-top: 110px;
}

.story__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.story__item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  padding: 28px 0;
  border-bottom: 1px solid var(--line);
}

.story__y {
  font-size: clamp(30px, 4vw, 48px);
  color: var(--mint);
}

.story__t {
  margin: 4px 0 6px;
  font-family: var(--font-display);
  font-size: 18px;
  text-transform: uppercase;
}

.story__d {
  margin: 0;
  color: var(--muted);
  max-width: 60ch;
}

.values__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.value {
  padding: 26px;
  border-left: 3px solid var(--mint);
  background: var(--ink-2);
}

.value__t {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 17px;
  text-transform: uppercase;
}

.value__d {
  margin: 0;
  color: var(--muted);
}

.cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 56px;
  padding: 32px;
  background: var(--mint);
  color: var(--ink);
  border-radius: var(--radius);
}

.cta__t {
  margin: 0;
  font-size: clamp(24px, 3.4vw, 40px);
}

.cta .btn {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--mint);
}

@media (max-width: 960px) {
  .stats,
  .path {
    grid-template-columns: repeat(2, 1fr);
  }
  .values__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stats,
  .path {
    grid-template-columns: 1fr;
  }
  .story__item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
