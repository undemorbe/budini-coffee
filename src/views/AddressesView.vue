<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { cafes, hoursText, openState } from '../data/cafes'

const route = useRoute()
const selected = ref(cafes[0].id)
const current = computed(() => cafes.find((c) => c.id === selected.value))
const onlyOpen = ref(false)
const list = computed(() => (onlyOpen.value ? cafes.filter((c) => openState(c).open) : cafes))

onMounted(() => {
  const h = route.hash.replace('#', '')
  if (cafes.some((c) => c.id === h)) selected.value = h
})

// схематичная «ночная» карта: детерминированная сетка улиц
const streets = []
let seed = 7
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
// почти прямые проспекты и улицы с лёгким наклоном, как на ночной схеме города
for (let i = 0; i < 9; i++) {
  const x = 6 + i * 11 + (rnd() - 0.5) * 5
  streets.push({ x1: x, y1: 0, x2: x + (rnd() - 0.5) * 8, y2: 70, w: i % 3 === 1 ? 0.9 : 0.35 })
}
for (let i = 0; i < 7; i++) {
  const y = 5 + i * 10 + (rnd() - 0.5) * 4
  streets.push({ x1: 0, y1: y, x2: 100, y2: y + (rnd() - 0.5) * 7, w: i % 3 === 2 ? 0.9 : 0.35 })
}
streets.push({ x1: 0, y1: 8, x2: 100, y2: 62, w: 0.7 })
</script>

<template>
  <div class="addr">
    <header class="addr__hero wrap">
      <p class="eyebrow">Адреса</p>
      <h1 class="display addr__title">{{ cafes.length }} точки, где тебя <span class="neon">разбудят</span></h1>
      <p class="addr__lead">Выбери кофейню на карте или в списке: покажем часы работы, время ожидания заказа и что там есть.</p>
    </header>

    <div class="addr__body wrap">
      <div class="map" role="img" :aria-label="`Схема города с кофейнями. Выбрана: ${current.street}`">
        <svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice">
          <rect width="100" height="70" fill="#0a0e12" />
          <path d="M-5 52 C 20 40, 30 66, 52 55 S 80 30, 105 44 L 105 58 C 82 46, 70 70, 50 68 S 18 58, -5 66 Z" fill="#0f2a29" />
          <path d="M-5 52 C 20 40, 30 66, 52 55 S 80 30, 105 44" fill="none" stroke="#1e6e69" stroke-width="0.4" />
          <circle cx="22" cy="18" r="7" fill="#0f1a17" />
          <circle cx="86" cy="12" r="5" fill="#0f1a17" />
          <line
            v-for="(s, i) in streets"
            :key="i"
            :x1="s.x1"
            :y1="s.y1"
            :x2="s.x2"
            :y2="s.y2"
            stroke="#1c252b"
            :stroke-width="s.w"
          />
          <g v-for="c in cafes" :key="c.id" class="pin" :class="{ on: c.id === selected }" :transform="`translate(${c.x} ${c.y * 0.7})`">
            <circle class="pin__pulse" r="4" />
            <circle class="pin__dot" r="1.6" />
            <text class="pin__label" y="-3.2" text-anchor="middle">{{ c.street }}</text>
          </g>
        </svg>
        <div class="map__pins">
          <button
            v-for="c in cafes"
            :key="c.id"
            type="button"
            class="map__hit"
            :style="{ left: c.x + '%', top: c.y + '%' }"
            :aria-label="`Выбрать ${c.street}`"
            :aria-pressed="c.id === selected"
            @click="selected = c.id"
          ></button>
        </div>
        <p class="map__note">Схема условная, адреса демонстрационные</p>
      </div>

      <div class="side">
        <label class="toggle">
          <input v-model="onlyOpen" type="checkbox" />
          <span class="toggle__ui" aria-hidden="true"></span>
          Только открытые сейчас
        </label>

        <ul class="list">
          <li v-for="c in list" :id="c.id" :key="c.id">
            <button type="button" class="item" :aria-pressed="c.id === selected" @click="selected = c.id">
              <span class="item__street display">{{ c.street }}</span>
              <span class="item__note">{{ c.note }}</span>
              <span class="item__state" :class="{ open: openState(c).open }">{{ openState(c).label }}</span>
            </button>
          </li>
          <li v-if="!list.length" class="list__empty">Сейчас все кофейни закрыты. Самая ранняя открывается в 7:00.</li>
        </ul>

        <article class="detail" aria-live="polite">
          <p class="eyebrow">Выбрано</p>
          <h2 class="detail__name display">{{ current.name }}</h2>
          <p class="detail__row">{{ current.street }}</p>
          <p class="detail__row detail__muted">{{ hoursText(current) }}</p>
          <p class="detail__row">Ожидание заказа сейчас: около {{ current.wait }} мин</p>
          <ul class="detail__tags">
            <li v-for="f in current.features" :key="f">{{ f }}</li>
          </ul>
          <RouterLink :to="{ path: '/order', query: { cafe: current.id } }" class="btn detail__btn">Заказать сюда</RouterLink>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.addr__hero {
  padding-top: calc(var(--header-h) + 80px);
}

.addr__title {
  margin: 16px 0 20px;
  max-width: 14ch;
  font-size: clamp(38px, 7vw, 96px);
}

.addr__lead {
  max-width: 56ch;
  margin: 0;
  color: var(--muted);
}

.addr__body {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 28px;
  margin-top: 56px;
  align-items: start;
}

.map {
  position: sticky;
  top: calc(var(--header-h) + 20px);
  aspect-ratio: 10 / 7;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.map svg {
  width: 100%;
  height: 100%;
}

.pin__pulse {
  fill: rgba(102, 212, 190, 0.18);
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
}

.pin__dot {
  fill: var(--muted);
  transition: fill 0.3s;
}

.pin__label {
  font-family: var(--font-body);
  font-size: 2.2px;
  fill: var(--muted);
  opacity: 0;
  transition: opacity 0.3s;
}

.pin.on .pin__dot {
  fill: var(--mint);
}

.pin.on .pin__label {
  opacity: 1;
  fill: var(--pale);
}

.pin.on .pin__pulse {
  opacity: 1;
  animation: ping 2.4s var(--ease) infinite;
}

@keyframes ping {
  from { transform: scale(0.4); opacity: 0.9; }
  to { transform: scale(2.2); opacity: 0; }
}

.map__pins {
  position: absolute;
  inset: 0;
}

.map__hit {
  position: absolute;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.map__note {
  position: absolute;
  left: 16px;
  bottom: 12px;
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  cursor: pointer;
  width: fit-content;
}

.toggle input {
  position: absolute;
  opacity: 0;
}

.toggle__ui {
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: var(--ink-3);
  border: 1px solid var(--line);
  position: relative;
  transition: background 0.2s;
}

.toggle__ui::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--muted);
  transition: transform 0.2s, background 0.2s;
}

.toggle input:checked + .toggle__ui {
  background: var(--deep);
}

.toggle input:checked + .toggle__ui::after {
  transform: translateX(20px);
  background: var(--mint);
}

.toggle input:focus-visible + .toggle__ui {
  outline: 2px solid var(--mint);
  outline-offset: 3px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list li {
  scroll-margin-top: calc(var(--header-h) + 20px);
}

.list__empty {
  color: var(--muted);
}

.item {
  width: 100%;
  display: grid;
  gap: 4px;
  padding: 16px 18px;
  text-align: left;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: var(--ink-2);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

@media (hover: hover) {
  .item:hover {
    border-color: var(--deep);
  }
}

.item[aria-pressed='true'] {
  border-color: var(--mint);
  background: rgba(102, 212, 190, 0.07);
}

.item__street {
  font-size: 17px;
}

.item__note {
  color: var(--muted);
  font-size: 14px;
}

.item__state {
  font-size: 13px;
  color: var(--muted);
}

.item__state.open {
  color: var(--mint);
}

.detail {
  padding: 26px;
  border-radius: 22px;
  border: 1px solid var(--deep);
  background: var(--ink-3);
}

.detail__name {
  margin: 10px 0 14px;
  font-size: 26px;
}

.detail__row {
  margin: 0 0 6px;
}

.detail__muted {
  color: var(--muted);
}

.detail__tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  margin: 16px 0 22px;
}

.detail__tags li {
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 13px;
  color: var(--pale);
}

.detail__btn {
  width: 100%;
}

@media (max-width: 900px) {
  .addr__body {
    grid-template-columns: 1fr;
  }
  .map {
    position: relative;
    top: 0;
  }
}
</style>
