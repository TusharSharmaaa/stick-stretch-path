import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { ADMOB_IDS } from './ads';

const isNativePlatform = typeof Capacitor.isNativePlatform === 'function'
  ? Capacitor.isNativePlatform()
  : ['ios', 'android'].includes(Capacitor.getPlatform());

let initialized = false;
let bannerVisible = false;

const ensureInitialized = async () => {
  if (!isNativePlatform) return false;
  if (initialized) return true;

  try {
    await AdMob.initialize({
      initializeForTesting: true,
    });
    initialized = true;
    return true;
  } catch (error) {
    console.warn('[AdMob] Initialization failed', error);
    return false;
  }
};

const cleanupListeners = async (listeners: PluginListenerHandle[]) => {
  await Promise.all(
    listeners.map(async (listener) => {
      try {
        await listener.remove();
      } catch {
        // Ignore listener cleanup failures
      }
    }),
  );
};

export const isNativeAdsSupported = () => isNativePlatform;

export const mountBannerAd = async () => {
  if (!isNativePlatform) return;
  const ready = await ensureInitialized();
  if (!ready) return;

  if (bannerVisible) {
    try {
      await AdMob.resumeBanner();
    } catch (error) {
      console.warn('[AdMob] Resume banner failed', error);
    }
    return;
  }

  const options: BannerAdOptions = {
    adId: ADMOB_IDS.BANNER,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: true,
  };

  try {
    await AdMob.showBanner(options);
    bannerVisible = true;
  } catch (error) {
    console.warn('[AdMob] Show banner failed', error);
  }
};

export const unmountBannerAd = async () => {
  if (!isNativePlatform || !bannerVisible) return;
  try {
    await AdMob.hideBanner();
    bannerVisible = false;
  } catch (error) {
    console.warn('[AdMob] Hide banner failed', error);
  }
};

export const showNativeRewardedAd = async (): Promise<boolean> => {
  if (!isNativePlatform) return false;
  const ready = await ensureInitialized();
  if (!ready) return false;

  return new Promise(async (resolve) => {
    const listeners: PluginListenerHandle[] = [];
    const resolveOnce = async (result: boolean) => {
      await cleanupListeners(listeners);
      resolve(result);
    };

    try {
      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.Rewarded, async () => {
          await resolveOnce(true);
        }),
      );
      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
          await resolveOnce(false);
        }),
      );
      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.FailedToShow, async () => {
          await resolveOnce(false);
        }),
      );
      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, async () => {
          await resolveOnce(false);
        }),
      );

      await AdMob.prepareRewardVideoAd({
        adId: ADMOB_IDS.REWARDED,
        isTesting: true,
        immersiveMode: true,
      });
      await AdMob.showRewardVideoAd();
    } catch (error) {
      console.warn('[AdMob] Rewarded ad error', error);
      await resolveOnce(false);
    }
  });
};

export const showNativeInterstitialAd = async (): Promise<boolean> => {
  if (!isNativePlatform) return false;
  const ready = await ensureInitialized();
  if (!ready) return false;

  return new Promise(async (resolve) => {
    const listeners: PluginListenerHandle[] = [];
    const resolveOnce = async (result: boolean) => {
      await cleanupListeners(listeners);
      resolve(result);
    };

    try {
      listeners.push(
        await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, async () => {
          await resolveOnce(true);
        }),
      );
      listeners.push(
        await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, async () => {
          await resolveOnce(false);
        }),
      );
      listeners.push(
        await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, async () => {
          await resolveOnce(false);
        }),
      );

      await AdMob.prepareInterstitial({
        adId: ADMOB_IDS.INTERSTITIAL,
        isTesting: true,
        immersiveMode: true,
      });
      await AdMob.showInterstitial();
    } catch (error) {
      console.warn('[AdMob] Interstitial ad error', error);
      await resolveOnce(false);
    }
  });
};


