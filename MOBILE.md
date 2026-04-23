# SkyOwed — iOS & Android apps

The same Next.js site is packaged as native iOS and Android apps via [Capacitor](https://capacitorjs.com). Web code is unchanged — the site is compiled to a static bundle and wrapped in a native shell.

## One-time setup
```bash
npm install
npx cap add ios       # requires macOS + Xcode
npx cap add android   # requires Android Studio + JDK 17
```

## Build & run
```bash
npm run build        # outputs ./out (static)
npx cap sync         # copies web bundle into ios/ and android/
npx cap open ios     # opens Xcode — press Run
npx cap open android # opens Android Studio — press Run
```

## Release
- **iOS:** Xcode → Product → Archive → Distribute to App Store Connect. Needs Apple Developer ($99/yr).
- **Android:** Android Studio → Build → Generate Signed Bundle (AAB) → upload to Play Console ($25 one-time).

## Metadata
- App ID: `com.skyowed.app` (permanent once submitted)
- App name: SkyOwed
- Background / splash: `#05060a`

## Icons & splash
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#05060a' --splashBackgroundColor '#05060a'
```
Requires `resources/icon.png` (1024×1024) + `resources/splash.png` (2732×2732).

## Notes
- `/opengraph-image` runs only on web; native bundles static HTML from `./out`.
- localStorage (theme + prefs) works identically in the Capacitor WebView.
- Form + eligibility logic run offline — no server needed inside the app.
