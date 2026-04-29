# SkyOwed Mobile Progress

## Done
- BUG-1 to BUG-9: All critical bugs fixed
- M6: Haptics, BackButtonHandler, OfflineBanner, openExternal
- M7.2/M7.3: History page, share button, bottom tabs
- M8: Pro flag, upgrade page, dev toggle, pdfDownload
- M4: Android manifest + build.gradle hardened

## Remaining
### M3 — Assets
Run: `node scripts/generate-assets.js` then `npx capacitor-assets generate`

### M9 — Android Testing
Run: `npm run cap:sync` then `cd android && .\gradlew assembleDebug`

### M10 — Store Prep
Run: `scripts/generate-keystore.ps1` then configure signing in build.gradle
