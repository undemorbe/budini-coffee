<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandMark from './BrandMark.vue'
import { contacts, extraNav, mainNav } from '../data/site'

const route = useRoute()
const solid = ref(false)
const open = ref(false)

const onScroll = () => {
  solid.value = window.scrollY > 40
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
watch(open, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : ''
})

const links = mainNav
const allLinks = [{ to: '/', label: 'Главная' }, ...mainNav, ...extraNav]
</script>

<template>
  <a class="skip" href="#main">К содержимому</a>
  <header class="hdr" :class="{ 'hdr--solid': solid || open }">
    <div class="hdr__in wrap">
      <RouterLink to="/" class="hdr__brand" aria-label="Будини Кофе, на главную">
        <BrandMark compact />
      </RouterLink>

      <nav class="hdr__nav" aria-label="Основное меню">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="hdr__link">{{ l.label }}</RouterLink>
      </nav>

      <div class="hdr__side">
        <span class="hdr__hours"><span class="dot" aria-hidden="true"></span>{{ contacts.hours }}</span>
        <RouterLink to="/order" class="btn hdr__cta">Заказать</RouterLink>
        <button
          class="hdr__burger"
          type="button"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          @click="open = !open"
        >
          <span class="sr-only">{{ open ? 'Закрыть меню' : 'Открыть меню' }}</span>
          <span class="bar" aria-hidden="true"></span>
          <span class="bar" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <Transition name="drop">
      <nav v-if="open" id="mobile-nav" class="mnav" aria-label="Мобильное меню">
        <RouterLink v-for="(l, i) in allLinks" :key="l.to" :to="l.to" class="mnav__link display" :style="{ '--d': i * 0.04 + 's' }">
          <span class="mnav__num">{{ String(i + 1).padStart(2, '0') }}</span>{{ l.label }}
        </RouterLink>
        <RouterLink to="/order" class="btn mnav__cta">Заказать кофе</RouterLink>
        <p class="mnav__note">{{ contacts.hours }}</p>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.skip {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 200;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--mint);
  color: var(--ink);
  font-weight: 600;
  transform: translateY(-150%);
  transition: transform 0.2s;
}

.skip:focus {
  transform: none;
}

.hdr {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  padding-top: env(safe-area-inset-top, 0px);
  /* шапка всегда на сплошном фоне: читается поверх ярких кадров видео */
  background: var(--ink);
  transition: border-color 0.6s var(--ease);
  border-bottom: 1px solid transparent;
}

.hdr--solid {
  border-bottom-color: var(--line);
}

.hdr__in {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 24px;
}

.hdr__nav {
  display: flex;
  gap: 6px;
  margin-left: 24px;
}

.hdr__link {
  position: relative;
  padding: 10px 14px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 0.2s;
}

.hdr__link:hover,
.hdr__link.router-link-exact-active {
  color: var(--mint);
}

.hdr__link.router-link-exact-active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 4px;
  height: 2px;
  border-radius: 2px;
  background: var(--mint);
}

.hdr__side {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 18px;
}

.hdr__hours {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mint);
  animation: pulse 2.6s var(--ease-io) infinite;
}

@keyframes pulse {
  50% { opacity: 0.35; }
}

.hdr__cta {
  min-height: 44px;
  padding: 0 22px;
}

.hdr__burger {
  display: none;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--ink-2);
  cursor: pointer;
  position: relative;
}

.bar {
  position: absolute;
  left: 13px;
  right: 13px;
  height: 2px;
  border-radius: 2px;
  background: var(--mint);
  transition: transform 0.45s var(--ease);
}

.bar:first-of-type {
  top: 17px;
}

.bar:last-of-type {
  top: 25px;
}

.hdr__burger[aria-expanded='true'] .bar:first-of-type {
  transform: translateY(4px) rotate(45deg);
}

.hdr__burger[aria-expanded='true'] .bar:last-of-type {
  transform: translateY(-4px) rotate(-45deg);
}

.mnav {
  position: fixed;
  inset: calc(var(--header-h) + env(safe-area-inset-top, 0px)) 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px var(--gutter) calc(28px + env(safe-area-inset-bottom, 0px));
  background: var(--ink);
  overflow-y: auto;
}

.mnav__link {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font-size: clamp(24px, 7vw, 40px);
  color: var(--text);
  animation: slide 0.8s var(--ease) both;
  animation-delay: var(--d);
}

.mnav__link.router-link-exact-active {
  color: var(--mint);
}

.mnav__num {
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.2em;
}

@keyframes slide {
  from { opacity: 0; transform: translateX(-20px); }
}

.mnav__cta {
  margin-top: auto;
}

.mnav__note {
  margin: 4px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.45s var(--ease);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .hdr__hours {
    display: none;
  }
}

@media (max-width: 900px) {
  .hdr__nav,
  .hdr__hours {
    display: none;
  }
  .hdr__burger {
    display: block;
  }
}

@media (max-width: 420px) {
  .hdr__cta {
    display: none;
  }
}
</style>
