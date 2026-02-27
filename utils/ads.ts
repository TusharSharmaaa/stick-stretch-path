// ==================== AdMob Configuration ====================
// Set to true while developing, false for real AdMob in production
export const AD_TESTING_MODE = false;

// Google AdMob Test IDs (Android) - Use these during development
const TEST_ADMOB_IDS = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
  NATIVE: 'ca-app-pub-3940256099942544/2247696110'
};

const PRODUCTION_ADMOB_IDS = {
  // TODO: Paste your real production IDs from the AdMob console
  // Example values (do NOT use these – use your own from the screenshot / console):
  APP_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
  BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB',
  INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII',
  REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/RRRRRRRRRR',
  REWARDED_INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW',
  NATIVE: 'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN'
};

// Export the appropriate IDs based on mode
export const ADMOB_IDS = AD_TESTING_MODE ? TEST_ADMOB_IDS : PRODUCTION_ADMOB_IDS;

// Configuration
export const AD_CONFIG = {
  INTERSTITIAL_INTERVAL: 3, // Show interstitial every 3 game overs
  BANNER_HEIGHT: 50, // px
};

export type AdType = 'BANNER' | 'INTERSTITIAL' | 'REWARDED';

export interface AdState {
  isBannerVisible: boolean;
  activeOverlayAd: AdType | null;
}
