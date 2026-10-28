<script setup>
// «Будильник»: предзаказ к нужному времени. Демо без оплаты и отправки на сервер:
// заказ появится, когда подключим бэкенд.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// bare: без собственного заголовка (на странице /order заголовок даёт PageHero)
const props = defineProps({ bare: { type: Boolean, default: false } })
import { cafes } from '../data/cafes'
import { menu } from '../data/menu'
import { findItem } from '../domain/menu/getMenu'

// напитки для быстрого заказа: осенняя новинка (если сезон идёт) и классика
const drinks = ['pumpkin_latte', 'cappuccino', 'latte', 'raf', 'americano', 'flat_white'].map((id) => findItem(menu, id)).filter(Boolean)
const drinkId = ref(drinks[0].id)
const volumeIdx = ref(0)
// кофейню можно передать из страницы адресов: /order?cafe=ispytateley_5
const route = useRoute()
const cafeId = ref(cafes.some((c) => c.id === route.query.cafe) ? route.query.cafe : cafes[0].id)
const slot = ref('soon')
const done = ref(false)

const drink = computed(() => drinks.find((d) => d.id === drinkId.value))
const volume = computed(() => drink.value.volumes[volumeIdx.value] ?? drink.value.volumes[0])
watch(drinkId, () => {
  volumeIdx.value = drink.value.volumes.length >= 3 ? 1 : 0
  done.value = false
})
watch([volumeIdx, cafeId, slot], () => {
  done.value = false
})
volumeIdx.value = drink.value.volumes.length >= 3 ? 1 : 0

const cafe = computed(() => cafes.find((c) => c.id === cafeId.value))
const pad = (n) => String(n).padStart(2, '0')
const slots = computed(() => {
  const now = new Date()
  const soon = new Date(now.getTime() + 15 * 60000)
  const list = [{ id: 'soon', label: `Как можно скорее · ${pad(soon.getHours())}:${pad(soon.getMinutes())}` }]
  // ближайшие получасовые слоты
  const t = new Date(now.getTime() + 30 * 60000)
  t.setMinutes(t.getMinutes() < 30 ? 30 : 60, 0, 0)
  for (let i = 0; i < 3; i++) {
    const d = new Date(t.getTime() + i * 30 * 60000)
    list.push({ id: `t${i}`, label: `${pad(d.getHours())}:${pad(d.getMinutes())}` })
  }
  return list
})
const slotLabel = computed(() => slots.value.find((s) => s.id === slot.value)?.label.replace('Как можно скорее · ', '') ?? '')
const price = computed(() => volume.value.price)

// Телефон: билет с итогом стоит под четырьмя шагами, поэтому, пока шаги на экране,
// а билет нет, снизу держим компактную панель с ценой и кнопкой.
const steps = ref(null)
const ticket = ref(null)
const stepsIn = ref(false)
const ticketIn = ref(false)
const showBar = computed(() => stepsIn.value && !ticketIn.value)
let io
onMounted(() => {
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.target === steps.value) stepsIn.value = e.isIntersecting
      if (e.target === ticket.value) ticketIn.value = e.isIntersecting
    }
  })
  io.observe(steps.value)
  io.observe(ticket.value)
})
onBeforeUnmount(() => io?.disconnect())
const submitFromBar = () => {
  done.value = true
  ticket.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <section id="budilnik" class="alarm wrap" :class="{ 'alarm--bare': props.bare }" :aria-labelledby="props.bare ? undefined : 'alarm-title'" :aria-label="props.bare ? 'Форма предзаказа' : undefined">
    <div v-if="!props.bare" class="alarm__head reveal">
      <p class="eyebrow">Предзаказ</p>
      <h2 id="alarm-title" class="display alarm__title">Заведи <span class="neon">будильник</span></h2>
      <p class="alarm__lead">Выбери напиток, кофейню и время. Мы начнём готовить так, чтобы кофе был горячим ровно к твоему приходу.</p>
    </div>

    <div class="alarm__body">
      <div ref="steps" class="alarm__steps">
        <fieldset class="step reveal">
          <legend><span>01</span> Напиток</legend>
          <div class="chips">
            <button v-for="d in drinks" :key="d.id" type="button" class="chip" :aria-pressed="drinkId === d.id" @click="drinkId = d.id"><template v-if="d.emoji">{{ d.emoji }} </template>{{ d.name }}</button>
          </div>
        </fieldset>

        <fieldset class="step reveal">
          <legend><span>02</span> Объём</legend>
          <div class="chips">
            <button v-for="(v, i) in drink.volumes" :key="v.ml" type="button" class="chip" :aria-pressed="volume.ml === v.ml" @click="volumeIdx = i">{{ v.label }} · {{ v.price }} ₽</button>
          </div>
        </fieldset>

        <fieldset class="step reveal">
          <legend><span>03</span> Кофейня</legend>
          <div class="cafes">
            <label v-for="c in cafes" :key="c.id" class="cafe" :class="{ on: cafeId === c.id }">
              <input v-model="cafeId" type="radio" name="cafe" :value="c.id" class="sr-only" />
              <span class="cafe__name">{{ c.street }}</span>
              <span class="cafe__wait">{{ c.landmark || c.city }}</span>
            </label>
          </div>
        </fieldset>

        <fieldset class="step reveal">
          <legend><span>04</span> Время</legend>
          <div class="chips">
            <button v-for="s in slots" :key="s.id" type="button" class="chip" :aria-pressed="slot === s.id" @click="slot = s.id">{{ s.label }}</button>
          </div>
        </fieldset>
      </div>

      <aside ref="ticket" class="ticket reveal" aria-live="polite">
        <div class="ticket__clock display neon">{{ slotLabel }}</div>
        <p class="ticket__line">{{ drink.name }} · {{ volume.label }}</p>
        <p class="ticket__line ticket__muted">{{ cafe.street }}, {{ cafe.city }}</p>
        <div class="ticket__sep" aria-hidden="true"></div>
        <p class="ticket__total"><span>Итого</span><strong>{{ price }} ₽</strong></p>
        <button v-if="!done" type="button" class="btn ticket__btn" @click="done = true">Завести будильник</button>
        <p v-else class="ticket__done">Это демо: онлайн-предзаказ появится в рабочей версии сайта, заказ никуда не отправлен.</p>
      </aside>
    </div>

    <Transition name="bar">
      <div v-if="showBar" class="mbar" aria-hidden="true">
        <div class="mbar__info">
          <span class="mbar__price display">{{ price }} ₽</span>
          <span class="mbar__what">{{ drink.name }} · {{ slotLabel }}</span>
        </div>
        <button type="button" class="btn mbar__btn" tabindex="-1" @click="submitFromBar">Завести</button>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.alarm {
  padding-block: 120px 40px;
}

.alarm--bare {
  padding-top: 0;
}

.alarm--bare .alarm__body {
  margin-top: 48px;
}

.alarm__title {
  margin: 14px 0 18px;
  font-size: clamp(40px, 7vw, 92px);
}

.alarm__lead {
  max-width: 52ch;
  margin: 0;
  color: var(--muted);
}

.alarm__body {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 40px;
  margin-top: 56px;
  align-items: start;
}

.alarm__steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.step {
  margin: 0;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--ink-2);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step legend {
  float: left;
  width: 100%;
  margin-bottom: 4px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.step legend span {
  color: var(--mint);
  margin-right: 10px;
}

.chips {
  clear: both;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cafes {
  clear: both;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.cafe {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.35s var(--ease), background 0.35s var(--ease);
}

@media (hover: hover) {
  .cafe:hover {
    border-color: var(--deep);
  }
}

.cafe.on {
  border-color: var(--mint);
  background: rgba(102, 212, 190, 0.08);
}

.cafe:focus-within {
  outline: 2px solid var(--mint);
  outline-offset: 2px;
}

.cafe__name {
  font-weight: 600;
}

.cafe__wait {
  font-size: 13px;
  color: var(--muted);
}

.ticket {
  position: sticky;
  top: calc(var(--header-h) + 24px);
  padding: 30px;
  border-radius: 24px;
  background: var(--ink-3);
  border: 1px solid var(--deep);
}

/* вырезы как у чека */
.ticket::before,
.ticket::after {
  content: '';
  position: absolute;
  top: 58%;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ink);
  border: 1px solid var(--deep);
}

.ticket::before {
  left: -12px;
  clip-path: inset(0 0 0 50%);
}

.ticket::after {
  right: -12px;
  clip-path: inset(0 50% 0 0);
}

.ticket__clock {
  font-size: clamp(54px, 7vw, 84px);
  line-height: 1;
  margin-bottom: 20px;
}

.ticket__line {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.ticket__muted {
  color: var(--muted);
  font-weight: 400;
  font-size: 15px;
}

.ticket__sep {
  margin: 26px 0 18px;
  border-top: 1px dashed var(--deep);
}

.ticket__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0 0 22px;
  color: var(--muted);
}

.ticket__total strong {
  font-family: var(--font-display);
  font-size: 30px;
  color: var(--text);
}

.ticket__btn {
  width: 100%;
}

.ticket__done {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(102, 212, 190, 0.1);
  color: var(--pale);
  font-size: 14px;
}

@media (max-width: 900px) {
  .alarm__body {
    grid-template-columns: 1fr;
  }
  .ticket {
    position: relative;
    top: 0;
  }
}

@media (max-width: 520px) {
  .cafes {
    grid-template-columns: 1fr;
  }
}

.mbar {
  display: none;
}

@media (max-width: 900px) {
  .mbar {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 10px 10px 18px;
    border-radius: 20px;
    background: var(--ink-2);
    border: 1px solid var(--deep);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
}

.mbar__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mbar__price {
  font-size: 20px;
  color: var(--mint);
}

.mbar__what {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--muted);
}

.mbar__btn {
  flex: none;
}

.bar-enter-active,
.bar-leave-active {
  transition: opacity 0.4s var(--ease), transform 0.5s var(--ease);
}

.bar-enter-from,
.bar-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
