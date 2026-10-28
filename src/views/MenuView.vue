<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DrinkCard from '../components/DrinkCard.vue'
import { buzzLabel, categories, menu } from '../data/menu'

const filters = ref({ decaf: false, plant: false, cold: false, isNew: false })
const buzz = ref(null) // выбранный уровень бодрости или null
const filterList = [
  { key: 'decaf', label: 'Без кофеина' },
  { key: 'plant', label: 'На растительном молоке' },
  { key: 'cold', label: 'Холодное' },
  { key: 'isNew', label: 'Новинки' },
]

const visible = computed(() =>
  menu.filter((m) => {
    const f = filters.value
    if (f.decaf && m.buzz !== 0) return false
    if (f.plant && !m.plant) return false
    if (f.cold && !m.cold) return false
    if (f.isNew && !m.isNew) return false
    if (buzz.value !== null && m.buzz !== buzz.value) return false
    return true
  }),
)
const groups = computed(() =>
  categories.map((c) => ({ ...c, items: visible.value.filter((m) => m.cat === c.id) })).filter((g) => g.items.length),
)
const anyFilter = computed(() => Object.values(filters.value).some(Boolean) || buzz.value !== null)
const reset = () => {
  filters.value = { decaf: false, plant: false, cold: false, isNew: false }
  buzz.value = null
}

// подсветка активной категории в липкой навигации
const active = ref(categories[0].id)
let io
onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) active.value = e.target.id.replace('cat-', '')
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('.cat').forEach((el) => io.observe(el))
})
onBeforeUnmount(() => io?.disconnect())
const observeAgain = () => {
  if (!io) return
  io.disconnect()
  requestAnimationFrame(() => document.querySelectorAll('.cat').forEach((el) => io.observe(el)))
}
</script>

<template>
  <div class="menu">
    <header class="menu__hero wrap">
      <p class="eyebrow">Меню · цены в рублях</p>
      <h1 class="display menu__title">Что тебя <span class="neon">разбудит</span>?</h1>
      <p class="menu__lead">Шкала «бодрости» у каждого напитка показывает, насколько он крепкий: от «без кофеина» до «будит наверняка». Размер выбирается прямо в карточке.</p>
    </header>

    <div class="bar">
      <div class="bar__in wrap">
        <nav class="tabs" aria-label="Категории меню">
          <a v-for="c in categories" :key="c.id" :href="'#cat-' + c.id" class="tab" :class="{ on: active === c.id }">{{ c.title }}</a>
        </nav>
      </div>
    </div>

    <div class="filters wrap" role="group" aria-label="Фильтры меню">
      <button
        v-for="f in filterList"
        :key="f.key"
        type="button"
        class="chip"
        :aria-pressed="filters[f.key]"
        @click="filters[f.key] = !filters[f.key]; observeAgain()"
      >
        {{ f.label }}
      </button>
      <span class="filters__sep" aria-hidden="true"></span>
      <button
        v-for="(l, i) in buzzLabel"
        :key="l"
        type="button"
        class="chip chip--buzz"
        :aria-pressed="buzz === i"
        @click="buzz = buzz === i ? null : i; observeAgain()"
      >
        <span class="mini" aria-hidden="true"><i v-for="n in 3" :key="n" :class="{ on: n <= i }"></i></span>{{ l }}
      </button>
      <button v-if="anyFilter" type="button" class="filters__reset" @click="reset(); observeAgain()">Сбросить</button>
    </div>

    <p class="wrap menu__count" aria-live="polite">Найдено позиций: {{ visible.length }}</p>

    <div class="wrap">
      <section v-for="g in groups" :id="'cat-' + g.id" :key="g.id" class="cat" :aria-labelledby="'h-' + g.id">
        <h2 :id="'h-' + g.id" class="cat__title display">{{ g.title }} <sup>{{ g.items.length }}</sup></h2>
        <div class="cat__grid">
          <DrinkCard v-for="item in g.items" :key="item.id" :item="item" />
        </div>
      </section>
      <div v-if="!groups.length" class="empty">
        <p class="display">Ничего не нашлось</p>
        <p>Попробуй убрать часть фильтров.</p>
        <button type="button" class="btn btn--ghost" @click="reset(); observeAgain()">Сбросить фильтры</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu__hero {
  padding-top: calc(var(--header-h) + 80px);
}

.menu__title {
  margin: 16px 0 20px;
  font-size: clamp(42px, 8vw, 112px);
}

.menu__lead {
  max-width: 60ch;
  margin: 0;
  color: var(--muted);
}

.bar {
  position: sticky;
  top: calc(var(--header-h) + env(safe-area-inset-top, 0px));
  z-index: 20;
  margin-top: 48px;
  background: rgba(7, 9, 12, 0.88);
  backdrop-filter: blur(12px);
  border-block: 1px solid var(--line);
}

.tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab {
  position: relative;
  padding: 18px 16px;
  white-space: nowrap;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 0.2s;
}

.tab:hover,
.tab.on {
  color: var(--mint);
}

.tab.on::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -1px;
  height: 2px;
  background: var(--mint);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 28px;
}

.filters__sep {
  width: 1px;
  height: 26px;
  margin: 0 8px;
  background: var(--line);
}

.mini {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.mini i {
  width: 3px;
  border-radius: 1px;
  background: currentColor;
  opacity: 0.25;
}

.mini i:nth-child(1) { height: 5px; }
.mini i:nth-child(2) { height: 8px; }
.mini i:nth-child(3) { height: 12px; }
.mini i.on { opacity: 1; }

.filters__reset {
  margin-left: 6px;
  border: 0;
  background: none;
  color: var(--mint);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  min-height: 40px;
}

.menu__count {
  margin-top: 18px;
  font-size: 14px;
  color: var(--muted);
}

.cat {
  padding-top: 56px;
  scroll-margin-top: calc(var(--header-h) + 80px);
}

.cat__title {
  margin: 0 0 24px;
  font-size: clamp(28px, 4vw, 48px);
}

.cat__title sup {
  font-size: 0.4em;
  color: var(--mint);
  vertical-align: top;
}

.cat__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 18px;
}

.empty {
  padding: 80px 0;
  text-align: center;
  color: var(--muted);
}

.empty .display {
  font-size: 32px;
  color: var(--text);
}
</style>
