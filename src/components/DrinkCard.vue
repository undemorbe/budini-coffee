<script setup>
import { computed, ref } from 'vue'

// item: модель MenuItem из src/domain/menu/models.js
const props = defineProps({ item: { type: Object, required: true } })

const volumes = computed(() => props.item.volumes)
// по умолчанию средний объём из трёх, иначе самый маленький
const selected = ref(volumes.value.length >= 3 ? 1 : 0)
const current = computed(() => volumes.value[selected.value] ?? volumes.value[0])
</script>

<template>
  <article class="card">
    <div class="card__top">
      <div class="card__badges">
        <span v-if="item.isNew" class="badge badge--new">Новинка</span>
        <span v-for="t in item.tags" :key="t.id" class="badge badge--line">{{ t.label }}</span>
      </div>
      <span v-if="item.emoji" class="card__emoji" aria-hidden="true">{{ item.emoji }}</span>
    </div>

    <h3 class="card__name">{{ item.name }}</h3>
    <p v-if="item.description" class="card__desc">{{ item.description }}</p>

    <div class="card__foot">
      <div v-if="volumes.length > 1" class="sizes" role="group" :aria-label="`Объём: ${item.name}`">
        <button
          v-for="(v, i) in volumes"
          :key="v.ml"
          type="button"
          class="size"
          :aria-pressed="selected === i"
          @click="selected = i"
        >
          {{ v.ml }}<small>мл</small>
        </button>
      </div>
      <span v-else-if="item.unit === 'ml'" class="size size--only">{{ volumes[0].ml }}<small>мл</small></span>
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

.card__emoji {
  flex: none;
  font-size: 26px;
  line-height: 1;
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
