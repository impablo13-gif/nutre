import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// La base con subruta solo hace falta para un build de producción servido
// desde una subruta; en local (`npm run dev`) se mantiene en la raíz.
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/nutre/' : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Nutre — Nutricionista personal',
          short_name: 'Nutre',
          description: 'Tu nutricionista personal: plan semanal, diario de comidas y progreso.',
          theme_color: '#f6f1e7',
          background_color: '#f6f1e7',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
        },
      }),
    ],
  }
})
