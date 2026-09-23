import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  resolve: { preserveSymlinks: true },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 47321,
    strictPort: true,
    allowedHosts: ['stiffly-driller-saffron.ngrok-free.dev'],
    watch: { ignored: ['**/android/**'] },
  },
  optimizeDeps: { entries: ['index.html'] },
  preview: {
    host: '127.0.0.1',
    port: 47329,
    strictPort: true,
    allowedHosts: ['stiffly-driller-saffron.ngrok-free.dev'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icon-192.png', 'icon-512.png', 'fonts/*.woff2'],
      manifest: {
        name: 'Lean Circuit',
        short_name: 'Lean Circuit',
        description: 'Daily circuit, stats, trials, and skills. Progress stays on the device.',
        display: 'standalone',
        background_color: '#101418',
        theme_color: '#101418',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        cacheId: 'lean-circuit-47329',
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff2,ico,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
