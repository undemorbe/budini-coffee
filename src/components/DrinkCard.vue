<script setup>
import { computed, ref } from 'vue'
import { buzzLabel, sizes } from '../data/menu'

const props = defineProps({ item: { type: Object, required: true } })

const available = computed(() => sizes.map((s, i) => ({ ...s, price: props.item.prices[i] })).filter((s) => s.price != null))
const size = ref(available.value.length > 1 ? available.value[1].id : available.value[0].id)
const current = computed(() => available.value.find((s) => s.id === size.value))
</script>

<template>
  <article class="card">
    <div class="card__top">
      <div class="card__badges">
        <span v-if="item.isNew" class="badge badge--new">Новинка</span>
        <span v-if="item.hit" class="badge">Хит</span>
        <span v-if="item.plant" class="badge badge--line">Растительное молоко</span>
        <span v-if="item.cold" class="badge badge--line">Холодный</span>
      </div>
      <div class="buzz" :title="buzzLabel[item.buzz]">
        <span class="sr-only">Бодрость: {{ buzzLabel[item.buzz] }}</span>
        <span v-for="n in 3" :key="n" class="buzz__bar" :class="{ on: n <= item.buzz }" aria-hidden="true"></span>
      </div>
    </div>

    <h3 class="card__name">{{ item.name }}</h3>
    <p class="card__desc">{{ item.desc }}</p>
    <p class="card__buzz">{{ buzzLabel[item.buzz] }}</p>

    <div class="card__foot">
      <div v-if="!item.single && available.length > 1" class="sizes" role="group" :aria-label="`Размер: ${item.name}`">
        <button
          v-for="s in available"
          :key="s.id"
          type="button"
          class="size"
          :aria-pressed="size === s.id"
          @click="size = s.id"
        >
          {{ s.id }}<small>{{ s.ml }}</small>
        </button>
      </div>
      <span v-else-if="!item.single" class="size size--only">{{ available[0].id }}<small>{{ available[0].ml }}</small></span>
      <span v-else class="size size--only">шт.</span>
      <p class="price">{{ current.price }} ₽</p>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  border-radius: var(--radius);
  background: var(--ink-2);
  border: 1px solid var(--line);
  transition: border-color 0.5s var(--ease), transform 0.6s var(--ease);
}

@media (hover: hover) {
  .card:hover {
    border-color: var(--deep);
    transform: translateY(-3px);
  }
}

.card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-height: 26px;
}

.card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(102, 212, 190, 0.14);
  color: var(--mint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.badge--new {
  background: var(--mint);
  color: var(--ink);
}

.badge--line {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
}

.buzz {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 22px;
  flex: none;
}

.buzz__bar {
  width: 6px;
  border-radius: 2px;
  background: var(--line);
}

.buzz__bar:nth-child(2) { height: 8px; }
.buzz__bar:nth-child(3) { height: 14px; }
.buzz__bar:nth-child(4) { height: 20px; }

.buzz__bar.on {
  background: var(--mint);
}

.card__name {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  line-height: 1.15;
  text-transform: uppercase;
}

.card__desc {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

.card__buzz {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--teal);
}

.card__foot {
  margin-top: auto;
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px dashed var(--line);
}

.sizes {
  display: flex;
  gap: 6px;
}

.size {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: transparent;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  line-height: 1.1;
  cursor: pointer;
}

.size small {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 10px;
  color: var(--muted);
}

.size[aria-pressed='true'] {
  border-color: var(--mint);
  color: var(--mint);
  box-shadow: inset 0 0 0 1px var(--mint);
}

.size--only {
  cursor: default;
  color: var(--muted);
}

.price {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--mint);
  white-space: nowrap;
}
</style>
