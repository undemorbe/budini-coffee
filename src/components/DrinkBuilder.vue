<script setup>
// «Барная стойка»: конструктор напитка. Слева живой стакан, справа размер, молоко и сиропы.
// «На поднос» надевает крышку, и стакан улетает к кнопке подноса.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DrinkCup from './cup/DrinkCup.vue'
import { drinkLook } from './cup/drinkLook'
import { modifiers } from '../data/menu'
import { defaultConfig, findMilk, milkOptions, syrupOptions, toggleSyrup, unitPrice } from '../domain/menu/order'
import { useTray } from '../composables/useTray'

const props = defineProps({
  item: { type: Object, required: true },
  volumeIndex: { type: Number, default: null },
})
const emit = defineEmits(['close'])
const tray = useTray()

const config = ref(defaultConfig(props.item, modifiers, props.volumeIndex))
const milks = computed(() => milkOptions(props.item, modifiers))
const syrups = computed(() => syrupOptions(props.item, modifiers))
const limit = modifiers.syrupLimit
const look = computed(() => drinkLook(props.item, config.value, modifiers))
const unit = computed(() => unitPrice(props.item, config.value, modifiers))
const total = computed(() => unit.value * config.value.qty)

// номера шагов идут подряд, даже если молоко не выбирается
const steps = computed(() => ['size', milks.value.length && 'milk', syrups.value.length && 'syrup'].filter(Boolean))
const num = (id) => String(steps.value.indexOf(id) + 1).padStart(2, '0')

// подпись под стаканом: что сейчас делает бариста
const say = ref(props.item.milk === 'base' ? 'Наливаем основу и молоко…' : 'Наливаем основу…')
let sayTimer = 0
function narrate(text, then = 'Собирай дальше или ставь на поднос') {
  say.value = text
  clearTimeout(sayTimer)
  sayTimer = setTimeout(() => (say.value = then), 2200)
}
onMounted(() => narrate(say.value, 'Готово. Выбирай размер и добавки'))

const pickVolume = (i) => {
  if (config.value.volumeIndex === i) return
  const grow = i > config.value.volumeIndex
  config.value.volumeIndex = i
  narrate(grow ? `Стакан побольше: ${props.item.volumes[i].label}` : `Стакан поменьше: ${props.item.volumes[i].label}`)
}

const pickMilk = (id) => {
  if (config.value.milk === id) return
  config.value.milk = id
  const m = findMilk(modifiers, id)
  narrate(id === 'none' ? 'Без молока: чистый вкус' : `Доливаем ${m.name.toLowerCase()} молоко`)
}

const shake = ref(null)
const pickSyrup = (s) => {
  const on = config.value.syrups.includes(s.id)
  if (!on && config.value.syrups.length >= limit) {
    shake.value = s.id
    setTimeout(() => (shake.value = null), 450)
    narrate(`Не больше ${limit} сиропов, иначе вкусы спорят`)
    return
  }
  config.value.syrups = toggleSyrup(config.value.syrups, s.id, limit)
  narrate(on ? `Убираем «${s.name}»` : `Капаем сироп «${s.name}»`)
}

const qty = (d) => {
  config.value.qty = Math.min(10, Math.max(1, config.value.qty + d))
}

// цена докручивается до нового значения
const shown = ref(total.value)
let priceRaf = 0
watch(total, (to) => {
  cancelAnimationFrame(priceRaf)
  const from = shown.value
  const t0 = performance.now()
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / 380)
    shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))
    if (p < 1) priceRaf = requestAnimationFrame(tick)
  }
  priceRaf = requestAnimationFrame(tick)
})

// ---- на поднос ----
const cup = ref(null)
const busy = ref(false)
async function addToTray() {
  if (busy.value) return
  busy.value = true
  narrate('Закрываем крышку…', 'Закрываем крышку…')
  await cup.value.seal()
  narrate('Летит на поднос!')
  // снимок стакана летит, а конструктор закрывается
  const src = cup.value.canvas
  const rect = src.getBoundingClientRect()
  const copy = document.createElement('canvas')
  copy.width = src.width
  copy.height = src.height
  copy.getContext('2d').drawImage(src, 0, 0)
  const item = props.item
  const cfg = { ...config.value, syrups: [...config.value.syrups] }
  emit('close')
  await tray.fly(copy, rect)
  tray.add(item, cfg)
}

// ---- диалог: фокус, Esc, прокрутка страницы ----
const panel = ref(null)
const closeBtn = ref(null)
let returnFocus = null
function onKey(e) {
  if (e.key === 'Escape' && !busy.value) emit('close')
  if (e.key !== 'Tab') return
  const f = [...panel.value.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
  if (!f.length) return
  const first = f[0]
  const lastEl = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    lastEl.focus()
  } else if (!e.shiftKey && document.activeElement === lastEl) {
    e.preventDefault()
    first.focus()
  }
}
onMounted(async () => {
  returnFocus = document.activeElement
  document.documentElement.style.overflow = 'hidden'
  document.addEventListener('keydown', onKey)
  await nextTick()
  closeBtn.value?.focus({ preventScroll: true })
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  document.removeEventListener('keydown', onKey)
  clearTimeout(sayTimer)
  cancelAnimationFrame(priceRaf)
  returnFocus?.focus?.({ preventScroll: true })
})
</script>

<template>
  <div class="bld" role="dialog" aria-modal="true" aria-labelledby="bld-title">
    <div class="bld__backdrop" @click="!busy && emit('close')"></div>
    <div ref="panel" class="bld__panel">
      <button ref="closeBtn" type="button" class="bld__close" aria-label="Закрыть конструктор" :disabled="busy" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>

      <div class="bld__stage">
        <div class="bld__cup">
          <DrinkCup ref="cup" v-bind="look" />
        </div>
        <p class="bld__say" aria-live="polite"><span class="bld__dot" aria-hidden="true"></span>{{ say }}</p>
      </div>

      <div class="bld__side">
        <div class="bld__scroll">
          <p class="eyebrow">Барная стойка</p>
          <h2 id="bld-title" class="bld__title display">{{ item.name }}</h2>
          <p v-if="item.description" class="bld__desc">{{ item.description }}</p>

          <fieldset v-if="item.volumes.length" class="step">
            <legend><span>{{ num('size') }}</span> Размер</legend>
            <div class="opts opts--size">
              <button v-for="(v, i) in item.volumes" :key="v.ml" type="button" class="opt opt--size" :aria-pressed="config.volumeIndex === i" @click="pickVolume(i)">
                <svg class="opt__cup" viewBox="0 0 24 32" aria-hidden="true" :style="{ '--s': 0.62 + (item.volumes.length > 1 ? i / (item.volumes.length - 1) : 0.5) * 0.38 }">
                  <path d="M3 4h18l-2.4 25a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8z" />
                </svg>
                <span class="opt__main">{{ v.ml }} <small>мл</small></span>
                <span class="opt__price">{{ v.price }} ₽</span>
              </button>
            </div>
          </fieldset>

          <fieldset v-if="milks.length" class="step">
            <legend><span>{{ num('milk') }}</span> Молоко</legend>
            <div class="opts">
              <button v-for="m in milks" :key="m.id" type="button" class="opt opt--chip" :aria-pressed="config.milk === m.id" @click="pickMilk(m.id)">
                <span class="swatch" :class="{ 'swatch--none': !m.color }" :style="m.color ? { background: m.color } : null" aria-hidden="true"></span>
                {{ m.name }}
                <small v-if="m.price" class="opt__add">+{{ m.price }} ₽</small>
              </button>
            </div>
          </fieldset>

          <fieldset v-if="syrups.length" class="step">
            <legend>
              <span>{{ num('syrup') }}</span> Сироп
              <em class="step__count" :class="{ full: config.syrups.length >= limit }">{{ config.syrups.length }} из {{ limit }}</em>
            </legend>
            <div class="opts opts--syrup">
              <button
                v-for="s in syrups"
                :key="s.id"
                type="button"
                class="opt opt--syrup"
                :class="{ shake: shake === s.id }"
                :aria-pressed="config.syrups.includes(s.id)"
                :aria-disabled="!config.syrups.includes(s.id) && config.syrups.length >= limit"
                @click="pickSyrup(s)"
              >
                <svg class="drop" viewBox="0 0 16 22" aria-hidden="true"><path :fill="s.color" d="M8 1C8 1 1 10 1 14a7 7 0 0 0 14 0C15 10 8 1 8 1z" /></svg>
                <span class="opt__name">{{ s.name }}</span>
                <small class="opt__add">+{{ s.price }} ₽</small>
              </button>
            </div>
          </fieldset>
        </div>

        <div class="bld__foot">
          <div class="qty" role="group" aria-label="Количество">
            <button type="button" class="qty__b" aria-label="Меньше" :disabled="config.qty <= 1" @click="qty(-1)">−</button>
            <span class="qty__n" aria-live="polite">{{ config.qty }}</span>
            <button type="button" class="qty__b" aria-label="Больше" :disabled="config.qty >= 10" @click="qty(1)">+</button>
          </div>
          <button type="button" class="btn bld__add" :disabled="busy" @click="addToTray">
            На поднос <span class="bld__sum">{{ shown }} ₽</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bld {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: grid;
  place-items: center;
  padding: 24px;
}

.bld__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(3, 5, 7, 0.74);
  backdrop-filter: blur(8px);
}

.bld__panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  width: min(1060px, 100%);
  height: min(760px, calc(100svh - 48px));
  border-radius: 28px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6);
}

.bld__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(7, 9, 12, 0.6);
  cursor: pointer;
  transition: border-color 0.3s var(--ease), transform 0.5s var(--ease);
}

.bld__close svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

@media (hover: hover) {
  .bld__close:hover {
    border-color: var(--mint);
    transform: rotate(90deg);
  }
}

/* сцена: стойка с неоновой подсветкой */
.bld__stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 24px 24px;
  background:
    radial-gradient(60% 50% at 50% 62%, rgba(102, 212, 190, 0.16), transparent 70%),
    repeating-linear-gradient(90deg, transparent 0 46px, rgba(102, 212, 190, 0.04) 46px 47px),
    var(--ink);
  border-right: 1px solid var(--line);
}

.bld__stage::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 22%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 212, 190, 0.45), transparent);
}

.bld__cup {
  width: min(320px, 100%, calc((100svh - 260px) * 0.727));
}

.bld__say {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  margin: 0;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(13, 18, 23, 0.8);
  color: var(--pale);
  font-size: 14px;
  text-align: center;
}

.bld__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 12px var(--mint);
  animation: pulse 1.4s var(--ease-io) infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.7);
  }
}

.bld__side {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bld__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 36px clamp(20px, 3vw, 40px) 20px;
}

.bld__scroll .eyebrow {
  margin: 0 0 12px;
}

.bld__title {
  margin: 0 56px 12px 0;
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.02;
}

.bld__desc {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 15px;
}

.step {
  margin: 22px 0 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.step legend {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
  margin-bottom: 12px;
  padding: 0;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.step legend span {
  color: var(--mint);
}

.step__count {
  margin-left: auto;
  font-family: var(--font-body);
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  color: var(--muted);
  transition: color 0.3s;
}

.step__count.full {
  color: var(--mint);
}

.opts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opt {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--ink);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease), transform 0.4s var(--ease), opacity 0.3s;
}

@media (hover: hover) {
  .opt:hover {
    border-color: var(--deep);
  }
}

.opt:active {
  transform: scale(0.96);
  transition-duration: 0.1s;
}

.opt[aria-pressed='true'] {
  border-color: var(--mint);
  background: rgba(102, 212, 190, 0.1);
  box-shadow: inset 0 0 0 1px var(--mint);
}

.opt[aria-disabled='true'] {
  opacity: 0.45;
}

.opt__add {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}

.opts--size {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
}

.opt--size {
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  min-height: 112px;
  padding: 12px 10px;
}

.opt__cup {
  width: 30px;
  height: 40px;
  margin-bottom: 6px;
  transform: scale(var(--s));
  transform-origin: 50% 100%;
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.6;
  transition: stroke 0.3s, fill 0.3s, transform 0.6s var(--ease);
}

.opt--size[aria-pressed='true'] .opt__cup {
  stroke: var(--mint);
  fill: rgba(102, 212, 190, 0.2);
  transform: scale(calc(var(--s) * 1.1));
}

.opt__main {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
}

.opt__main small {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 11px;
  color: var(--muted);
}

.opt__price {
  color: var(--mint);
  font-weight: 600;
  font-size: 13px;
}

.swatch {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  transition: transform 0.5s var(--ease);
}

.swatch--none {
  background: linear-gradient(135deg, transparent 45%, var(--muted) 45% 55%, transparent 55%);
  box-shadow: inset 0 0 0 1.5px var(--muted);
}

.opt[aria-pressed='true'] .swatch {
  transform: scale(1.2);
}

.opts--syrup {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.opt--syrup {
  padding: 8px 12px;
}

.opt__name {
  flex: 1;
  text-align: left;
  line-height: 1.2;
}

.drop {
  flex: none;
  width: 14px;
  height: 19px;
  transition: transform 0.5s var(--ease);
}

.opt--syrup[aria-pressed='true'] .drop {
  animation: drip 0.6s var(--ease);
}

@keyframes drip {
  0% {
    transform: translateY(-8px) scale(0.6);
  }
  60% {
    transform: translateY(2px) scale(1.15, 0.85);
  }
}

.shake {
  animation: shake 0.42s var(--ease-io);
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}

.bld__foot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px clamp(20px, 3vw, 40px) calc(16px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--line);
  background: var(--ink-2);
}

.qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.qty__b {
  width: 44px;
  height: 48px;
  border: 0;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

.qty__b:disabled {
  opacity: 0.3;
  cursor: default;
}

.qty__n {
  min-width: 20px;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 700;
}

.bld__add {
  flex: 1;
  justify-content: space-between;
  padding-inline: 22px;
  white-space: nowrap;
}

.bld__add:disabled {
  opacity: 0.7;
  cursor: progress;
}

.bld__sum {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}

/* появление: <Transition name="sheet"> в MenuView */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.5s var(--ease);
}

.sheet-enter-active .bld__panel {
  transition: transform 0.75s var(--ease), opacity 0.5s var(--ease);
}

.sheet-leave-active .bld__panel {
  transition: transform 0.4s var(--ease-io), opacity 0.3s var(--ease-io);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .bld__panel {
  opacity: 0;
  transform: translateY(48px) scale(0.96);
}

.sheet-leave-to .bld__panel {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

/* ---- телефон: шторка снизу, стакан сверху, шаги прокручиваются под ним ---- */
@media (max-width: 820px) {
  .bld {
    padding: 0;
    place-items: end stretch;
  }

  .bld__panel {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: calc(100svh - 24px);
    border-radius: 24px 24px 0 0;
    border-bottom: 0;
  }

  .bld__stage {
    flex-direction: row;
    gap: 4px;
    padding: 14px 64px 10px 16px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .bld__stage::after {
    bottom: 16px;
  }

  .bld__cup {
    width: min(150px, 26svh);
    flex: none;
  }

  .bld__say {
    min-height: 0;
    padding: 6px 12px;
    font-size: 13px;
    text-align: left;
  }

  .bld__scroll {
    padding-top: 20px;
  }

  .bld__title {
    margin-right: 0;
  }

  .opt--size {
    min-height: 96px;
  }

  .bld__foot {
    gap: 8px;
  }

  .qty__b {
    width: 36px;
  }

  .bld__add {
    padding-inline: 18px;
    letter-spacing: 0.03em;
  }

  .opts--syrup {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sheet-enter-from .bld__panel {
    opacity: 1;
    transform: translateY(100%);
  }

  .sheet-leave-to .bld__panel {
    opacity: 1;
    transform: translateY(100%);
  }
}
</style>
