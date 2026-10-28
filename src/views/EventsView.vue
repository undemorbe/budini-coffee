<script setup>
import { ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

// Демо-расписание: даты и места условные.
const events = ref([
  { id: 'cupping', day: '07', month: 'нояб', time: '19:00', title: 'Каппинг новых лотов', place: 'пр. Мира, 45', price: 'Бесплатно', seats: 4, desc: 'Пробуем три новых зерна вслепую и выбираем, какое пойдёт в эспрессо-бленд зимы.', joined: false },
  { id: 'latteart', day: '14', month: 'нояб', time: '11:00', title: 'Мастер-класс по латте-арту', place: 'пр. Мира, 45', price: '1 500 ₽', seats: 6, desc: 'Сердце, тюльпан и розетта: два часа у кофемашины с нашим тренером, кофе включён.', joined: false },
  { id: 'filter', day: '21', month: 'нояб', time: '20:00', title: 'Ночь фильтра', place: 'Набережная, 8', price: '700 ₽', seats: 12, desc: 'Воронка, аэропресс и кемекс: сравниваем способы заваривания одного и того же зерна.', joined: false },
  { id: 'kids', day: '29', month: 'нояб', time: '12:00', title: 'Какао-лаборатория для детей', place: 'ул. Ленина, 12', price: '500 ₽', seats: 0, desc: 'Варим какао, рисуем на пене и узнаём, откуда берутся какао-бобы. Для детей 6-12 лет.', joined: false },
])

const join = (e) => {
  if (e.seats > 0 && !e.joined) {
    e.joined = true
    e.seats -= 1
  }
}
const seatsText = (n) => (n === 0 ? 'Мест нет' : n === 1 ? 'Осталось 1 место' : n < 5 ? `Осталось ${n} места` : `Осталось ${n} мест`)
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="События"
      title="Каппинги и"
      accent="мастер-классы"
      lead="Раз в неделю собираемся у кофемашины: пробуем новые зёрна, учимся латте-арту и варим фильтр. Приходи, места ограничены."
    />

    <section class="wrap ev" aria-label="Ближайшие события">
      <article v-for="(e, i) in events" :key="e.id" class="ev__item reveal" :style="{ '--d': i * 0.07 + 's' }">
        <div class="ev__date">
          <span class="ev__day display">{{ e.day }}</span>
          <span class="ev__month">{{ e.month }} · {{ e.time }}</span>
        </div>
        <div class="ev__body">
          <h2 class="ev__title display">{{ e.title }}</h2>
          <p class="ev__desc">{{ e.desc }}</p>
          <p class="ev__meta">{{ e.place }} · {{ e.price }}</p>
        </div>
        <div class="ev__side">
          <p class="ev__seats" :class="{ none: e.seats === 0 }">{{ seatsText(e.seats) }}</p>
          <button v-if="!e.joined" type="button" class="btn" :class="{ 'btn--ghost': e.seats === 0 }" :disabled="e.seats === 0" @click="join(e)">
            {{ e.seats === 0 ? 'Лист ожидания' : 'Записаться' }}
          </button>
          <p v-else class="ev__done" aria-live="polite">Ты записан(а). Это демо, запись никуда не отправлена.</p>
        </div>
      </article>
    </section>

    <section class="wrap private reveal" aria-labelledby="priv-title">
      <h2 id="priv-title" class="display private__t">Своё событие в «Будини»</h2>
      <p class="private__d">Закрытый каппинг для команды, день рождения или кофейный кейтеринг на конференцию. Напиши, соберём программу под тебя.</p>
      <RouterLink to="/contacts" class="btn btn--ghost">Обсудить</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.ev {
  margin-top: 64px;
  border-top: 1px solid var(--line);
}

.ev__item {
  display: grid;
  grid-template-columns: 160px 1fr 240px;
  gap: 28px;
  align-items: center;
  padding: 32px 0;
  border-bottom: 1px solid var(--line);
}

.ev__date {
  display: flex;
  flex-direction: column;
}

.ev__day {
  font-size: 64px;
  line-height: 0.9;
  color: var(--mint);
}

.ev__month {
  margin-top: 8px;
  font-size: 14px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ev__title {
  margin: 0 0 10px;
  font-size: clamp(20px, 2.4vw, 28px);
}

.ev__desc {
  margin: 0 0 8px;
  color: var(--muted);
  max-width: 60ch;
}

.ev__meta {
  margin: 0;
  font-size: 14px;
  color: var(--pale);
}

.ev__side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.ev__seats {
  margin: 0;
  font-size: 14px;
  color: var(--mint);
}

.ev__seats.none {
  color: var(--muted);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.ev__done {
  margin: 0;
  font-size: 14px;
  color: var(--pale);
}

.private {
  margin-top: 90px;
  padding: clamp(24px, 4vw, 44px);
  border-radius: var(--radius);
  border: 1px solid var(--deep);
  background: var(--ink-2);
}

.private__t {
  margin: 0 0 12px;
  font-size: clamp(26px, 3.6vw, 44px);
}

.private__d {
  margin: 0 0 22px;
  color: var(--muted);
  max-width: 60ch;
}

@media (max-width: 860px) {
  .ev__item {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .ev__date {
    flex-direction: row;
    align-items: baseline;
    gap: 14px;
  }
}
</style>
