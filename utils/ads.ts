
// Google AdMob Test IDs (Android)
export const ADMOB_IDS = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
  NATIVE: 'ca-app-pub-3940256099942544/2247696110'
};

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
