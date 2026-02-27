# Bug Report - Stick Stretch Path Game

**Generated:** $(date)  
**Status:** Analysis Complete - Bugs Identified

---

## Executive Summary

This report identifies bugs and potential issues in the Stick Stretch Path game codebase. The analysis covers logic errors, state management issues, edge cases, and potential runtime problems. All issues are categorized by severity and include file locations and recommended fixes.

---

## Critical Bugs (High Priority)

### 1. **Missing Dependencies in useEffect Hook (App.tsx:172)**
**Severity:** High  
**Location:** `App.tsx`, line 172  
**Issue:** The main initialization `useEffect` has an empty dependency array but uses `scheduleNotification` which is defined with `useCallback`. While `scheduleNotification` is stable, React best practices suggest including it in the dependency array or ensuring it's properly memoized.

**Impact:** Could cause stale closures or unexpected behavior if `scheduleNotification` changes.

**Fix:** Add `scheduleNotification` to the dependency array, or verify it's properly memoized.

---

### 2. **Duplicate Achievement/Challenge Notification Logic (App.tsx:606-635)**
**Severity:** Medium-High  
**Location:** `App.tsx`, lines 606-635 (in `onHome` callback)  
**Issue:** The logic for checking pending achievements and challenges when returning to menu is duplicated. This same logic already exists in the initial `useEffect` (lines 142-169).

**Impact:** Code duplication, potential for inconsistencies, and unnecessary localStorage reads.

**Fix:** Extract this logic into a reusable function and call it from both places.

---

### 3. **Incomplete Frame Skipping Logic (useGameLoop.ts:50-60)**
**Severity:** Medium  
**Location:** `hooks/useGameLoop.ts`, lines 50-60  
**Issue:** The frame skipping logic calculates `skipFrames` and increments `frameSkipRef.current`, but never actually skips calling the callback. The comment says "frame skipping is handled internally by the game loop" but the callback is always called.

**Impact:** The frame skipping optimization doesn't work as intended, potentially causing performance issues on low-end devices.

**Fix:** Implement actual frame skipping by conditionally calling the callback based on `frameSkipRef.current` and `skipFrames`.

---

### 4. **Missing Dependencies in useGameLoop Callback (StickStretchGame.tsx:1014)**
**Severity:** Medium-High  
**Location:** `StickStretchGame.tsx`, line 1014  
**Issue:** The `gameLoop` callback uses `onGameEvent` and `settings` but they're not included in the dependency array. Only `onScore`, `onGameOver`, and `onCoinCollected` are listed.

**Impact:** Stale closures could cause the game to use outdated settings or miss game events.

**Fix:** Add `onGameEvent` and `settings` to the dependency array, or ensure they're properly memoized in the parent component.

---

### 5. **Potential Platform Finding Bug (StickStretchGame.tsx:566-570, 843-847)**
**Severity:** Medium  
**Location:** `StickStretchGame.tsx`, lines 566-570 and 843-847  
**Issue:** When no platform with `isTarget: true` is found, the code falls back to finding platforms by position. However, the fallback logic might find the wrong platform (e.g., a platform behind the player).

**Impact:** Player might land on the wrong platform or game logic might behave unexpectedly.

**Fix:** Improve fallback logic to ensure it only finds platforms ahead of the stick, or add validation to ensure the found platform is actually a valid target.

---

### 6. **Breakable Platform Break Countdown Logic (StickStretchGame.tsx:900-908)**
**Severity:** Medium  
**Location:** `StickStretchGame.tsx`, lines 900-908  
**Issue:** Breakable platforms have a `breakCountdown` that decrements in the game loop, but it's only checked when the player walks off the platform. If the player never reaches the platform or the game ends before walking off, the platform might never break properly.

**Impact:** Breakable platforms might not break as expected in edge cases.

**Fix:** Ensure breakable platforms break correctly even if the player doesn't walk off them, or handle the countdown more robustly.

---

## Medium Priority Bugs

### 7. **Improper Shuffle Algorithm (dailyChallenges.ts:29)**
**Severity:** Medium  
**Location:** `utils/dailyChallenges.ts`, line 29  
**Issue:** Uses `Math.random() - 0.5` for shuffling, which is not a proper shuffle algorithm (Fisher-Yates). This can lead to biased random selection.

**Impact:** Daily challenges might not be truly random, potentially showing the same challenges more frequently.

**Fix:** Implement proper Fisher-Yates shuffle algorithm.

---

### 8. **Potential Null Return Handling (storage.ts:174-193)**
**Severity:** Medium  
**Location:** `utils/storage.ts`, `getDailyChallenges` function  
**Issue:** The function can return `null` when challenges are expired or invalid, but the calling code in `App.tsx` might not always handle `null` properly (though `generateDailyChallenges()` is called which should handle it).

**Impact:** Potential runtime errors if null is not handled correctly.

**Fix:** Ensure all call sites properly handle null returns, or change the return type to always return an array.

---

### 9. **Date Comparison Edge Case (storage.ts:185)**
**Severity:** Low-Medium  
**Location:** `utils/storage.ts`, line 185  
**Issue:** Uses `toDateString()` for date comparison, which only compares the date part. If a challenge expires at midnight but is checked at a different time, there might be edge cases.

**Impact:** Challenges might expire at unexpected times or persist longer than intended.

**Fix:** Use more precise date/time comparison or ensure consistent timezone handling.

---

### 10. **Share URL Context Issue (GameOver.tsx:18)**
**Severity:** Low-Medium  
**Location:** `components/GameOver.tsx`, line 18  
**Issue:** Uses `window.location.href` for share URL, which might not work correctly in a mobile app context (Capacitor) or when the app is embedded.

**Impact:** Share functionality might not work correctly in native app builds.

**Fix:** Use Capacitor's App plugin to get the proper URL, or provide a fallback for web vs native contexts.

---

### 11. **isSecureContext Check (GameOver.tsx:34)**
**Severity:** Low  
**Location:** `components/GameOver.tsx`, line 34  
**Issue:** Checks `window.isSecureContext` which might not be available in all contexts (older browsers, some embedded contexts).

**Impact:** Share functionality might fail silently in some environments.

**Fix:** Add proper feature detection with fallback.

---

### 12. **Interstitial Ad Failure Handling (App.tsx:450-458)**
**Severity:** Medium  
**Location:** `App.tsx`, lines 450-458  
**Issue:** When showing an interstitial ad, if the ad fails to show, the callback might not set the game state to `GAME_OVER` properly. The `setTimeout` always executes, but if the ad fails immediately, there might be a race condition.

**Impact:** Game might get stuck in an intermediate state if ad fails.

**Fix:** Ensure game state is always set to `GAME_OVER` even if ad fails, or handle ad failures more explicitly.

---

### 13. **Safety Net Boost State Management (App.tsx:304-312)**
**Severity:** Medium  
**Location:** `App.tsx`, lines 304-312  
**Issue:** The safety net boost check uses `reviveBoostUsedRef.current` to prevent reuse, but if the boost is still in `activeBoosts` after being used, there might be state inconsistencies.

**Impact:** Safety net might not work correctly if state gets out of sync.

**Fix:** Ensure `activeBoosts` is properly updated when safety net is used, and verify state consistency.

---

### 14. **Coin Calculation Potential Double Counting (App.tsx:318-338)**
**Severity:** Low-Medium  
**Location:** `App.tsx`, lines 318-338  
**Issue:** The comment says "coins collected during gameplay are already added to state" and "Only add score-based coins", but the logic applies boost multipliers to the entire `earnedCoins` which includes the base score. If coins were collected during gameplay with boosts active, there might be confusion about what's being multiplied.

**Impact:** Coin rewards might be calculated incorrectly in edge cases.

**Fix:** Clarify the coin calculation logic and ensure boosts are applied correctly to the right coin sources.

---

### 15. **Achievement Progress Update Logic (achievements.ts:66-68)**
**Severity:** Low-Medium  
**Location:** `utils/achievements.ts`, lines 66-68  
**Issue:** For "perfect_10" achievement, the progress is set to 10 if `currentGame.perfects >= 10`, but this doesn't account for cases where the player might have gotten exactly 10 perfects. The progress should reflect the actual count, not just 10.

**Impact:** Achievement progress might not be accurate.

**Fix:** Use the actual perfect count instead of hardcoding 10.

---

## Low Priority Issues / Code Quality

### 16. **Redundant Validation Checks (MainMenu.tsx:497, 589)**
**Severity:** Low  
**Location:** `components/MainMenu.tsx`, lines 497 and 589  
**Issue:** Multiple redundant checks for the same conditions (e.g., `effectiveCost >= 0` and `coins >= effectiveCost` checked multiple times).

**Impact:** Code readability, no functional impact.

**Fix:** Simplify validation logic to avoid redundancy.

---

### 17. **Missing Type Safety for DecorObject.speed (StickStretchGame.tsx:1097)**
**Severity:** Low  
**Location:** `StickStretchGame.tsx`, line 1097  
**Issue:** The code accesses `d.speed` for parallax calculation, and while `DecorObject` interface includes `speed`, the usage in the parallax calculation could benefit from additional type safety.

**Impact:** Minor type safety concern, no runtime impact.

**Fix:** Ensure type safety is maintained throughout.

---

### 18. **Audio Context Cleanup (audio.ts)**
**Severity:** Low  
**Location:** `utils/audio.ts`  
**Issue:** The `cleanupAudio` function exists but is never called. Audio contexts and intervals might not be properly cleaned up on app unmount.

**Impact:** Potential memory leaks if audio resources aren't cleaned up.

**Fix:** Call `cleanupAudio` in App component's cleanup or on unmount.

---

### 19. **ESLint Disable Comment (StickStretchGame.tsx:438)**
**Severity:** Low  
**Location:** `StickStretchGame.tsx`, line 438  
**Issue:** There's an `eslint-disable-next-line react-hooks/exhaustive-deps` comment. While this might be intentional, it's worth reviewing if all dependencies are truly unnecessary.

**Impact:** Potential for missing dependency updates.

**Fix:** Review if the eslint disable is necessary or if dependencies should be added.

---

### 20. **getEffectiveCost Edge Case (MainMenu.tsx:68-71)**
**Severity:** Low  
**Location:** `components/MainMenu.tsx`, lines 68-71  
**Issue:** If `baseCost` is very small (e.g., 1-2), the 15% discount with `Math.max(1, ...)` might round incorrectly or produce unexpected results.

**Impact:** Very minor, might affect pricing display for very cheap items.

**Fix:** Ensure rounding logic handles edge cases properly.

---

## Recommendations

### Priority 1 (Fix Immediately)
1. Fix missing dependencies in `useEffect` and `useGameLoop` hooks (#1, #4)
2. Fix frame skipping logic (#3)
3. Fix duplicate notification logic (#2)

### Priority 2 (Fix Soon)
4. Improve platform finding logic (#5)
5. Fix breakable platform logic (#6)
6. Improve shuffle algorithm (#7)
7. Handle interstitial ad failures better (#12)

### Priority 3 (Nice to Have)
8. Improve code quality and remove redundancy (#16, #17, #19)
9. Add audio cleanup (#18)
10. Improve share functionality for native apps (#10, #11)

---

## Testing Recommendations

1. **Test on low-end devices** to verify frame skipping works correctly
2. **Test achievement unlocking** in various scenarios to ensure progress is tracked correctly
3. **Test breakable platforms** to ensure they break correctly in all cases
4. **Test ad failures** to ensure game state is handled correctly
5. **Test share functionality** in both web and native app contexts
6. **Test daily challenges** expiration and generation
7. **Test safety net boost** in various scenarios

---

## Notes

- Most bugs are non-critical and won't cause immediate crashes
- The codebase is generally well-structured
- Many issues are edge cases that might not occur in normal gameplay
- Some issues are code quality improvements rather than functional bugs

---

**End of Report**
