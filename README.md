# Stick Stretch Path Game

A fun and addictive stick-stretching game built with React and TypeScript.

## Features

- Smooth gameplay with touch and mouse controls
- Mobile-friendly design
- Score tracking and coin system
- Multiple character skins
- Google AdMob integration (Capacitor native bridge with test IDs)

## Run Locally

**Prerequisites:** Node.js

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

1. Generate the latest web assets:
   ```bash
   npm run build
   ```
2. Sync the Capacitor Android project so it pulls the fresh build and plugin updates:
   ```bash
   npx cap sync android
   ```
3. Open `android/` in Android Studio, let Gradle finish syncing, and run on a device/emulator that has Play Services.
4. Test ads are already configured with Google’s sample AdMob IDs for compliance. Replace the IDs in `utils/ads.ts` before going to production.
5. For release builds, create a signing config in Android Studio, generate an `AAB`, and upload it to the Play Console.

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
