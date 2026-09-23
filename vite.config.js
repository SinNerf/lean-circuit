import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

function firebaseLocalConfig() {
  const virtual = 'virtual:firebase-config';
  const resolved = '\0virtual:firebase-config';
  return {
    name: 'firebase-local-config',
    resolveId(source) {
      if (source === virtual) return resolved;
    },
    load(source) {
      if (source !== resolved) return null;
      let config = null;
      try {
        const file = path.resolve(process.cwd(), 'firebase.local.json');
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (parsed?.apiKey && parsed?.projectId && parsed?.appId) {
          config = {
            apiKey: parsed.apiKey,
            authDomain: parsed.authDomain || '',
            projectId: parsed.projectId,
            storageBucket: parsed.storageBucket || '',
            messagingSenderId: parsed.messagingSenderId || '',
            appId: parsed.appId,
          };
          if (parsed.measurementId) config.measurementId = parsed.measurementId;
        }
      } catch {
        config = null;
      }
      return `export default ${JSON.stringify(config)};`;
    },
  };
}

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
    firebaseLocalConfig(),
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
