import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Redirige /api/* al backend automáticamente
      // Así no tienes problemas de CORS en desarrollo
      '/api': 'http://localhost:3000',
    },
  },
})