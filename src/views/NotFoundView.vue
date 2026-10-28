<template>
  <section class="nf wrap">
    <p class="eyebrow">Ошибка 404</p>
    <div class="nf__band">
      <h1 class="display nf__t">Тут ещё <span class="neon">спят</span></h1>
    </div>
    <p class="nf__d">Такой страницы нет, или её переставили. Зато кофе на месте.</p>
    <div class="nf__actions">
      <RouterLink to="/" class="btn">На главную</RouterLink>
      <RouterLink to="/menu" class="btn btn--ghost">Открыть меню</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.nf {
  min-height: 80svh;
  padding-top: calc(var(--header-h) + 100px);
}

.nf__band {
  margin: 18px calc(-1 * var(--gutter));
  padding: 14px var(--gutter);
  background: #000;
}

.nf__t {
  margin: 0;
  font-size: clamp(44px, 9vw, 130px);
}

.nf__d {
  max-width: 50ch;
  color: var(--muted);
  font-size: 18px;
}

.nf__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
