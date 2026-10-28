<script setup>
import { ref } from 'vue'
import FaqList from '../components/FaqList.vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'
import { cafes, hoursText } from '../data/cafes'
import { brand, contacts } from '../data/site'

const root = ref(null)
useReveal(root)

const channels = [
  { label: 'WhatsApp', note: 'Быстрее всего', href: contacts.whatsapp },
  { label: 'Telegram', note: contacts.telegramLabel, href: contacts.telegram },
  { label: 'ВКонтакте', note: contacts.vkLabel, href: contacts.vk },
]

const faq = [
  { q: 'Где вы находитесь?', a: cafes.map((c) => c.address).join('; ') + '.' },
  { q: 'До скольки работаете?', a: 'Все кофейни работают ежедневно до 23:00. Открытие с 07:30 или 08:00, точное время у каждой точки на странице адресов.' },
  { q: 'Можно с животными?', a: 'Да, с питомцами можно во все наши кофейни.' },
  { q: 'Как можно оплатить?', a: `${brand.payment}.` },
  { q: 'Есть кофе с собой?', a: 'Да, любой напиток можно взять с собой.' },
]
</script>

<template>
  <div ref="root">
    <PageHero eyebrow="Контакты" title="Напиши нам," accent="мы не спим" lead="Вопрос, отзыв или идея: звоните или пишите в мессенджеры. Одна линия для всех кофеен сети." />

    <section class="wrap contacts" aria-label="Контакты">
      <div class="info reveal">
        <a :href="contacts.phoneHref" class="info__big display">{{ contacts.phone }}</a>
        <p class="info__row">{{ contacts.hours }}</p>
        <p class="info__row info__muted">{{ brand.payment }}</p>
        <p class="info__row info__muted">Можно с животными · кофе с собой</p>
        <RouterLink to="/addresses" class="btn btn--ghost info__btn">Адреса кофеен</RouterLink>
      </div>

      <div class="form reveal">
        <p class="form__t display">Написать</p>
        <a v-for="c in channels" :key="c.label" :href="c.href" target="_blank" rel="noopener" class="channel">
          <span class="channel__label display">{{ c.label }}</span>
          <span class="channel__note">{{ c.note }}</span>
          <span class="channel__arrow" aria-hidden="true">↗</span>
        </a>
        <ul class="hours">
          <li v-for="c in cafes" :key="c.id"><span>{{ c.street }}</span><span>{{ hoursText(c) }}</span></li>
        </ul>
      </div>
    </section>

    <section class="wrap cfaq" aria-labelledby="cfaq-title">
      <h2 id="cfaq-title" class="display cfaq__t reveal">Частые вопросы</h2>
      <FaqList :items="faq" class="reveal" />
    </section>
  </div>
</template>

<style scoped>
.contacts {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  margin-top: 64px;
  align-items: start;
}

.info__big {
  display: block;
  margin-bottom: 18px;
  font-size: clamp(26px, 3.6vw, 44px);
  color: var(--mint);
}

.info__row {
  margin: 0 0 8px;
  font-size: 18px;
}

.info__muted {
  color: var(--muted);
}

.info__btn {
  margin-top: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: clamp(22px, 3.4vw, 36px);
  border-radius: 24px;
  background: var(--ink-2);
  border: 1px solid var(--line);
}

.form__t {
  margin: 0 0 4px;
  font-size: 22px;
}

.channel {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 12px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: var(--ink);
  color: var(--text);
  transition: border-color 0.4s var(--ease);
}

@media (hover: hover) {
  .channel:hover {
    border-color: var(--mint);
  }
}

.channel__label {
  font-size: 18px;
}

.channel__note {
  grid-row: 2;
  font-size: 14px;
  color: var(--muted);
}

.channel__arrow {
  grid-row: 1 / 3;
  grid-column: 2;
  font-size: 20px;
  color: var(--mint);
}

.hours {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: var(--muted);
}

.hours li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-top: 1px solid var(--line);
}

.cfaq {
  padding-top: 110px;
}

.cfaq__t {
  margin: 0 0 36px;
  font-size: clamp(32px, 5vw, 64px);
}

@media (max-width: 900px) {
  .contacts {
    grid-template-columns: 1fr;
  }
}
</style>
