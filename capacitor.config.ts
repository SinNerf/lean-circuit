import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leancircuit.app',
  appName: 'Lean Circuit',
  webDir: 'dist',
  backgroundColor: '#101418',
  android: {
    backgroundColor: '#101418',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: '#101418',
      showSpinner: false,
    },
  },
};

export default config;
