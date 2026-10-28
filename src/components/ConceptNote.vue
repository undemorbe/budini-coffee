<script setup>
// Плашка для разделов, которых у кофейни пока нет: показывает, как раздел может выглядеть.
// Условия и цифры на таких страницах примерные, гости не должны принять их за действующие.
</script>

<template>
  <p class="concept wrap" role="note">
    <span class="concept__k">Пример раздела</span>
    <span>Так может работать раздел в будущей версии сайта. Условия на этой странице не действуют.</span>
  </p>
</template>

<style scoped>
.concept {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin-top: 28px;
  margin-bottom: 0;
  color: var(--muted);
  font-size: 15px;
}

.concept__k {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--mint);
  color: var(--mint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
