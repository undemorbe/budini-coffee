import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // render.html (служебный рендер 3D-кадров) в production не попадает
    rollupOptions: { input: 'index.html' },
  },
})
