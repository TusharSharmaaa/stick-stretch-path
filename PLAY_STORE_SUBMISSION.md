# Play Store Submission Checklist

## ✅ Pre-Submission Requirements

### 1. **Signing Configuration** ⚠️ REQUIRED
Your app MUST be signed with a release keystore to upload to Play Store.

#### Steps to create a keystore:
```bash
cd android/app
keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** 
- Save the keystore file securely (you'll need it for all future updates)
- Remember your passwords and alias name
- DO NOT lose this keystore - you cannot update your app without it!

#### Configure signing:
1. Copy `android/keystore.properties.example` to `android/keystore.properties`
2. Edit `keystore.properties` with your actual values:
   ```
   storeFile=../app/release.keystore
   storePassword=your_actual_password
   keyAlias=release
   keyPassword=your_actual_password
   ```
3. Add `keystore.properties` to `.gitignore` (never commit it!)

### 2. **AdMob Configuration** ⚠️ REQUIRED
Currently your app is in **TEST MODE**. You MUST switch to production IDs.

#### Steps:
1. Go to [AdMob Console](https://admob.google.com)
2. Create your app (if not already created)
3. Create ad units:
   - Banner Ad
   - Interstitial Ad
   - Rewarded Ad
4. Copy your production IDs
5. Edit `utils/ads.ts`:
   - Set `AD_TESTING_MODE = false`
   - Replace the placeholder IDs in `PRODUCTION_ADMOB_IDS` with your real IDs

### 3. **Build Release AAB** ✅ Ready
Your build.gradle is configured. To build:

```bash
# 1. Build your web assets
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Build the AAB (Android App Bundle)
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. **Version Management** ✅ Ready
- Current: `versionCode 1`, `versionName "1.0"`
- For future updates, increment both:
  - `versionCode`: Always increment (1, 2, 3, ...)
  - `versionName`: User-visible version (1.0, 1.1, 2.0, ...)

### 5. **App Icons & Assets** ✅ Ready
Your app has icons configured in:
- `android/app/src/main/res/mipmap-*/`

### 6. **Privacy Policy & Terms** ✅ Ready
You have:
- `public/privacy-policy.html`
- `public/terms.html`

**Action Required:** 
- Host these files online (GitHub Pages, Firebase Hosting, etc.)
- Add the URLs to your Play Console listing

### 7. **Target SDK** ✅ Ready
- Target SDK: 35 (Android 15) ✅
- Min SDK: 23 (Android 6.0) ✅
- Both meet Play Store requirements

## 📋 Play Console Checklist

### Before Upload:
- [ ] Keystore created and configured
- [ ] AdMob switched to production IDs
- [ ] Release AAB built successfully
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready

### Play Console Setup:
- [ ] Create app in Play Console
- [ ] Fill in app details:
  - [ ] App name: "Stick Stretch Path"
  - [ ] Short description (80 chars)
  - [ ] Full description (4000 chars)
  - [ ] App icon (512x512 PNG)
  - [ ] Feature graphic (1024x500 PNG)
  - [ ] Screenshots (at least 2, up to 8)
  - [ ] Phone screenshots (required)
  - [ ] Tablet screenshots (optional but recommended)
- [ ] Set content rating
- [ ] Set up pricing (Free/Paid)
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Complete data safety form
- [ ] Set up app access (if restricted)

### Upload & Release:
- [ ] Upload AAB to Internal Testing track (test first!)
- [ ] Test the uploaded build thoroughly
- [ ] Upload to Production track
- [ ] Complete store listing
- [ ] Submit for review

## 🚨 Common Issues

### Issue: "App not signed"
**Solution:** Make sure `keystore.properties` exists and is correctly configured

### Issue: "AdMob test ads in production"
**Solution:** Set `AD_TESTING_MODE = false` and use production AdMob IDs

### Issue: "Privacy policy required"
**Solution:** Host your privacy policy online and add the URL in Play Console

### Issue: "Target SDK too old"
**Solution:** Already configured correctly (SDK 35)

## 📝 Quick Commands

```bash
# Build web assets
npm run build

# Sync Capacitor
npx cap sync android

# Build release AAB
cd android && ./gradlew bundleRelease

# Build release APK (for testing, not for Play Store)
cd android && ./gradlew assembleRelease
```

## ⚠️ Important Notes

1. **Keystore Security**: Never commit your keystore or keystore.properties to git
2. **AdMob**: Test ads are not allowed in production - switch before release
3. **Version Code**: Must always increment for each upload
4. **Testing**: Always test in Internal Testing track before Production
5. **Review Time**: First submission can take 1-7 days for review

## ✅ Ready Status

- ✅ Build configuration: Ready
- ✅ Signing setup: **Needs keystore creation**
- ✅ AdMob: **Needs production IDs**
- ✅ Privacy/Terms: **Needs hosting URLs**
- ✅ SDK versions: Ready
- ✅ Icons: Ready

**You're almost ready!** Complete the items marked with ⚠️ and you can upload to Play Store.


