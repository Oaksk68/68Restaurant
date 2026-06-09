import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://68restaurant-production.up.railway.app',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://68restaurant-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})

