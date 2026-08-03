import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://comic-l1ai.onrender.com/',
      '/static': 'https://comic-l1ai.onrender.com/',
    },
  },
})
