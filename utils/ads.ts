// ==================== AdMob Configuration ====================
// Set to false when you have real AdMob IDs for production release
export const AD_TESTING_MODE = true;

// Google AdMob Test IDs (Android) - Use these during development
const TEST_ADMOB_IDS = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
  NATIVE: 'ca-app-pub-3940256099942544/2247696110'
};

// Production AdMob IDs - Replace with your real IDs from AdMob Console
// To get these IDs:
// 1. Go to https://admob.google.com
// 2. Create an app and ad units
// 3. Copy the IDs here
const PRODUCTION_ADMOB_IDS = {
  APP_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',        // Replace with your App ID
  BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',        // Replace with Banner Ad Unit ID
  INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',  // Replace with Interstitial Ad Unit ID
  REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',      // Replace with Rewarded Ad Unit ID
  REWARDED_INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Optional
  NATIVE: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'         // Optional
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
