<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DrinkBuilder from '../components/DrinkBuilder.vue'
import DrinkCard from '../components/DrinkCard.vue'
import TrayBar from '../components/TrayBar.vue'
import { useTray } from '../composables/useTray'
import { menu, modifiers } from '../data/menu'
import { filterMenuByTags, allItems } from '../domain/menu/getMenu'
import { FILTER_TAGS, tagLabel } from '../domain/menu/models'
import { defaultConfig } from '../domain/menu/order'

// выбранные теги: позиция должна подходить под все
const tags = ref([])
const toggleTag = (id) => {
  tags.value = tags.value.includes(id) ? tags.value.filter((t) => t !== id) : [...tags.value, id]
}
const reset = () => {
  tags.value = []
}

const groups = computed(() => filterMenuByTags(menu, tags.value))
const count = computed(() => allItems(groups.value).length)

// ---- липкая навигация по категориям ----
// Вкладки строятся по отфильтрованным группам. Активная — последняя категория, чей верх
// прошёл под панель; лента вкладок докручивается до неё (на телефоне иначе она за краем).
const bar = ref(null)
const tabs = ref(null)
const active = ref(menu[0]?.id)
const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
let lock = 0
let ticking = false

// низ панели, когда она прилипла под шапкой
const stuckBottom = () => parseFloat(getComputedStyle(bar.value).top) + bar.value.offsetHeight

function syncActive() {
  ticking = false
  if (!bar.value || performance.now() < lock) return
  const line = stuckBottom() + 32
  let id = groups.value[0]?.id
  for (const g of groups.value) {
    const el = document.getElementById('cat-' + g.id)
    if (el && el.getBoundingClientRect().top <= line) id = g.id
  }
  active.value = id
}
const onScroll = () => {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(syncActive)
  }
}
const onScrollEnd = () => {
  lock = 0
  syncActive()
}

function go(id) {
  const el = document.getElementById('cat-' + id)
  if (!el) return
  active.value = id
  // пока страница едет к категории, вкладка не перебирает промежуточные
  lock = performance.now() + 1200
  const top = el.getBoundingClientRect().top + window.scrollY - stuckBottom() + 8
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  history.replaceState(history.state, '', '#cat-' + id)
}

watch(active, async (id) => {
  await nextTick()
  const strip = tabs.value
  const tab = strip?.querySelector(`[data-cat="${id}"]`)
  if (!tab) return
  strip.scrollTo({ left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
})

watch(groups, async () => {
  await nextTick()
  syncActive()
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('scrollend', onScrollEnd)
  syncActive()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('scrollend', onScrollEnd)
})

// ---- заказ ----
// напиток открывает конструктор, выпечка и десерты сразу летят на поднос
const tray = useTray()
const building = ref(null)
function order({ item, volumeIndex, el }) {
  if (item.unit === 'ml') {
    building.value = { item, volumeIndex }
    return
  }
  const chip = document.createElement('div')
  chip.textContent = item.emoji || '+1'
  chip.style.cssText = 'display:grid;place-items:center;border-radius:50%;background:#66d4be;color:#07090c;font:700 15px Unbounded,sans-serif;box-shadow:0 0 24px rgba(102,212,190,.6)'
  tray.fly(chip, el.getBoundingClientRect()).then(() => tray.add(item, defaultConfig(item, modifiers)))
}
</script>

<template>
  <div class="menu">
    <header class="menu__hero wrap">
      <p class="eyebrow">Меню · цены в рублях</p>
      <h1 class="display menu__title">Что тебя <span class="neon">разбудит</span>?</h1>
      <p class="menu__lead">Классика, авторские напитки, бабл ти и выпечка. Жми «+» на карточке, чтобы собрать напиток: размер, молоко и сиропы. Теги помогут найти вкус под настроение.</p>
    </header>

    <div ref="bar" class="bar">
      <div class="bar__in wrap">
        <nav ref="tabs" class="tabs" aria-label="Категории меню">
          <a
            v-for="c in groups"
            :key="c.id"
            :href="'#cat-' + c.id"
            :data-cat="c.id"
            class="tab"
            :class="{ on: active === c.id, 'tab--season': c.isSeasonal }"
            :aria-current="active === c.id ? 'location' : undefined"
            @click.prevent="go(c.id)"
          >
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
          <DrinkCard v-for="item in g.items" :key="item.id" :item="item" orderable @order="order" />
        </div>
        <p v-if="g.promo" class="promo__foot">{{ g.promo.footer }}</p>
      </section>
      <div v-if="!groups.length" class="empty">
        <p class="display">Ничего не нашлось</p>
        <p>Попробуй убрать часть тегов.</p>
        <button type="button" class="btn btn--ghost" @click="reset">Сбросить фильтр</button>
      </div>
    </div>

    <TrayBar />
    <Teleport to="body">
      <Transition name="sheet">
        <DrinkBuilder v-if="building" :key="building.item.id" :item="building.item" :volume-index="building.volumeIndex" @close="building = null" />
      </Transition>
    </Teleport>
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

.tab::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -1px;
  height: 2px;
  background: var(--mint);
  transform: scaleX(0);
  transition: transform 0.45s var(--ease);
}

.tab.on::after {
  transform: scaleX(1);
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

.menu {
  padding-bottom: 120px; /* место под кнопку подноса */
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
