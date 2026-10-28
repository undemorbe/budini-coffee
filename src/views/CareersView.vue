<script setup>
import { ref } from 'vue'
import ConceptNote from '../components/ConceptNote.vue'
import PageHero from '../components/PageHero.vue'
import { useReveal } from '../composables/useReveal'
import { contacts } from '../data/site'

const root = ref(null)
useReveal(root)

const perks = [
  { t: 'Обучим с нуля', d: 'Две недели стажировки с тренером, своя школа бариста и чемпионаты внутри команды.' },
  { t: 'Гибкий график', d: 'Смены по 8 или 12 часов, график 2/2 или 5/2. Можно совмещать с учёбой.' },
  { t: 'Кофе и еда', d: 'Бесплатные напитки на смене и скидка 50% на выпечку для команды.' },
  { t: 'Рост внутри', d: 'Бариста, старший бариста, тренер, управляющий. Большинство управляющих выросли у нас.' },
]

const jobs = [
  { t: 'Бариста', where: 'Все кофейни', pay: 'от 60 000 ₽', d: 'Готовишь напитки, общаешься с гостями, следишь за чистотой бара. Опыт не обязателен.' },
  { t: 'Старший бариста', where: 'Лиговский пр., 44', pay: 'от 85 000 ₽', d: 'Ведёшь смену из 3-4 человек, отвечаешь за стоп-лист и качество напитков.' },
  { t: 'Бариста в Кудрово', where: 'Пражская ул., 6к1', pay: 'от 60 000 ₽', d: 'Утренние смены с 07:30 в будни, классика, авторские напитки и бабл ти.' },
]
</script>

<template>
  <div ref="root">
    <PageHero
      eyebrow="Вакансии"
      title="Буди город"
      accent="вместе с нами"
      lead="Ищем людей, которые любят кофе и утро. Научим всему остальному."
    />
    <ConceptNote />

    <section class="wrap perks" aria-label="Что мы даём">
      <article v-for="(p, i) in perks" :key="p.t" class="perk reveal" :style="{ '--d': i * 0.07 + 's' }">
        <h2 class="perk__t">{{ p.t }}</h2>
        <p class="perk__d">{{ p.d }}</p>
      </article>
    </section>

    <section class="wrap jobs" aria-labelledby="jobs-title">
      <h2 id="jobs-title" class="display jobs__title reveal">Открытые вакансии</h2>
      <article v-for="j in jobs" :key="j.t" class="job reveal">
        <div>
          <h3 class="job__t display">{{ j.t }}</h3>
          <p class="job__d">{{ j.d }}</p>
        </div>
        <p class="job__where">{{ j.where }}</p>
        <p class="job__pay display">{{ j.pay }}</p>
      </article>
      <div class="apply reveal">
        <p class="apply__t">Напиши коротко о себе в Telegram или WhatsApp</p>
        <a :href="contacts.telegram" target="_blank" rel="noopener" class="apply__mail display">{{ contacts.telegramLabel }}</a>
        <p class="apply__note">или позвони: {{ contacts.phone }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.perks {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 64px;
}

.perk {
  padding: 26px;
  border-radius: var(--radius);
  background: var(--ink-2);
  border: 1px solid var(--line);
}

.perk__t {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 16px;
  text-transform: uppercase;
  color: var(--mint);
}

.perk__d {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

.jobs {
  padding-top: 110px;
}

.jobs__title {
  margin: 0 0 30px;
  font-size: clamp(32px, 5vw, 64px);
}

.job {
  display: grid;
  grid-template-columns: 1fr 200px 180px;
  gap: 24px;
  align-items: center;
  padding: 28px 0;
  border-top: 1px solid var(--line);
}

.job__t {
  margin: 0 0 8px;
  font-size: clamp(20px, 2.4vw, 28px);
}

.job__d {
  margin: 0;
  color: var(--muted);
  max-width: 56ch;
}

.job__where {
  margin: 0;
  color: var(--pale);
}

.job__pay {
  margin: 0;
  font-size: 20px;
  color: var(--mint);
  text-align: right;
}

.apply {
  margin-top: 40px;
  padding: clamp(24px, 4vw, 44px);
  border-radius: var(--radius);
  background: var(--mint);
  color: var(--ink);
}

.apply__t,
.apply__note {
  margin: 0;
}

.apply__mail {
  margin: 10px 0;
  font-size: clamp(22px, 4vw, 44px);
  word-break: break-all;
}

.apply__note {
  opacity: 0.75;
}

@media (max-width: 1000px) {
  .perks {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .perks {
    grid-template-columns: 1fr;
  }
  .job {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .job__pay {
    text-align: left;
  }
}
</style>
