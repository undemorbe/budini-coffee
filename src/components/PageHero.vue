<script setup>
// Шапка внутренней страницы: метка, крупный заголовок с мятным акцентом, вводный текст.
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  accent: { type: String, default: '' },
  lead: { type: String, default: '' },
})
</script>

<template>
  <header class="ph wrap">
    <p class="eyebrow ph__eyebrow">{{ eyebrow }}</p>
    <h1 class="display ph__title">
      {{ title }}{{ accent ? ' ' : '' }}<span v-if="accent" class="neon">{{ accent }}</span>
    </h1>
    <p v-if="lead" class="ph__lead">{{ lead }}</p>
    <slot />
  </header>
</template>

<style scoped>
.ph {
  padding-top: calc(var(--header-h) + 80px);
  animation: ph-in 1.1s var(--ease) both;
}

.ph__title {
  margin: 16px 0 20px;
  max-width: 16ch;
  font-size: clamp(32px, 7.4vw, 104px);
  overflow-wrap: break-word;
}

.ph__lead {
  max-width: 58ch;
  margin: 0;
  color: var(--muted);
  font-size: 18px;
}

@keyframes ph-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}
</style>
