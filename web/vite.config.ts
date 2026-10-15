import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa/apple-touch-icon.png'],
      manifest: {
        name: 'Kool Fruits',
        short_name: 'Kool Fruits',
        description: 'Fresh, tropical, natural coconut water delivery in Jamaica.',
        theme_color: '#3dbe29',
        background_color: '#fbf8f1',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Order and auth data must always be fresh — only cache static assets and
        // product photos/fonts, never /api/*. The default globPatterns already skip
        // /api since it only precaches the built dist/ files.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/product-photos/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'product-photos', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5258',
      '/product-photos': 'http://localhost:5258',
    },
  },
})
