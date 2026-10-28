<script setup>
import { computed, ref } from 'vue'
import FaqList from '../components/FaqList.vue'
import ConceptNote from '../components/ConceptNote.vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

const amounts = [500, 1000, 2000, 3000]
const amount = ref(1000)
const design = ref('swirl')
const to = ref('')
const message = ref('Проснись и пей кофе!')
const done = ref(false)
const cupsFor = computed(() => Math.floor(amount.value / 250))

const designs = [
  { id: 'swirl', label: 'Разводы' },
  { id: 'mint', label: 'Мятный' },
  { id: 'night', label: 'Ночной' },
]

const submit = () => {
  done.value = true
}

const faq = [
  { q: 'Сколько действует сертификат?', a: 'Один год с момента покупки. Его можно потратить частями в любой кофейне «Будини».' },
  { q: 'Как получатель узнает о подарке?', a: 'Мы отправим ему письмо с сертификатом и твоим поздравлением в выбранный день.' },
  { q: 'Можно ли купить сертификат для компании?', a: 'Да, от 10 сертификатов делаем скидку и единый счёт. Напиши нам на странице контактов.' },
]
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="Подарочные сертификаты"
      title="Подари кому-то"
      accent="бодрое утро"
      lead="Электронный сертификат на любую сумму: его можно потратить на напитки, выпечку и зерно во всех кофейнях «Будини»."
    />
    <ConceptNote />

    <section class="gift wrap" aria-label="Оформление сертификата">
      <div class="preview reveal" :class="'preview--' + design" aria-hidden="true">
        <div class="preview__top">
          <span class="display">Будини</span>
          <span class="display">Coffee</span>
        </div>
        <p class="preview__amount display">{{ amount.toLocaleString('ru-RU') }} ₽</p>
        <p class="preview__msg">{{ message || 'Твоё поздравление' }}</p>
        <p class="preview__to">{{ to ? 'Для: ' + to : 'Для: имя получателя' }}</p>
      </div>

      <form class="form reveal" @submit.prevent="submit">
        <fieldset class="form__group">
          <legend>Сумма</legend>
          <div class="chips">
            <button v-for="a in amounts" :key="a" type="button" class="chip" :aria-pressed="amount === a" @click="amount = a">{{ a.toLocaleString('ru-RU') }} ₽</button>
          </div>
          <p class="hint">Это примерно {{ cupsFor }} чашки капучино</p>
        </fieldset>

        <fieldset class="form__group">
          <legend>Дизайн</legend>
          <div class="chips">
            <button v-for="d in designs" :key="d.id" type="button" class="chip" :aria-pressed="design === d.id" @click="design = d.id">{{ d.label }}</button>
          </div>
        </fieldset>

        <label class="field">
          <span>Имя получателя</span>
          <input v-model="to" type="text" maxlength="40" placeholder="Например, Аня" />
        </label>

        <label class="field">
          <span>Поздравление</span>
          <textarea v-model="message" rows="3" maxlength="140"></textarea>
        </label>

        <button v-if="!done" type="submit" class="btn form__btn">Оформить за {{ amount.toLocaleString('ru-RU') }} ₽</button>
        <p v-else class="form__done" aria-live="polite">Готово! Это демо-версия сайта: оплата и отправка сертификата не выполняются.</p>
      </form>
    </section>

    <section class="wrap gfaq" aria-labelledby="gfaq-title">
      <h2 id="gfaq-title" class="display gfaq__t reveal">Вопросы</h2>
      <FaqList :items="faq" class="reveal" />
    </section>
  </div>
</template>

<style scoped>
.gift {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
  margin-top: 64px;
}

.preview {
  position: sticky;
  top: calc(var(--header-h) + 24px);
  aspect-ratio: 16 / 10;
  padding: clamp(20px, 3vw, 34px);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.7s var(--ease), color 0.7s var(--ease);
}

.preview--swirl {
  background: #000 url('/frames/frame_0001.webp') center / cover;
  color: #fff;
}

.preview--mint {
  background: var(--mint);
  color: var(--ink);
}

.preview--night {
  background: var(--ink-3);
  color: var(--mint);
  border: 1px solid var(--deep);
}

.preview__top {
  display: flex;
  flex-direction: column;
  width: fit-content;
  padding: 8px 12px;
  background: #000;
  color: var(--mint);
  font-size: 15px;
  line-height: 1;
}

.preview--mint .preview__top {
  background: var(--ink);
}

.preview__amount {
  margin: auto 0 8px;
  width: fit-content;
  padding: 6px 12px;
  background: #000;
  color: #fff;
  font-size: clamp(32px, 5vw, 60px);
}

.preview--mint .preview__amount,
.preview--night .preview__amount {
  background: none;
  padding: 0;
  color: inherit;
}

.preview__msg,
.preview__to {
  margin: 0;
  width: fit-content;
  padding: 2px 8px;
  background: #000;
  color: #fff;
  font-size: 15px;
}

.preview--mint .preview__msg,
.preview--mint .preview__to,
.preview--night .preview__msg,
.preview--night .preview__to {
  background: none;
  padding: 0;
  color: inherit;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form__group {
  margin: 0;
  padding: 0;
  border: 0;
}

.form__group legend,
.field span {
  margin-bottom: 10px;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--muted);
}

.field {
  display: flex;
  flex-direction: column;
}

.field input,
.field textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--ink-2);
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

.form__btn {
  align-self: flex-start;
}

.form__done {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--ink-2);
  border: 1px solid var(--deep);
  color: var(--pale);
}

.gfaq {
  padding-top: 110px;
}

.gfaq__t {
  margin: 0 0 36px;
  font-size: clamp(32px, 5vw, 64px);
}

@media (max-width: 900px) {
  .gift {
    grid-template-columns: 1fr;
  }
  .preview {
    position: relative;
    top: 0;
  }
}
</style>
