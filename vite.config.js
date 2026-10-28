import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // На GitHub Pages сайт живёт в подпапке репозитория: workflow передаёт BASE_PATH=/budini-coffee/
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
  build: {
    // render.html (служебный рендер 3D-кадров) в production не попадает
    rollupOptions: { input: 'index.html' },
  },
})
