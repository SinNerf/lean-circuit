import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App.jsx';
import { shouldRegisterServiceWorker } from './platform.js';
import './index.css';

if (import.meta.env.PROD && shouldRegisterServiceWorker(Capacitor)) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    caches.keys().then((keys) => {
      keys
        .filter((key) => !key.includes('lean-circuit-47329'))
        .forEach((key) => {
          caches.delete(key);
        });
    });
  }
  registerSW({ immediate: true });
}

if (Capacitor.isNativePlatform()) {
  import('@capacitor/splash-screen').then(({ SplashScreen }) => {
    window.setTimeout(() => {
      SplashScreen.hide();
    }, 500);
  });
}

createRoot(document.getElementById('root')).render(<App />);
