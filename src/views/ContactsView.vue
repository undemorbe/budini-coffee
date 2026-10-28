<script setup>
import { reactive, ref } from 'vue'
import FaqList from '../components/FaqList.vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'
import { contacts } from '../data/site'

const root = ref(null)
useReveal(root)

const topics = ['Вопрос о заказе', 'Отзыв о кофейне', 'Сотрудничество', 'Мероприятие']
const form = reactive({ name: '', contact: '', topic: topics[0], text: '' })
const errors = reactive({})
const sent = ref(false)

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Как к тебе обращаться?'
  errors.contact = /@|\d{6,}/.test(form.contact.replace(/[\s()+-]/g, '')) ? '' : 'Укажи почту или телефон, чтобы мы ответили'
  errors.text = form.text.trim().length >= 10 ? '' : 'Напиши хотя бы пару слов (от 10 символов)'
  return !errors.name && !errors.contact && !errors.text
}
const submit = () => {
  if (validate()) sent.value = true
}

const faq = [
  { q: 'Можно прийти со своей кружкой?', a: 'Да, и мы сделаем скидку 20 ₽ на любой напиток. Кружку чистим и наполняем при тебе.' },
  { q: 'Есть ли растительное молоко?', a: 'Овсяное и кокосовое во всех кофейнях. Отметка «растительное молоко» есть в меню.' },
  { q: 'Можно с собакой?', a: 'В кофейне на Набережной с собакой можно и на веранду, и в зал. В остальных точках только на вынос.' },
  { q: 'Есть Wi-Fi и розетки?', a: 'Да, в зале на пр. Мира. Остальные точки работают в основном на вынос.' },
  { q: 'Делаете кофе на мероприятия?', a: 'Да, привозим мобильный бар с бариста. Напиши через форму, выбрав тему «Мероприятие».' },
]
</script>

<template>
  <div ref="root">
    <PageHero eyebrow="Контакты" title="Напиши нам," accent="мы не спим" lead="Вопрос, отзыв, идея для мероприятия или сотрудничество: ответим в течение рабочего дня." />

    <section class="wrap contacts" aria-label="Контакты и форма">
      <div class="info reveal">
        <a :href="contacts.phoneHref" class="info__big display">{{ contacts.phone }}</a>
        <p class="info__row">{{ contacts.email }}</p>
        <p class="info__row">Telegram: {{ contacts.telegram }}</p>
        <p class="info__row">ВКонтакте: {{ contacts.vk }}</p>
        <p class="info__row info__muted">{{ contacts.hours }}</p>
        <RouterLink to="/addresses" class="btn btn--ghost info__btn">Адреса кофеен</RouterLink>
      </div>

      <form class="form reveal" novalidate @submit.prevent="submit">
        <template v-if="!sent">
          <label class="field">
            <span>Имя</span>
            <input v-model="form.name" type="text" autocomplete="name" :aria-invalid="!!errors.name" />
            <small v-if="errors.name" class="err">{{ errors.name }}</small>
          </label>
          <label class="field">
            <span>Почта или телефон</span>
            <input v-model="form.contact" type="text" autocomplete="email" :aria-invalid="!!errors.contact" />
            <small v-if="errors.contact" class="err">{{ errors.contact }}</small>
          </label>
          <fieldset class="field field--topics">
            <legend>Тема</legend>
            <div class="chips">
              <button v-for="t in topics" :key="t" type="button" class="chip" :aria-pressed="form.topic === t" @click="form.topic = t">{{ t }}</button>
            </div>
          </fieldset>
          <label class="field">
            <span>Сообщение</span>
            <textarea v-model="form.text" rows="5" :aria-invalid="!!errors.text"></textarea>
            <small v-if="errors.text" class="err">{{ errors.text }}</small>
          </label>
          <button type="submit" class="btn form__btn">Отправить</button>
        </template>
        <div v-else class="sent" aria-live="polite">
          <p class="sent__t display">Спасибо, {{ form.name }}!</p>
          <p class="sent__d">Это демо-версия сайта, поэтому сообщение никуда не отправлено. В рабочей версии мы ответим на {{ form.contact }}.</p>
        </div>
      </form>
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

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}

.field span,
.field legend {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.field--topics legend {
  margin-bottom: 10px;
}

.field input,
.field textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--ink);
  color: var(--text);
  font: inherit;
  resize: vertical;
  transition: border-color 0.4s var(--ease);
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--mint);
}

.field [aria-invalid='true'] {
  border-color: #e58a7a;
}

.err {
  color: #e58a7a;
  font-size: 13px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form__btn {
  align-self: flex-start;
}

.sent__t {
  margin: 0 0 10px;
  font-size: 28px;
  color: var(--mint);
}

.sent__d {
  margin: 0;
  color: var(--muted);
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
