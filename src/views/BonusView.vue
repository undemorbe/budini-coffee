<script setup>
import { computed, ref } from 'vue'
import FaqList from '../components/FaqList.vue'
import ConceptNote from '../components/ConceptNote.vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

// демо-карта: сколько чашек уже выпито
const cups = ref(7)
const left = computed(() => 10 - cups.value)
const plural = (n) => (n === 1 ? 'чашка' : n < 5 ? 'чашки' : 'чашек')
const tap = (i) => {
  cups.value = cups.value === i + 1 ? i : i + 1
}

const levels = [
  { name: 'Сонный', need: 'с первой чашки', perks: ['10-й кофе в подарок', 'Напиток в день рождения'] },
  { name: 'Бодрый', need: 'от 30 чашек за 3 месяца', perks: ['9-й кофе в подарок', 'Растительное молоко бесплатно', 'Ранний доступ к новинкам'] },
  { name: 'Неспящий', need: 'от 80 чашек за 3 месяца', perks: ['8-й кофе в подарок', 'Любой размер по цене S по понедельникам', 'Приглашения на каппинги'] },
]

const faq = [
  { q: 'Как получить бонусную карту?', a: 'Назови номер телефона бариста при первой покупке или оформи предзаказ на сайте: карта заведётся автоматически.' },
  { q: 'Какие напитки считаются?', a: 'Любой кофе и напитки без кофе любого размера. Выпечка и зерно в пачках в счёт не идут.' },
  { q: 'Сгорают ли чашки?', a: 'Нет, накопленные чашки не сгорают. Уровень пересчитывается раз в 3 месяца.' },
  { q: 'Можно ли потратить подарок в другой кофейне?', a: 'Да, карта одна для всех кофеен «Будини».' },
]
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="Бонусная программа"
      title="Каждый 10-й кофе"
      accent="в подарок"
      lead="Никаких баллов и процентов: просто считаем чашки. Пей кофе в любой кофейне «Будини», а десятый мы угостим."
    />
    <ConceptNote />

    <section class="card-demo wrap" aria-labelledby="demo-title">
      <div class="card reveal">
        <div class="card__head">
          <p id="demo-title" class="card__brand display">Будини · бонусная карта</p>
          <p class="card__count display"><span class="neon">{{ cups }}</span>/10</p>
        </div>
        <div class="cups" role="group" aria-label="Нажми на чашку, чтобы посмотреть, как копятся бонусы">
          <button
            v-for="i in 10"
            :key="i"
            type="button"
            class="cup"
            :class="{ on: i <= cups, gift: i === 10 }"
            :aria-pressed="i <= cups"
            :aria-label="`Чашка ${i}${i === 10 ? ', подарок' : ''}`"
            @click="tap(i - 1)"
          >
            <svg viewBox="0 0 24 30" aria-hidden="true">
              <path d="M3 6h18l-2.2 20.5a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" />
              <rect x="2" y="2" width="20" height="4" rx="1" />
            </svg>
          </button>
        </div>
        <p class="card__note" aria-live="polite">
          <template v-if="left > 0">Ещё {{ left }} {{ plural(left) }} до подарка</template>
          <template v-else>Следующий кофе за наш счёт</template>
        </p>
      </div>
    </section>

    <section class="wrap levels" aria-labelledby="lv-title">
      <h2 id="lv-title" class="display sec__title reveal">Уровни</h2>
      <div class="levels__grid">
        <article v-for="(l, i) in levels" :key="l.name" class="level reveal" :class="{ 'level--top': i === 2 }" :style="{ '--d': i * 0.1 + 's' }">
          <p class="level__n">Уровень {{ i + 1 }}</p>
          <h3 class="level__name display">{{ l.name }}</h3>
          <p class="level__need">{{ l.need }}</p>
          <ul class="level__perks">
            <li v-for="p in l.perks" :key="p">{{ p }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="wrap bfaq" aria-labelledby="bfaq-title">
      <h2 id="bfaq-title" class="display sec__title reveal">Вопросы</h2>
      <FaqList :items="faq" class="reveal" />
    </section>
  </div>
</template>

<style scoped>
.card-demo {
  margin-top: 64px;
}

.card {
  max-width: 760px;
  padding: clamp(22px, 4vw, 40px);
  border-radius: 26px;
  background: var(--ink-2);
  border: 1px solid var(--deep);
}

.card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.card__brand {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.08em;
}

.card__count {
  margin: 0;
  font-size: clamp(36px, 5vw, 56px);
}

.cups {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: clamp(4px, 1.2vw, 12px);
  margin: 28px 0 18px;
}

.cup {
  aspect-ratio: 24 / 30;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.cup svg {
  width: 100%;
  height: 100%;
  fill: transparent;
  stroke: var(--line);
  stroke-width: 1.4;
  transition: fill 0.6s var(--ease), stroke 0.6s var(--ease), transform 0.6s var(--ease);
}

.cup.on svg {
  fill: var(--mint);
  stroke: var(--mint);
}

.cup.gift svg {
  stroke: var(--mint);
  stroke-dasharray: 3 2;
}

.cup.gift.on svg {
  fill: var(--pale);
  stroke-dasharray: none;
}

@media (hover: hover) {
  .cup:hover svg {
    transform: translateY(-3px);
  }
}

.card__note {
  margin: 0;
  color: var(--muted);
}

.sec__title {
  margin: 0 0 36px;
  font-size: clamp(32px, 5vw, 64px);
}

.levels,
.bfaq {
  padding-top: 110px;
}

.levels__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.level {
  padding: 28px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--ink-2);
}

.level--top {
  background: var(--mint);
  color: var(--ink);
  border-color: var(--mint);
}

.level__n {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
}

.level__name {
  margin: 12px 0 6px;
  font-size: 30px;
}

.level__need {
  margin: 0 0 18px;
  opacity: 0.75;
}

.level__perks {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
}

@media (max-width: 900px) {
  .levels__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .cups {
    grid-template-columns: repeat(5, 1fr);
    max-width: 320px;
  }
}
</style>
