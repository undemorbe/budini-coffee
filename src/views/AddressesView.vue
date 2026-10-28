<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { cafes, hoursText, openState } from '../data/cafes'
import { brand } from '../data/site'

const route = useRoute()
const selected = ref(cafes[0].id)
const current = computed(() => cafes.find((c) => c.id === selected.value))
const onlyOpen = ref(false)
const list = computed(() => (onlyOpen.value ? cafes.filter((c) => openState(c).open) : cafes))

onMounted(() => {
  const h = route.hash.replace('#', '')
  if (cafes.some((c) => c.id === h)) selected.value = h
})
</script>

<template>
  <div class="addr">
    <header class="addr__hero wrap">
      <p class="eyebrow">Адреса</p>
      <h1 class="display addr__title">{{ cafes.length }} кофеен, где тебя <span class="neon">разбудят</span></h1>
      <p class="addr__lead">Санкт-Петербург и Кудрово. Выбери кофейню в списке: покажем её на карте, часы работы и как добраться.</p>
    </header>

    <div class="addr__body wrap">
      <div class="map">
        <!-- Карта Яндекса с карточкой выбранной кофейни; без ключа API, по id организации -->
        <iframe
          :key="current.id"
          class="map__frame"
          :src="current.mapUrl"
          :title="`Карта: Будини Кофе, ${current.address}`"
          loading="lazy"
          allowfullscreen
        ></iframe>
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
              <span class="item__note">{{ c.landmark || c.city }}</span>
              <span class="item__state" :class="{ open: openState(c).open }">{{ openState(c).label }}</span>
            </button>
          </li>
          <li v-if="!list.length" class="list__empty">Сейчас все кофейни закрыты. Самые ранние открываются в 07:30.</li>
        </ul>

        <article class="detail" aria-live="polite">
          <p class="eyebrow">Выбрано</p>
          <h2 class="detail__name display">{{ current.street }}</h2>
          <p class="detail__row">{{ current.address }}</p>
          <p v-if="current.landmark" class="detail__row">{{ current.landmark }}</p>
          <p v-if="current.entrance" class="detail__row">{{ current.entrance }}</p>
          <p class="detail__row detail__muted">{{ hoursText(current) }}</p>
          <ul class="detail__tags">
            <li v-for="f in brand.amenities" :key="f">{{ f }}</li>
          </ul>
          <div class="detail__actions">
            <a :href="current.yandexUrl" target="_blank" rel="noopener" class="btn detail__btn">Как добраться</a>
            <RouterLink :to="{ path: '/order', query: { cafe: current.id } }" class="btn btn--ghost detail__btn">Заказать сюда</RouterLink>
          </div>
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

.map__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--ink-2);
}

.detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  flex: 1 1 160px;
}

@media (max-width: 900px) {
  .addr__body {
    grid-template-columns: 1fr;
  }
  .map {
    position: relative;
    top: 0;
    aspect-ratio: 4 / 5; /* карточке организации в виджете нужна высота */
    max-height: 70svh;
    width: 100%;
  }
}
</style>
