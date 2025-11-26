import { CapacitorConfig } from '@capacitor/cli';
import { ADMOB_IDS } from './utils/ads';

const config: CapacitorConfig = {
  appId: 'com.stickstretch.game',
  appName: 'Stick Stretch Path',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    AdMob: {
      appIdAndroid: ADMOB_IDS.APP_ID,
      adIdBanner: ADMOB_IDS.BANNER,
      adIdInterstitial: ADMOB_IDS.INTERSTITIAL,
      adIdReward: ADMOB_IDS.REWARDED,
    },
  },
};

export default config;

