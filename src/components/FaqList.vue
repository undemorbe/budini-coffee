<script setup>
// Вопросы и ответы на нативных <details>: доступно с клавиатуры и без JS.
defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <div class="faq">
    <details v-for="q in items" :key="q.q" class="faq__item">
      <summary class="faq__q">
        <span>{{ q.q }}</span>
        <span class="faq__icon" aria-hidden="true"></span>
      </summary>
      <p class="faq__a">{{ q.a }}</p>
    </details>
  </div>
</template>

<style scoped>
.faq {
  border-top: 1px solid var(--line);
}

.faq__item {
  border-bottom: 1px solid var(--line);
}

.faq__q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  min-height: 64px;
  padding: 18px 4px;
  cursor: pointer;
  list-style: none;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(15px, 1.6vw, 18px);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  transition: color 0.4s var(--ease);
}

.faq__q::-webkit-details-marker {
  display: none;
}

.faq__q:hover {
  color: var(--mint);
}

.faq__icon {
  position: relative;
  flex: none;
  width: 18px;
  height: 18px;
}

.faq__icon::before,
.faq__icon::after {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 18px;
  height: 2px;
  background: var(--mint);
  transition: transform 0.5s var(--ease);
}

.faq__icon::after {
  transform: rotate(90deg);
}

.faq__item[open] .faq__icon::after {
  transform: rotate(0deg);
}

.faq__a {
  margin: 0;
  padding: 0 4px 24px;
  max-width: 70ch;
  color: var(--muted);
  animation: faq-open 0.6s var(--ease);
}

@keyframes faq-open {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
</style>
