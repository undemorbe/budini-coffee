<script setup>
// Поднос: плавающая кнопка со счётчиком и шторка со списком. Оформление пока демо,
// как и «Будильник»: заказ никуда не отправляется.
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { modifiers } from '../data/menu'
import { swatch } from './cup/drinkLook'
import { useTray } from '../composables/useTray'

const { lines, count, total, setQty, clear, target, bump, incoming } = useTray()

const btn = ref(null)
watch(btn, (el) => (target.value = el), { immediate: true })
onBeforeUnmount(() => {
  if (target.value === btn.value) target.value = null
})

// кнопка подпрыгивает, когда на поднос прилетает позиция
const bumping = ref(false)
watch(bump, async () => {
  bumping.value = false
  await nextTick()
  requestAnimationFrame(() => (bumping.value = true))
})

const open = ref(false)
const done = ref(false)
watch(open, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (!v) done.value = false
})
watch(count, (n) => {
  if (!n) open.value = false
})
const onKey = (e) => {
  if (e.key === 'Escape') open.value = false
}
watch(open, (v) => (v ? document.addEventListener('keydown', onKey) : document.removeEventListener('keydown', onKey)))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  if (open.value) document.documentElement.style.overflow = ''
})

const mini = (l) => {
  const s = swatch(l.item, l.config, modifiers)
  const stops = s.syrups.map((c, i) => `${c} ${i * 9}% ${(i + 1) * 9}%`)
  return l.item.unit === 'ml'
    ? { background: `linear-gradient(to top, ${[...stops, `${s.body} ${s.syrups.length * 9}% 72%`, `${s.top} 100%`].join(', ')})` }
    : null
}

const finish = () => {
  done.value = true
}
const restart = () => {
  clear()
  open.value = false
}
</script>

<template>
  <Transition name="tray">
    <button v-show="count || incoming" ref="btn" type="button" class="tray" :class="{ bump: bumping }" :aria-label="`Поднос: ${count}, ${total} ₽`" @click="open = true" @animationend="bumping = false">
      <span class="tray__icon" aria-hidden="true">
        <svg viewBox="0 0 32 32"><path d="M4 22h24M6 22c0-6 4.5-10 10-10s10 4 10 10M16 12V9m-3 0h6" /></svg>
        <span class="tray__n">{{ count }}</span>
      </span>
      <span class="tray__label">Поднос</span>
      <span class="tray__sum">{{ total }} ₽</span>
    </button>
  </Transition>

  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drw" role="dialog" aria-modal="true" aria-labelledby="drw-title">
        <div class="drw__backdrop" @click="open = false"></div>
        <section class="drw__panel">
          <header class="drw__head">
            <h2 id="drw-title" class="display">Поднос</h2>
            <button type="button" class="drw__close" aria-label="Закрыть поднос" @click="open = false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </header>

          <TransitionGroup v-if="!done" name="line" tag="ul" class="drw__list">
            <li v-for="l in lines" :key="l.key" class="line">
              <span class="line__cup" :class="{ 'line__cup--pcs': l.item.unit !== 'ml' }" :style="mini(l)" aria-hidden="true">{{ l.item.unit !== 'ml' ? l.item.emoji || '🥐' : '' }}</span>
              <div class="line__text">
                <p class="line__name">{{ l.item.name }}</p>
                <p v-if="l.details" class="line__det">{{ l.details }}</p>
              </div>
              <div class="line__qty" role="group" :aria-label="`Количество: ${l.item.name}`">
                <button type="button" :aria-label="l.config.qty > 1 ? 'Меньше' : 'Убрать'" @click="setQty(l.key, l.config.qty - 1)">{{ l.config.qty > 1 ? '−' : '×' }}</button>
                <span>{{ l.config.qty }}</span>
                <button type="button" aria-label="Больше" @click="setQty(l.key, l.config.qty + 1)">+</button>
              </div>
              <p class="line__sum">{{ l.total }} ₽</p>
            </li>
          </TransitionGroup>

          <div v-else class="drw__done">
            <p class="display neon">Почти готово</p>
            <p>Это демо: онлайн-заказ появится в рабочей версии сайта, поднос никуда не отправлен. Цены на молоко и сиропы примерные.</p>
          </div>

          <footer class="drw__foot">
            <p class="drw__total"><span>Итого</span><strong>{{ total }} ₽</strong></p>
            <button v-if="!done" type="button" class="btn drw__go" @click="finish">Оформить</button>
            <button v-else type="button" class="btn btn--ghost drw__go" @click="restart">Очистить поднос</button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tray {
  position: fixed;
  right: max(var(--gutter), env(safe-area-inset-right, 0px));
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 8px 22px 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--mint);
  background: rgba(7, 9, 12, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: 0 0 0 4px rgba(102, 212, 190, 0.08), 0 18px 50px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: transform 0.5s var(--ease), border-color 0.3s;
}

@media (hover: hover) {
  .tray:hover {
    transform: translateY(-2px);
  }
}

.tray__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--mint);
}

.tray__icon svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.2;
  stroke-linecap: round;
}

.tray__n {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: var(--text);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  line-height: 22px;
}

.tray__label {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.tray__sum {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--mint);
  font-variant-numeric: tabular-nums;
}

.bump {
  animation: bump 0.6s var(--ease);
}

.bump .tray__icon {
  animation: catch 0.6s var(--ease);
}

@keyframes bump {
  30% {
    transform: scale(1.08, 0.92);
  }
  60% {
    transform: scale(0.97, 1.04);
  }
}

@keyframes catch {
  30% {
    transform: translateY(4px);
    box-shadow: 0 0 0 10px rgba(102, 212, 190, 0.25);
  }
}

.tray-enter-active {
  transition: transform 0.7s var(--ease), opacity 0.4s;
}

.tray-leave-active {
  transition: transform 0.35s var(--ease-io), opacity 0.3s;
}

.tray-enter-from,
.tray-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.8);
}

/* ---- шторка ---- */
.drw {
  position: fixed;
  inset: 0;
  z-index: 150;
}

.drw__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(3, 5, 7, 0.7);
  backdrop-filter: blur(6px);
}

.drw__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(460px, 100%);
  background: var(--ink-2);
  border-left: 1px solid var(--line);
}

.drw__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(20px + env(safe-area-inset-top, 0px)) 24px 16px;
  border-bottom: 1px solid var(--line);
}

.drw__head h2 {
  margin: 0;
  font-size: 28px;
}

.drw__close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: none;
  cursor: pointer;
}

.drw__close svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.drw__list {
  position: relative;
  flex: 1;
  margin: 0;
  padding: 8px 24px;
  list-style: none;
  overflow-y: auto;
}

.line {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  grid-template-areas: 'cup text sum' 'cup qty qty';
  gap: 6px 14px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px dashed var(--line);
}

/* миниатюрный стакан с цветом напитка и слоями сиропов */
.line__cup {
  grid-area: cup;
  align-self: start;
  width: 34px;
  height: 46px;
  clip-path: polygon(0 0, 100% 0, 86% 100%, 14% 100%);
  border-radius: 4px;
  box-shadow: inset 0 6px 0 rgba(232, 243, 241, 0.85);
}

.line__cup--pcs {
  display: grid;
  place-items: center;
  clip-path: none;
  box-shadow: none;
  font-size: 26px;
}

.line__text {
  grid-area: text;
  min-width: 0;
}

.line__name {
  margin: 0;
  font-weight: 600;
  line-height: 1.25;
}

.line__det {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.line__qty {
  grid-area: qty;
  display: inline-flex;
  align-items: center;
  justify-self: start;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.line__qty button {
  width: 40px;
  height: 36px;
  border: 0;
  background: none;
  font-size: 17px;
  cursor: pointer;
}

.line__qty span {
  min-width: 18px;
  text-align: center;
  font-weight: 700;
}

.line__sum {
  grid-area: sum;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--mint);
  white-space: nowrap;
}

.line-enter-active,
.line-leave-active {
  transition: opacity 0.4s var(--ease), transform 0.5s var(--ease);
}

.line-leave-active {
  position: absolute;
  left: 24px;
  right: 24px;
}

.line-enter-from,
.line-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

.line-move {
  transition: transform 0.5s var(--ease);
}

.drw__done {
  flex: 1;
  padding: 32px 24px;
  color: var(--muted);
}

.drw__done .display {
  margin: 0 0 14px;
  font-size: 28px;
}

.drw__foot {
  padding: 18px 24px calc(18px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--line);
}

.drw__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0 0 14px;
  color: var(--muted);
}

.drw__total strong {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--text);
}

.drw__go {
  width: 100%;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.45s var(--ease);
}

.drawer-enter-active .drw__panel,
.drawer-leave-active .drw__panel {
  transition: transform 0.6s var(--ease);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drw__panel,
.drawer-leave-to .drw__panel {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .tray {
    left: var(--gutter);
    right: var(--gutter);
    justify-content: flex-start;
  }

  .tray__sum {
    margin-left: auto;
  }

  .drw__panel {
    top: auto;
    width: 100%;
    max-height: 85svh;
    border-left: 0;
    border-top: 1px solid var(--line);
    border-radius: 24px 24px 0 0;
  }

  .drawer-enter-from .drw__panel,
  .drawer-leave-to .drw__panel {
    transform: translateY(100%);
  }
}
</style>
