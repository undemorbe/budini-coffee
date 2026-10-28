<script setup>
// Логотип как на световой вывеске: стакан с зерном в квадратной рамке + БУДИНИ COFFEE.
defineProps({ compact: { type: Boolean, default: false } })
</script>

<template>
  <span class="brand" :class="{ 'brand--compact': compact }">
    <svg class="brand__icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="3" y="3" width="58" height="58" rx="7" fill="none" stroke="currentColor" stroke-width="3.2" />
      <rect x="17" y="13" width="30" height="6" rx="2" fill="currentColor" />
      <path d="M19 21h26l-3.2 29.4a3 3 0 0 1-3 2.6H25.2a3 3 0 0 1-3-2.6z" fill="currentColor" />
      <ellipse cx="32" cy="36" rx="5.2" ry="7.6" fill="var(--ink)" transform="rotate(-25 32 36)" />
      <path d="M29.6 30c-2.2 4 4.6 8 2.2 12.3" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" />
    </svg>
    <span class="brand__text">
      <span class="brand__name">Будини</span>
      <span class="brand__sub">Coffee</span>
    </span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--mint);
}

.brand__icon {
  width: 44px;
  height: 44px;
  flex: none;
}

.brand__text {
  display: flex;
  flex-direction: column;
  font-family: var(--font-display);
  font-weight: 800;
  text-transform: uppercase;
  line-height: 0.92;
}

.brand__name {
  font-size: 19px;
  letter-spacing: 0.02em;
}

.brand__sub {
  font-size: 19px;
  letter-spacing: 0.1em;
}

.brand--compact .brand__icon {
  width: 36px;
  height: 36px;
}

.brand--compact .brand__name,
.brand--compact .brand__sub {
  font-size: 15px;
}
</style>
