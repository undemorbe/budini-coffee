<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DrinkCard from '../components/DrinkCard.vue'
import { menu } from '../data/menu'
import { filterMenuByTags, allItems } from '../domain/menu/getMenu'
import { FILTER_TAGS, tagLabel } from '../domain/menu/models'

// выбранные теги: позиция должна подходить под все
const tags = ref([])
const toggleTag = (id) => {
  tags.value = tags.value.includes(id) ? tags.value.filter((t) => t !== id) : [...tags.value, id]
  observeAgain()
}
const reset = () => {
  tags.value = []
  observeAgain()
}

const groups = computed(() => filterMenuByTags(menu, tags.value))
const count = computed(() => allItems(groups.value).length)

// подсветка активной категории в липкой навигации
const active = ref(menu[0]?.id)
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
function observeAgain() {
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
      <p class="menu__lead">Классика, авторские напитки, бабл ти и выпечка. Объём выбирается прямо в карточке, а теги помогут найти напиток под настроение.</p>
    </header>

    <div class="bar">
      <div class="bar__in wrap">
        <nav class="tabs" aria-label="Категории меню">
          <a v-for="c in menu" :key="c.id" :href="'#cat-' + c.id" class="tab" :class="{ on: active === c.id, 'tab--season': c.isSeasonal }">
            {{ c.emoji ? `${c.title} ${c.emoji}` : c.title }}
          </a>
        </nav>
      </div>
    </div>

    <div class="filters wrap" role="group" aria-label="Фильтр по вкусу">
      <button v-for="t in FILTER_TAGS" :key="t" type="button" class="chip" :aria-pressed="tags.includes(t)" @click="toggleTag(t)">
        {{ tagLabel(t) }}
      </button>
      <button v-if="tags.length" type="button" class="filters__reset" @click="reset">Сбросить</button>
    </div>

    <p class="wrap menu__count" aria-live="polite">Найдено позиций: {{ count }}</p>

    <div class="wrap">
      <section v-for="g in groups" :id="'cat-' + g.id" :key="g.id" class="cat" :class="{ 'cat--season': g.isSeasonal }" :aria-labelledby="'h-' + g.id">
        <div v-if="g.promo" class="promo">
          <p class="promo__badge">{{ g.badge }}</p>
          <h2 :id="'h-' + g.id" class="promo__title display">{{ g.promo.title }}</h2>
          <p class="promo__text">{{ g.promo.text }}</p>
          <p class="promo__q">{{ g.promo.question }}</p>
        </div>
        <h2 v-else :id="'h-' + g.id" class="cat__title display">
          {{ g.title }} <sup>{{ g.items.length }}</sup>
        </h2>
        <p v-if="g.note" class="cat__note">{{ g.note }}</p>
        <div class="cat__grid">
          <DrinkCard v-for="item in g.items" :key="item.id" :item="item" />
        </div>
        <p v-if="g.promo" class="promo__foot">{{ g.promo.footer }}</p>
      </section>
      <div v-if="!groups.length" class="empty">
        <p class="display">Ничего не нашлось</p>
        <p>Попробуй убрать часть тегов.</p>
        <button type="button" class="btn btn--ghost" @click="reset">Сбросить фильтр</button>
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

.cat__note {
  margin: -12px 0 20px;
  color: var(--muted);
}

/* осеннее меню: сплошной блок без градиентов, как остальные плашки сайта */
.cat--season {
  padding-top: 40px;
}

.promo {
  margin-bottom: 24px;
  padding: clamp(22px, 4vw, 44px);
  border-radius: 26px;
  background: var(--ink-2);
  border: 1px solid var(--deep);
  border-left: 3px solid var(--mint);
}

.promo__badge {
  display: inline-block;
  margin: 0 0 16px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--mint);
  color: var(--ink);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.promo__title {
  margin: 0 0 16px;
  font-size: clamp(28px, 4.6vw, 56px);
  line-height: 1.02;
}

.promo__text {
  max-width: 62ch;
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 17px;
}

.promo__q {
  margin: 0;
  font-weight: 600;
  color: var(--mint);
}

.promo__foot {
  margin: 22px 0 0;
  color: var(--muted);
}

.tab--season {
  color: var(--mint);
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
