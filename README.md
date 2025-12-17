# Stick Stretch Path Game

A fun and addictive stick-stretching game built with React and TypeScript. Ready for Google Play Console release!

## Features

- 🎮 Smooth gameplay with touch and mouse controls
- 📱 Mobile-first design with performance optimizations
- 🏆 Score tracking, achievements, and daily challenges
- 🎨 Multiple character skins with rarity system
- 💰 Coin system with shop and boosts
- 📺 Google AdMob integration (banner, interstitial, rewarded)
- 🔒 Privacy Policy and Terms & Conditions included

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   - Local: `http://localhost:3000`
   - Mobile (same network): `http://YOUR_IP_ADDRESS:3000`

## Build for Production

```bash
npm run build
```

## Android (Google Play) Build

### Development/Testing Build

1. Generate the latest web assets:
   ```bash
   npm run build
   ```

2. Sync the Capacitor Android project:
   ```bash
   npx cap sync android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

4. Run on device/emulator with Play Services

### Production Release Build

Before publishing to Google Play Console:

1. **Update AdMob IDs** in `utils/ads.ts`:
   ```typescript
   // Change this:
   export const AD_TESTING_MODE = true;
   // To this:
   export const AD_TESTING_MODE = false;
   
   // Replace placeholder IDs with your real AdMob IDs:
   const PRODUCTION_ADMOB_IDS = {
     APP_ID: 'ca-app-pub-YOUR_APP_ID',
     BANNER: 'ca-app-pub-YOUR_BANNER_ID',
     INTERSTITIAL: 'ca-app-pub-YOUR_INTERSTITIAL_ID',
     REWARDED: 'ca-app-pub-YOUR_REWARDED_ID',
   };
   ```

2. **Update Android strings.xml** (`android/app/src/main/res/values/strings.xml`):
   ```xml
   <string name="admob_app_id">ca-app-pub-YOUR_PRODUCTION_APP_ID</string>
   ```

3. **Build and sync**:
   ```bash
   npm run build
   npx cap sync android
   ```

4. **Create signed release** in Android Studio:
   - Build → Generate Signed Bundle/APK
   - Choose Android App Bundle (AAB)
   - Create or use existing keystore
   - Select release build variant

5. **Upload to Play Console**:
   - Create new app in Google Play Console
   - Upload AAB file
   - Complete store listing with screenshots
   - Fill out Data Safety form (see below)
   - Submit for review

### Data Safety Form (Google Play Console)

When filling out the Data Safety form:

| Question | Answer |
|----------|--------|
| Does your app collect data? | Yes |
| Data types collected | Device identifiers (via AdMob) |
| Is data encrypted in transit? | Yes |
| Can users request data deletion? | Yes (clear app data/uninstall) |
| Data shared with third parties? | Yes (AdMob for advertising) |

## Legal Pages

The following legal pages are included in `/public/`:

- **Privacy Policy**: `/privacy-policy.html`
- **Terms & Conditions**: `/terms.html`

These are accessible both in-app (via Settings) and as standalone pages.

## Project Structure

```
├── android/           # Capacitor Android project
├── components/        # React components
│   ├── StickStretchGame.tsx  # Main game logic
│   ├── MainMenu.tsx          # Menu system
│   ├── GameOver.tsx          # Game over screen
│   └── ErrorBoundary.tsx     # Error handling
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
│   ├── ads.ts         # AdMob configuration
│   ├── nativeAds.ts   # Native ad implementation
│   ├── audio.ts       # Sound effects
│   └── storage.ts     # Local storage
├── public/            # Static assets
│   ├── privacy-policy.html
│   └── terms.html
├── constants.ts       # Game constants
└── types.ts           # TypeScript types
```

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Capacitor (Android wrapper)
- @capacitor-community/admob
- Lucide React (icons)

## License

All rights reserved. See Terms & Conditions for usage.
