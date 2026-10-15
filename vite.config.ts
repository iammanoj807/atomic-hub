import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable app: on iPhone, Share → Add to Home Screen opens it full
    // screen with its own icon. Data still lives in Firestore, so the phone
    // and the browser show the same thing.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered from main.tsx
      manifest: {
        name: 'Atomic Hub',
        short_name: 'Atomic Hub',
        description: 'Daily improvement and interview preparation',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B0E14',
        theme_color: '#0B0E14',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Install only the app shell: the page, the entry bundle, its styles
        // and the icons. The heavy chunks (Mermaid, the SQL engine, video
        // players) add ~8 MB and are cached the first time they're used.
        // ML Foundations is its own chunk, so it is installed too and still opens offline.
        globPatterns: ['index.html', 'assets/index-*.{js,css}', 'assets/FoundationsPage-*.js', 'icons/*.png', 'atomic_hub.png'],
        // The entry bundle is ~3.1 MB, over Workbox's 2 MiB default.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        // Firebase Hosting's reserved /__/ URLs must always reach the server.
        navigateFallbackDenylist: [/^\/__\//],
        cleanupOutdatedCaches: true,
        // Only these are cached at runtime. Everything else, Firestore and
        // sign-in included, goes straight to the network.
        runtimeCaching: [
          {
            // Content-hashed build files never change under the same name.
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    sourcemap: false, // Ensures F12 won't show your organized .tsx files in Production
  }
})
