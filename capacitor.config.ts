import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skyowed.app',
  appName: 'SkyOwed',
  webDir: 'out',
  backgroundColor: '#05060a',
  ios: { contentInset: 'always', backgroundColor: '#05060a' },
  android: { backgroundColor: '#05060a', allowMixedContent: false },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#05060a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    StatusBar: { style: 'DARK', backgroundColor: '#05060a', overlaysWebView: false },
  },
};

export default config;
