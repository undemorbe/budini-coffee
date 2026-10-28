<script setup>
import { ref } from 'vue'
import FaqList from '../components/FaqList.vue'
import OrderAlarm from '../components/OrderAlarm.vue'
import ConceptNote from '../components/ConceptNote.vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

const steps = [
  { n: '01', t: 'Выбери напиток', d: 'Классика, авторские напитки или осенние новинки. Объём от 250 до 600 мл.' },
  { n: '02', t: 'Кофейню и время', d: 'Пять кофеен в Петербурге и Кудрово, все работают ежедневно до 23:00.' },
  { n: '03', t: 'Забери без очереди', d: 'Стакан с твоим именем ждёт на полке предзаказов. Подходи сразу к ней, минуя кассу.' },
]

const faq = [
    { q: 'Можно ли изменить или отменить заказ?', a: 'Да, пока бариста не начал готовить: до этого момента заказ можно отменить в один клик.' },
  { q: 'Что, если я опоздаю?', a: 'Горячие напитки держим на подогреваемой полке 15 минут. Если задерживаешься дольше, напиши нам, приготовим заново.' },
  { q: 'Начисляются ли бонусы за предзаказ?', a: 'Да, так же, как в кофейне: каждая чашка приближает тебя к бесплатной.' },
]
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="Предзаказ"
      title="Закажи сейчас, забери"
      accent="без очереди"
      lead="Заведи «будильник» на нужное время: мы начнём готовить так, чтобы кофе был горячим ровно к твоему приходу."
    />
    <ConceptNote />

    <OrderAlarm bare />

    <section class="how wrap" aria-labelledby="how-title">
      <h2 id="how-title" class="display how__title reveal">Как это работает</h2>
      <ol class="how__list">
        <li v-for="(s, i) in steps" :key="s.n" class="how__item reveal" :style="{ '--d': i * 0.1 + 's' }">
          <span class="how__n display neon">{{ s.n }}</span>
          <h3 class="how__t">{{ s.t }}</h3>
          <p class="how__d">{{ s.d }}</p>
        </li>
      </ol>
    </section>

    <section class="wrap order-faq" aria-labelledby="ofaq-title">
      <h2 id="ofaq-title" class="display how__title reveal">Вопросы о заказе</h2>
      <FaqList :items="faq" class="reveal" />
    </section>
  </div>
</template>

<style scoped>
.how,
.order-faq {
  padding-top: 110px;
}

.how__title {
  margin: 0 0 36px;
  font-size: clamp(30px, 4.6vw, 56px);
}

.how__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.how__item {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--ink-2);
}

.how__n {
  font-size: 44px;
}

.how__t {
  margin: 18px 0 8px;
  font-family: var(--font-display);
  font-size: 18px;
  text-transform: uppercase;
}

.how__d {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 860px) {
  .how__list {
    grid-template-columns: 1fr;
  }
}
</style>
