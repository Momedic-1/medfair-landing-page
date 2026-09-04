import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['medfair.svg', 'logo.jpeg', 'logo.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        importScripts: ['/push-handlers.js']
      },
      manifest: {
        name: 'MedFair',
        short_name: 'MedFair',
        description: 'Medfair telemedicine care platform',
        theme_color: '#020e7c',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/login',
        scope: '/',
        icons: [
          {
            src: '/medfair.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/medfair.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  define: {
    'process.env': {},
  },
})
