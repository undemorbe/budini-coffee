<script setup>
import { ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'
import { cafes, hoursText } from '../data/cafes'
import { menu } from '../data/menu'
import { allItems } from '../domain/menu/getMenu'
import { brand } from '../data/site'

const root = ref(null)
useReveal(root)

const season = menu.find((c) => c.isSeasonal)
const stats = [
  { v: String(cafes.length), l: 'кофеен в Петербурге и Кудрово' },
  { v: '23:00', l: 'закрываемся каждый день' },
  { v: String(allItems(menu).length), l: 'позиций в меню' },
  season ? { v: String(season.items.length), l: 'осенних новинок' } : { v: String(menu.length), l: 'разделов меню' },
]

// разделы меню (без сезонного, он в цифрах выше)
const path = menu.filter((c) => !c.isSeasonal).slice(0, 4).map((c) => ({
  t: c.title,
  d: c.items.slice(0, 3).map((i) => i.name).join(', ') + (c.items.length > 3 ? ' и другое.' : '.'),
}))

const values = [
  { t: 'Можно с животными', d: 'Приходите с питомцами в любую из наших кофеен.' },
  { t: 'Кофе с собой', d: 'Любой напиток из меню можно взять навынос.' },
  { t: 'Удобная оплата', d: `${brand.payment}.` },
]
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="О нас"
      title="Кофейня, которая"
      accent="будит"
      lead="«Будини Кофе»: пять кофеен в Петербурге и Кудрово. Классика, авторские напитки, бабл ти и выпечка, ежедневно до 23:00."
    />

    <section class="stats wrap" aria-label="Будини в цифрах">
      <div v-for="(s, i) in stats" :key="s.l" class="stat reveal" :style="{ '--d': i * 0.08 + 's' }">
        <p class="stat__v display neon">{{ s.v }}</p>
        <p class="stat__l">{{ s.l }}</p>
      </div>
    </section>

    <section class="band" aria-labelledby="path-title">
      <div class="wrap">
        <h2 id="path-title" class="display sec__title reveal">Что <span class="neon">в меню</span></h2>
        <ol class="path">
          <li v-for="(p, i) in path" :key="p.t" class="path__item reveal" :style="{ '--d': i * 0.1 + 's' }">
            <span class="path__n">0{{ i + 1 }}</span>
            <h3 class="path__t display">{{ p.t }}</h3>
            <p class="path__d">{{ p.d }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="wrap story" aria-labelledby="story-title">
      <h2 id="story-title" class="display sec__title reveal">Где <span class="neon">мы</span></h2>
      <ol class="story__list">
        <li v-for="(c, i) in cafes" :key="c.id" class="story__item reveal">
          <span class="story__y display">0{{ i + 1 }}</span>
          <div>
            <h3 class="story__t">{{ c.address }}</h3>
            <p class="story__d">{{ [c.landmark, hoursText(c)].filter(Boolean).join(' · ') }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="wrap values" aria-labelledby="values-title">
      <h2 id="values-title" class="display sec__title reveal">Гостям <span class="neon">удобно</span></h2>
      <div class="values__grid">
        <article v-for="(v, i) in values" :key="v.t" class="value reveal" :style="{ '--d': i * 0.1 + 's' }">
          <h3 class="value__t">{{ v.t }}</h3>
          <p class="value__d">{{ v.d }}</p>
        </article>
      </div>
      <div class="cta reveal">
        <p class="cta__t display">Заходите в гости</p>
        <RouterLink to="/addresses" class="btn">Адреса кофеен</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 64px;
}

.stat {
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.stat__v {
  margin: 0;
  font-size: clamp(40px, 5vw, 64px);
}

.stat__l {
  margin: 8px 0 0;
  color: var(--muted);
}

.sec__title {
  margin: 0 0 40px;
  font-size: clamp(32px, 5vw, 64px);
}

.band {
  margin-top: 110px;
  padding-block: 90px;
  background: var(--ink-2);
  border-block: 1px solid var(--line);
}

.path {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.path__item {
  padding: 26px;
  border-radius: var(--radius);
  background: var(--ink);
  border: 1px solid var(--line);
}

.path__n {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.2em;
  color: var(--mint);
}

.path__t {
  margin: 14px 0 10px;
  font-size: 22px;
}

.path__d {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

.story,
.values {
  padding-top: 110px;
}

.story__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.story__item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  padding: 28px 0;
  border-bottom: 1px solid var(--line);
}

.story__y {
  font-size: clamp(30px, 4vw, 48px);
  color: var(--mint);
}

.story__t {
  margin: 4px 0 6px;
  font-family: var(--font-display);
  font-size: 18px;
  text-transform: uppercase;
}

.story__d {
  margin: 0;
  color: var(--muted);
  max-width: 60ch;
}

.values__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.value {
  padding: 26px;
  border-left: 3px solid var(--mint);
  background: var(--ink-2);
}

.value__t {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 17px;
  text-transform: uppercase;
}

.value__d {
  margin: 0;
  color: var(--muted);
}

.cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 56px;
  padding: 32px;
  background: var(--mint);
  color: var(--ink);
  border-radius: var(--radius);
}

.cta__t {
  margin: 0;
  font-size: clamp(24px, 3.4vw, 40px);
}

.cta .btn {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--mint);
}

@media (max-width: 960px) {
  .stats,
  .path {
    grid-template-columns: repeat(2, 1fr);
  }
  .values__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stats,
  .path {
    grid-template-columns: 1fr;
  }
  .story__item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
