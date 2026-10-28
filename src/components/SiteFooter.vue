<script setup>
import BrandMark from './BrandMark.vue'
import SwirlBand from './SwirlBand.vue'
import { cafes } from '../data/cafes'
import { brand, contacts, extraNav, mainNav } from '../data/site'
</script>

<template>
  <footer class="ftr">
    <div class="ftr__band">
      <SwirlBand />
      <div class="ftr__plate">
        <p class="ftr__word display">Будини</p>
      </div>
    </div>

    <div class="ftr__grid wrap">
      <div class="ftr__col ftr__col--brand">
        <BrandMark />
        <p class="ftr__lead">Кофейня, которая разбудит. {{ cafes.length }} кофеен в Петербурге и Кудрово, ежедневно до 23:00. Можно с животными.</p>
      </div>

      <nav class="ftr__col" aria-label="Гостям">
        <p class="ftr__h">Гостям</p>
        <RouterLink v-for="l in mainNav" :key="l.to" :to="l.to">{{ l.label }}</RouterLink>
      </nav>

      <nav class="ftr__col" aria-label="Кофейня">
        <p class="ftr__h">Кофейня</p>
        <RouterLink v-for="l in extraNav" :key="l.to" :to="l.to">{{ l.label }}</RouterLink>
      </nav>

      <div class="ftr__col">
        <p class="ftr__h">Кофейни</p>
        <RouterLink v-for="c in cafes" :key="c.id" :to="{ path: '/addresses', hash: '#' + c.id }">{{ c.street }}</RouterLink>
      </div>

      <div class="ftr__col ftr__col--contact">
        <p class="ftr__h">Связь</p>
        <a :href="contacts.phoneHref">{{ contacts.phone }}</a>
        <a :href="contacts.whatsapp" target="_blank" rel="noopener">WhatsApp</a>
        <a :href="contacts.telegram" target="_blank" rel="noopener">Telegram</a>
        <a :href="contacts.vk" target="_blank" rel="noopener">ВКонтакте</a>
      </div>
    </div>

    <div class="ftr__bottom wrap">
      <span>© 2026 Будини Кофе</span>
      <span>{{ brand.payment }}</span>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  position: relative;
  margin-top: 120px;
  background: var(--ink);
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.ftr__band {
  position: relative;
  height: clamp(220px, 34vw, 420px);
  overflow: hidden;
}

.ftr__plate {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #000;
  padding: clamp(10px, 2vw, 22px) 0;
  text-align: center;
}

.ftr__word {
  margin: 0;
  font-size: clamp(54px, 13vw, 190px);
  color: #fff;
  letter-spacing: 0.02em;
}

.ftr__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1.1fr;
  gap: 40px;
  padding-block: 64px 40px;
}

.ftr__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
}

.ftr__col a {
  color: var(--text);
  width: fit-content;
  transition: color 0.2s;
}

.ftr__col a:hover {
  color: var(--mint);
}

.ftr__h {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

.ftr__lead {
  max-width: 34ch;
  margin: 18px 0 0;
  color: var(--muted);
}

.ftr__muted {
  margin: 0;
  color: var(--muted);
}

.ftr__bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-block: 22px 28px;
  border-top: 1px solid var(--line);
  font-size: 13px;
  color: var(--muted);
}

@media (max-width: 1000px) {
  .ftr__grid {
    grid-template-columns: 1fr 1fr;
  }
  .ftr__col--brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 520px) {
  .ftr__grid {
    gap: 32px 20px;
    padding-block: 48px 32px;
  }
  .ftr__col--contact {
    grid-column: 1 / -1;
  }
  .ftr__col a {
    padding-block: 3px; /* крупнее зона нажатия на телефоне */
  }
}
</style>
