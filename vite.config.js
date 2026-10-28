import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// GitHub Pages не знает про маршруты SPA: на /menu отдаёт 404.html. Копия index.html под этим
// именем запускает приложение, а vue-router уже сам открывает нужную страницу.
const spaFallback = () => ({
  name: 'spa-fallback-404',
  apply: 'build',
  closeBundle() {
    const out = resolve(import.meta.dirname, 'dist')
    copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
  },
})

// https://vite.dev/config/
export default defineConfig({
  // На GitHub Pages сайт живёт в подпапке репозитория: workflow передаёт BASE_PATH=/<имя-репозитория>/
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), spaFallback()],
  build: {
    // render.html (служебный рендер 3D-кадров) в production не попадает
    rollupOptions: { input: 'index.html' },
  },
  test: {
    include: ['src/**/*.test.js'],
  },
})
