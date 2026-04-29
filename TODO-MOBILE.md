# SkyOwed — Mobile App Execution TODO

> **Audience:** A junior AI/dev executing tasks one at a time to ship SkyOwed as native iOS + Android apps.
>
> **Rules:**
> 1. Do ONE task at a time, top to bottom. Do not skip.
> 2. After each task, run the Verify step. If it fails, STOP and report.
> 3. Never invent APIs, env vars, or file paths not listed here.
> 4. Keep existing style: Next.js 14 App Router, TypeScript, Tailwind, path alias `@/*` -> `src/*`.
> 5. Add deps via `npm install <pkg>` — do not hand-edit `package.json` versions.
> 6. If a file exists, READ it first before editing.
> 7. **Stripe is explicitly OUT OF SCOPE for this file.** The web TODO handles that later.

---

## Project context (read before starting)

SkyOwed is a **dual-target** app:
- **Web**: Next.js site on Vercel (`skyowed.app`)
- **Mobile**: Same codebase wrapped with **Capacitor** into native iOS + Android apps

The core eligibility engine (`src/lib/eligibility.ts`) is pure TypeScript and runs **offline** — the mobile app does not need a backend to check if a flight is eligible for EU261/UK261 compensation.

### Existing assets (do not recreate)
- `capacitor.config.ts` — appId `com.skyowed.app`, webDir `out`, dark bg `#05060a`
- `src/lib/native.ts` — Capacitor bridge (haptics, status bar, splash, back button) already wraps everything in `isNative()` guards so web still works
- `src/components/NativeBridge.tsx` — mounted in `src/app/layout.tsx`, applies status bar theme + hides splash
- `NATIVE_PATCHES.md` — list of required Info.plist / AndroidManifest tweaks
- `MOBILE.md` — human-facing setup notes

### Target outcome
When every task in this file is ticked, running:
```bash
npm run cap:ios      # on macOS
npm run cap:android  # on any OS with Android Studio
```
opens the project in Xcode / Android Studio with a working app that:
1. Shows the splash screen for ~1.2s
2. Lets the user check EU261/UK261 eligibility **fully offline**
3. Feels native (haptics on interactions, dark status bar, safe areas respected)
4. Handles the hardware back button on Android
5. Supports a Pro mode toggle that unlocks the PDF letter (the real Stripe gate comes later in `TODO.md` Phase 2)

---

## Phases overview

- **PHASE M1** — Capacitor wiring (scripts, CLI, platforms)
- **PHASE M2** — Static export config + build pipeline
- **PHASE M3** — Assets (icon, splash, store screenshots)
- **PHASE M4** — Native project patches (Info.plist, AndroidManifest)
- **PHASE M5** — Mobile UX polish (safe areas, touch targets, keyboard)
- **PHASE M6** — Native interactions (haptics wiring, back button, deep links)
- **PHASE M7** — Offline-first behavior + local persistence
- **PHASE M8** — Pro flag handling (no Stripe yet — just plumbing)
- **PHASE M9** — Testing on simulators / emulators
- **PHASE M10** — Store listing + release prep

---

# PHASE M1 — CAPACITOR WIRING

## Task M1.1 — Add mobile build scripts to `package.json`

READ `package.json` first. Add inside `"scripts"`:

```json
"build:mobile": "cross-env BUILD_TARGET=mobile next build",
"cap:sync": "npm run build:mobile && npx cap sync",
"cap:ios": "npm run build:mobile && npx cap sync ios && npx cap open ios",
"cap:android": "npm run build:mobile && npx cap sync android && npx cap open android"
```

Install cross-env for Windows compatibility:
```bash
npm install --save-dev cross-env
```

**Verify:** `npm run build:mobile` produces an `out/` folder in repo root.

## Task M1.2 — Install Capacitor CLI + native platforms

```bash
npm install --save-dev @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

**Verify:** `npx cap --version` prints a version. CLI in devDependencies. ios/android in dependencies.

## Task M1.3 — Add iOS and Android native projects

> **STOP condition:** If user is on Windows and cannot do iOS, run only Android and note in `PROGRESS.md`.

```bash
npx cap add ios       # macOS + Xcode
npx cap add android   # JDK 17 + Android Studio
```

**Verify:**
- `ios/App/App.xcworkspace` exists (macOS only)
- `android/app/build.gradle` exists
- `npx cap doctor` is green

## Task M1.4 — Update `.gitignore` for native build artifacts

READ `.gitignore`. Append if missing:

```gitignore
ios/App/build/
ios/DerivedData/
android/.gradle/
android/app/build/
android/build/
android/local.properties
android/.idea/
*.iml
out/
```

**Verify:** `git status` after a build shows no `build/` or `out/` files as untracked.

---

# PHASE M2 — STATIC EXPORT + BUILD PIPELINE

## Task M2.1 — Confirm `next.config.mjs` handles mobile builds

READ `next.config.mjs`. It must contain:

```js
const isMobile = process.env.BUILD_TARGET === 'mobile';
const nextConfig = {
  reactStrictMode: true,
  ...(isMobile ? { output: 'export', images: { unoptimized: true }, trailingSlash: true } : {}),
};
export default nextConfig;
```

**Verify:** Both builds work:
- `npm run build` → `.next/` (server build)
- `npm run build:mobile` → `out/` (static export)

## Task M2.2 — Make API routes and server pages mobile-safe

The static export cannot ship API routes OR pages that use server-only APIs (`cookies()`, `headers()`, Supabase server client).

For `BUILD_TARGET=mobile`, these must be excluded. Strategy:

1. Create `src/lib/isMobileBuild.ts`:
```ts
export const IS_MOBILE_BUILD = process.env.BUILD_TARGET === 'mobile';
```

2. In `next.config.mjs`, when `isMobile`, add a webpack rule that replaces `src/app/api/**` and `src/middleware.ts` with empty modules. Simplest: add `rewrites` is not enough — use `exclude` via a custom config:

```js
if (isMobile) {
  nextConfig.pageExtensions = ['mobile.tsx', 'mobile.ts', 'tsx', 'ts'];
}
```
(This is a placeholder — actual fix in next task.)

3. For `src/middleware.ts`: wrap body in:
```ts
if (process.env.BUILD_TARGET === 'mobile') {
  export async function middleware() { return NextResponse.next(); }
  export const config = { matcher: [] };
}
```

Actual cleanest approach: use Next's `export const dynamic = 'force-static'` is not enough. Instead, delete or skip API routes via a pre-build script.

**Recommended implementation:** add a `scripts/mobile-prebuild.js` that temporarily renames `src/app/api` → `src/app/_api_disabled` before build, and a `mobile-postbuild.js` that reverses it.

**Verify:** `npm run build:mobile` completes with no "route handler" errors.

## Task M2.3 — Strip backend-dependent pages from mobile build

Pages that require a server (auth, dashboard, success, login, /auth/*) should redirect to a static "Visit skyowed.app to sign in" screen on mobile, OR be omitted.

Create `src/components/WebOnlyNotice.tsx`:
```tsx
'use client';
export default function WebOnlyNotice({ feature }: { feature: string }) {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">{feature} is available on the web</h1>
      <p className="mt-4 text-white/70">Open skyowed.app in your browser to use this feature.</p>
      <a href="https://skyowed.app" className="btn-primary mt-8 inline-block">Open SkyOwed on the web</a>
    </main>
  );
}
```

In each server-dependent page (`login/page.tsx`, `dashboard/page.tsx`, `success/page.tsx`, `auth/*`), add at top:
```ts
import { IS_MOBILE_BUILD } from '@/lib/isMobileBuild';
```
and if `IS_MOBILE_BUILD`, render `<WebOnlyNotice feature="Sign-in" />`.

**Verify:** Mobile build completes, and the exported pages show the notice instead of crashing.

---

# PHASE M3 — ASSETS (Icon, Splash, Store art)

## Task M3.1 — Produce the master icon and splash source files

Required source files in `resources/`:
- `resources/icon.png` — **1024×1024**, PNG, opaque. Plane silhouette on `#05060a` background, violet→cyan gradient accent matching the web (`from-violet-500 to-cyan-400`). No transparency.
- `resources/splash.png` — **2732×2732**, PNG. Logo centered in the middle ~30% of the canvas, `#05060a` background.
- `resources/icon-foreground.png` — **1024×1024**, PNG with transparency. Just the plane mark (for Android adaptive icons).

If source PSD / SVG does not exist, create SVGs in `resources/src/` and export to PNG with:
```bash
npx svgexport resources/src/icon.svg resources/icon.png 1024:1024
npx svgexport resources/src/splash.svg resources/splash.png 2732:2732
```

**Verify:** All three PNGs exist at the stated dimensions (`identify` or macOS Finder preview).

## Task M3.2 — Generate all required icon + splash sizes

Install:
```bash
npm install --save-dev @capacitor/assets
```

Run:
```bash
npx capacitor-assets generate --iconBackgroundColor "#05060a" --splashBackgroundColor "#05060a"
```

This produces all iOS AppIcon.appiconset slots and Android mipmap-* folders.

**Verify:**
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json` references real PNGs
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` exists
- `android/app/src/main/res/drawable/splash.png` exists

## Task M3.3 — Apple App Store screenshots (deferred to M10)

Note: do NOT produce store screenshots yet — wait until the app is running on a real simulator (Phase M9).

---

# PHASE M4 — NATIVE PROJECT PATCHES

READ `NATIVE_PATCHES.md` first — it contains the full reference.

## Task M4.1 — iOS Info.plist patches

Edit `ios/App/App/Info.plist`. Inside the root `<dict>`, add:

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
<key>UIRequiresFullScreen</key>
<false/>
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>
<key>UIViewControllerBasedStatusBarAppearance</key>
<true/>
<key>UISupportedInterfaceOrientations</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
</array>
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
  <string>UIInterfaceOrientationPortraitUpsideDown</string>
  <string>UIInterfaceOrientationLandscapeLeft</string>
  <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

Do NOT add any `NS*UsageDescription` keys — SkyOwed requests zero runtime permissions.

**Verify:** Open `ios/App/App.xcworkspace` in Xcode. Info tab shows the new keys. Build succeeds.

## Task M4.2 — Android manifest patches

Edit `android/app/src/main/AndroidManifest.xml`:

1. Add `xmlns:tools="http://schemas.android.com/tools"` to the root `<manifest>` tag if missing.
2. Add advertising-ID opt-out next to other `<uses-permission>`:
```xml
<uses-permission
    android:name="com.google.android.gms.permission.AD_ID"
    tools:node="remove" />
```
3. Inside `<activity android:name=".MainActivity" ... >`:
```xml
android:screenOrientation="portrait"
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
```

**Verify:** `./gradlew assembleDebug` from `android/` succeeds.

## Task M4.3 — Android build.gradle confirm

Edit `android/app/build.gradle` — confirm:
```gradle
defaultConfig {
  applicationId "com.skyowed.app"
  minSdkVersion 23
  targetSdkVersion 34
  compileSdkVersion 34
  versionCode 1
  versionName "1.0.0"
}

buildTypes {
  release {
    minifyEnabled true
    shrinkResources true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
  }
}
```

**Verify:** `./gradlew assembleRelease` produces a signed AAB candidate (unsigned for now).

---

# PHASE M5 — MOBILE UX POLISH

## Task M5.1 — Safe area insets

In `src/app/globals.css`, add:
```css
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
}
.safe-top    { padding-top: max(1rem, var(--sat)); }
.safe-bottom { padding-bottom: max(1rem, var(--sab)); }
```
Apply `safe-top` to the first `<main>` of every page and `safe-bottom` to `Footer`.

**Verify:** On iPhone 15 Pro simulator, no content hides under notch or home indicator.

## Task M5.2 — Touch targets >= 44x44 pt

Audit CheckForm, AirportCombobox, ResultCard, ThemeToggle, LanguageSwitcher, landing page CTAs. Minimum classes: `min-h-[44px] min-w-[44px] px-4`.

**Verify:** Manual tap test on iPhone SE simulator (smallest screen).

## Task M5.3 — Mobile keyboard & input hints

In `src/components/CheckForm.tsx`:
- Delay-hours input: `inputMode="numeric"`
- IATA inputs: `autoCapitalize="characters" autoCorrect="off" spellCheck={false}`
- All inputs: `enterKeyHint="next"` except the last which uses `"done"`.

**Verify:** iOS keyboard shows numeric pad for hours, caps lock for IATA.

## Task M5.4 — Disable text selection + overscroll bounce

In `src/app/globals.css`:
```css
html, body { overscroll-behavior-y: none; }
.no-select { -webkit-user-select: none; user-select: none; }
```
Apply `no-select` to buttons and nav items. Leave it off on result cards and letter previews so users can copy.

**Verify:** No rubber-band scroll past the top on iOS.

---

# PHASE M6 — NATIVE INTERACTIONS

READ `src/lib/native.ts` — all helpers exist and are web-safe.

## Task M6.1 — Wire haptics

In `CheckForm.tsx`:
- submit pressed → `hapticLight()`
- eligible result → `hapticSuccess()`
- not-eligible or error → `hapticError()`

In `ResultCard.tsx`: "Generate letter" → `hapticMedium()`.

**Verify:** Taptic fires on real iPhone. Web is silent and error-free.

## Task M6.2 — Android hardware back button

Create `src/components/BackButtonHandler.tsx` (client):
- On mount: `onBackButton(() => { if (history.length > 1) { history.back(); return true; } return false; })`
- Clean up on unmount.

Mount in `src/app/layout.tsx` next to `<NativeBridge />`.

**Verify:** On Android, pressing back goes one page up. At root, pressing back exits the app.

## Task M6.3 — External links open in system browser

Create helper in `src/lib/native.ts`:
```ts
export async function openExternal(url: string) {
  if (!(await isNative())) { window.open(url, '_blank'); return; }
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url });
}
```
Install: `npm install @capacitor/browser`.

Replace every `<a href="https://..." target="_blank">` with a button calling `openExternal(url)`. Affected: `Footer.tsx`, `Privacy`, `Terms`, `About`, `FAQ`.

**Verify:** Tapping external links opens SFSafariViewController (iOS) or Chrome Custom Tabs (Android), not a blank WebView.

## Task M6.4 — Network status awareness (optional)

Install: `npm install @capacitor/network`.

Add `src/components/OfflineBanner.tsx` (client):
- Listen to `Network.addListener('networkStatusChange', ...)`.
- Show a small banner when offline: "Offline — eligibility still works, PDFs require internet."

Mount in layout below `<NativeBridge />`.

**Verify:** Toggle airplane mode on simulator → banner appears/disappears.

---

# PHASE M7 — OFFLINE-FIRST + LOCAL PERSISTENCE

## Task M7.1 — Local claim history via Preferences API

The mobile app has no Supabase by default. Save checks locally.

Install: `npm install @capacitor/preferences`.

Create `src/lib/localClaims.ts`:
```ts
export type LocalClaim = {
  id: string; createdAt: string;
  depIata: string; arrIata: string; flightDate: string;
  eventType: string; eligible: boolean;
  amount?: number; currency?: string; jurisdiction?: string;
};
export async function saveLocalClaim(c: LocalClaim): Promise<void> { /* … */ }
export async function getLocalClaims(): Promise<LocalClaim[]> { /* … */ }
export async function deleteLocalClaim(id: string): Promise<void> { /* … */ }
```
Use `@capacitor/preferences` on native and `localStorage` fallback on web (so dev mode works).

**Verify:** Running a check on the simulator saves it. Restarting the app shows it on the history screen.

## Task M7.2 — "History" tab on mobile

Create `src/app/history/page.tsx` (client):
- Load `getLocalClaims()` on mount.
- Render a list with date, route, eligibility, amount.
- Tap row → expand with "Copy letter" button (uses the offline `buildLetter()` from `src/lib/letter.ts`).
- Empty state: "No checks yet. Try your first one!" with CTA back to `/`.

Add a bottom tab bar (mobile only) with Home / History tabs, rendered only when `await isNative()` is true. Use `safe-bottom` class.

**Verify:** History screen lists past checks; tapping shows the saved letter.

## Task M7.3 — "Share" the letter natively

Install: `npm install @capacitor/share`.

In `ResultCard.tsx`, add a "Share letter" button next to "Copy":
```ts
import { Share } from '@capacitor/share';
await Share.share({ title: 'My claim letter', text: letterText });
```
Wrap in `isNative()` so web falls back to clipboard copy.

**Verify:** iOS/Android share sheet opens with the letter text.

---

# PHASE M8 — PRO FLAG PLUMBING (no Stripe yet)

## Task M8.1 — Local "isPro" flag

Create `src/lib/pro.ts`:
```ts
export async function isPro(): Promise<boolean>
export async function setPro(v: boolean): Promise<void>
```
Backs to `@capacitor/preferences` on native, `localStorage` on web.

**Verify:** Calling `setPro(true)` then `isPro()` returns true across app restarts.

## Task M8.2 — Hidden "Unlock Pro" dev toggle

Create `src/app/dev/pro/page.tsx` (client):
- Only visible when `NEXT_PUBLIC_ALLOW_DEV_PRO === '1'` OR on native debug builds.
- Two buttons: "Set Pro = true" and "Set Pro = false".

This lets us test Pro flows before Stripe is wired.

**Verify:** Toggling the flag shows/hides the PDF download button in `ResultCard`.

## Task M8.3 — Gate the PDF letter behind `isPro`

In `ResultCard.tsx`:
- If `await isPro()` → show "Download PDF letter" button.
- Else → show "Unlock Pro — €6.99" button that navigates to `/upgrade`.

Create `src/app/upgrade/page.tsx`:
- On **native**: render "Upgrade is coming soon. For now, visit skyowed.app on the web to upgrade." with an `openExternal('https://skyowed.app/upgrade')` button.
- On **web**: render the Stripe flow placeholder (real flow added in `TODO.md` Phase 2).

**Verify:** Free user sees "Unlock Pro". After `setPro(true)`, the PDF button appears and produces a letter.

## Task M8.4 — Offline PDF generation on mobile

`src/lib/pdf.ts` uses `pdf-lib` which is pure JS → works in the WebView.

Add a helper `src/lib/pdfDownload.ts`:
- On web: `URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))` + anchor click.
- On native: write bytes to `Filesystem.writeFile({ path: 'SkyOwed-<flight>.pdf', data: base64, directory: Directory.Documents })`, then `FileOpener.open(...)`.

Install: `npm install @capacitor/filesystem`, `npm install @capacitor-community/file-opener`.

**Verify:** On iOS, tapping "Download PDF" saves the file and opens the Files app. On Android, the PDF appears in Downloads.

---

# PHASE M9 — SIMULATOR / EMULATOR TESTING

## Task M9.1 — iOS simulator smoke test (macOS only)

```bash
npm run cap:ios
```
In Xcode: choose "iPhone 15 Pro" simulator → Run.

Checklist:
- [ ] Splash screen shows for ~1.2s, then fades to home.
- [ ] Safe areas respected on notch and home indicator.
- [ ] Enter LHR → CDG, 4h delay, DELAYED → see eligible result.
- [ ] Haptics fire (if Mac has Taptic Trackpad it mirrors; otherwise use real device).
- [ ] Generate letter → PDF opens in Files app (after M8.4).
- [ ] History screen lists the check.
- [ ] External link (Privacy) opens in SFSafariViewController.

**Verify:** All checklist items pass.

## Task M9.2 — Android emulator smoke test

```bash
npm run cap:android
```
In Android Studio: choose "Pixel 7 / API 34" → Run.

Checklist:
- [ ] Splash shows, fades to home.
- [ ] Hardware back button navigates correctly.
- [ ] Status bar is dark, icons light.
- [ ] Eligibility flow works offline (toggle airplane mode in emulator).
- [ ] PDF saves to Downloads.
- [ ] External links open in Chrome Custom Tab.

**Verify:** All checklist items pass.

## Task M9.3 — Real-device test

Install via cable:
- iOS: Xcode → Run on device (requires free Apple ID for sideload, or dev account).
- Android: `./gradlew installDebug` from `android/` with phone in USB debug mode.

Repeat the checklists from M9.1 / M9.2 on real hardware. Record any glitches in `PROGRESS.md`.

**Verify:** One full happy-path flow completed on both platforms.

---

# PHASE M10 — STORE RELEASE PREP

## Task M10.1 — App Store listing metadata

READ `STORE_LISTING.md` first. Fill remaining blanks.

- App name: SkyOwed
- Subtitle (30 chars): Flight compensation checker
- Primary category: Travel
- Age rating: 4+
- Keywords: flight,delay,compensation,EU261,UK261,refund,claim
- Support URL: https://skyowed.app/support
- Privacy URL: https://skyowed.app/privacy

**Verify:** `STORE_LISTING.md` has no TODO markers.

## Task M10.2 — Screenshots

Using iPhone 15 Pro Max (6.7") simulator, capture 5 screenshots:
1. Home with empty form
2. Filled form
3. Eligible result
4. Letter preview
5. History screen

Save to `resources/screenshots/ios-6.7/1..5.png`. Repeat for Pixel 7 Pro → `resources/screenshots/android/`.

**Verify:** 5 screenshots per platform at required dimensions.

## Task M10.3 — Privacy declarations

SkyOwed mobile collects nothing. Declare:
- App Store Connect → App Privacy → "Data Not Collected"
- Play Console → Data Safety → "No data collected, no data shared"

**Verify:** Both declarations saved.

## Task M10.4 — Android signing keystore

```bash
keytool -genkey -v -keystore skyowed-upload.keystore -alias skyowed -keyalg RSA -keysize 2048 -validity 10000
```
Add to `~/.gradle/gradle.properties`:
```
SKYOWED_UPLOAD_STORE_FILE=/absolute/path/skyowed-upload.keystore
SKYOWED_UPLOAD_KEY_ALIAS=skyowed
SKYOWED_UPLOAD_STORE_PASSWORD=...
SKYOWED_UPLOAD_KEY_PASSWORD=...
```
Edit `android/app/build.gradle` `signingConfigs`.

**Verify:** `./gradlew bundleRelease` → signed `app-release.aab`.

## Task M10.5 — iOS archive

Xcode: Product → Archive → Distribute → App Store Connect → TestFlight.

**Verify:** TestFlight build "Ready to test".

## Task M10.6 — Final checklist

Walk `plan/15_checklists/PRE_LAUNCH.md`. Tick mobile items or defer in `PROGRESS.md`.

**Verify:** All items ticked or deferred.

---

# File map — what this TODO will touch

**Create:**
- `src/lib/isMobileBuild.ts`, `src/lib/localClaims.ts`, `src/lib/pro.ts`, `src/lib/pdfDownload.ts`
- `src/components/WebOnlyNotice.tsx`, `src/components/BackButtonHandler.tsx`, `src/components/OfflineBanner.tsx`
- `src/app/history/page.tsx`, `src/app/upgrade/page.tsx`, `src/app/dev/pro/page.tsx`
- `resources/icon.png`, `resources/splash.png`, `resources/icon-foreground.png`
- `ios/`, `android/` (generated by `npx cap add`)

**Modify:**
- `package.json`, `.gitignore`, `next.config.mjs`
- `src/app/globals.css`, `src/app/layout.tsx`
- `src/lib/native.ts` (add `openExternal`)
- `src/components/CheckForm.tsx`, `src/components/ResultCard.tsx`, `src/components/Footer.tsx`
- `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/success/page.tsx`, `src/app/auth/*`
- `src/middleware.ts`
- `ios/App/App/Info.plist`, `android/app/src/main/AndroidManifest.xml`, `android/app/build.gradle`

---

# Stop conditions

Stop and ask the human if:
- Any `npm install` fails repeatedly
- `npx cap add ios` or `add android` requires a missing SDK
- A native build fails with an error not covered in this file
- A file says to CREATE already exists with non-trivial content
- An asset (icon/splash source) is missing and cannot be generated

---

# What is explicitly OUT OF SCOPE here

- Stripe checkout, webhook, paywall enforcement — see `TODO.md` Phase 2
- Gmail scan integration — see `TODO.md` Phase 5.2
- AviationStack flight lookup — see `TODO.md` Phase 5.1
- Analytics (Plausible) — web only
- Sentry — web only
- CI/CD — see `TODO.md` Phase 6.2

When all of PHASE M1 → M10 are done, the app runs on both iOS and Android with full eligibility + offline PDF + history + Pro flag plumbing. Only the Stripe unlock flow remains before a real store submission.

