import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Site de projeto no GitHub Pages: https://bitcoiniciantes.github.io/calistenia/
  base: '/calistenia/',
  // Build de publicação vai para docs/ (Pages serve a branch main).
  build: { outDir: 'docs' },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Calistenia',
        short_name: 'Calistenia',
        description:
          'Rotina de calistenia offline-first para uso pessoal (Fase 1).',
        lang: 'pt-BR',
        theme_color: '#16171d',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/calistenia/',
        scope: '/calistenia/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg}'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
