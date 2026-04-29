# SkyOwed Mobile — Post-Audit Status & Next-Step Guide (rev 3)

> **For the next AI/dev:** This file is the rolling delta against `TODO-MOBILE.md`. It is the **third pass** — BUG-1..BUG-9 from rev 1 and BUG-10..BUG-17 from rev 2 have landed and are verified. Read this **before** touching code.
>
> **Golden rules (do not violate):**
> 1. Read the file you are about to edit BEFORE editing. No blind writes.
> 2. Web build (`npm run build`) and mobile build (`npm run build:mobile`) must BOTH keep working after every change.
> 3. Never call `fetch('/api/...')` from a component on mobile — there are no API routes in the static export. Use the pure helpers in `src/lib/` directly.
> 4. Every native call must be guarded with `await isNative()` (see `src/lib/native.ts`). Web must remain a no-op fallback.
> 5. No Stripe work here. `isPro` is just a local boolean for now.
> 6. The user is on **Windows**. iOS tasks are blocked until a Mac is available — skip them and note in `PROGRESS.md`.

---

## 0. TL;DR — what changed since rev 2

All BUG-10 through BUG-17 are fixed. Mobile build + tests are **verified green**:

```
npm run build:mobile   →  out/index.html generated, 21 static pages, 0 errors
npm test               →  8/8 pass on Node 21 via tsx
git status             →  no _api_disabled / _auth_disabled / _middleware.ts left over
```

Phases M1–M8 are functionally complete on Android. Remaining work is **BUG-18 (manual `gradlew assembleDebug` verification)**, **M9 (device testing)**, **M10 (store prep)**, and iOS (deferred to Mac).

---

## 1. Verified state of each phase

### PHASE M1 — Capacitor wiring — **DONE (Android), iOS blocked**
- `package.json` has `build:mobile`, `build:mobile:inner`, `cap:sync`, `cap:ios`, `cap:android`. ✅
- All Capacitor deps installed (core, cli, ios, android, app, browser, filesystem, haptics, network, preferences, share, splash-screen, status-bar, file-opener, assets). ✅
- `android/` exists, `npx cap add android` succeeded. ✅
- `ios/` — **NOT added** (Windows machine). Resume on Mac.
- `.gitignore` covers `out/`, `ios/App/build/`, `ios/DerivedData/`, `android/.gradle/`, `android/app/build/`, `android/build/`, `android/local.properties`, `android/.idea/`, `*.iml`. ✅

### PHASE M2 — Static export — **DONE & VERIFIED**
- `next.config.mjs` toggles `output:'export'` when `BUILD_TARGET=mobile`. ✅
- `src/lib/isMobileBuild.ts` exists. ✅
- `scripts/mobile-prebuild.js` does **defensive restore** of orphaned `_*_disabled` paths before renaming (BUG-9 fixed). ✅
- `scripts/mobile-postbuild.js` restores after build. ✅
- `cross-env` propagation through `npm run` chain works on Windows pwsh — confirmed by `out/index.html` being generated end-to-end (BUG-8 closed). ✅
- `WebOnlyNotice.tsx` rendered by `login`, `dashboard`, `success` when `IS_MOBILE_BUILD`. ✅

> ⚠️ **Operational note:** never commit while `_api_disabled`, `_auth_disabled`, or `_middleware.ts` exist. The pre/postbuild pair handles them automatically; if you Ctrl-C mid-build, just re-run `npm run build:mobile` — the prebuild defensive restore cleans up.

### PHASE M3 — Assets — **DONE**
- `resources/src/icon.svg` and `resources/src/splash.svg` — present, branded violet→cyan plane on `#05060a`. ✅
- `resources/icon.png` (33 KB) — present. ✅
- `resources/splash.png` (185 KB) — present. ✅
- `resources/icon-foreground.png` (1024×1024 transparent) — generated from SVG via sharp. ✅
- `npx capacitor-assets generate --iconBackgroundColor "#05060a" --splashBackgroundColor "#05060a"` — **run successfully** (105 Android assets, 1.04 MB total). ✅
- Android `mipmap-*/ic_launcher.png` now shows branded plane, not default Capacitor logo. ✅

### PHASE M4 — Native patches — **DONE (Android)**
- `android/app/src/main/AndroidManifest.xml`:
  - `xmlns:tools` on `<manifest>`. ✅
  - `<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />`. ✅
  - `MainActivity` has `screenOrientation="portrait"` and full `configChanges`. ✅
- `android/app/build.gradle`:
  - `versionName "1.0.0"`, `versionCode 1`. ✅
  - `release { minifyEnabled true; shrinkResources true; proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro' }`. ✅
- `android/variables.gradle`: `minSdkVersion 23`, `compileSdkVersion 34`, `targetSdkVersion 34`. ✅
- iOS Info.plist — N/A (no iOS platform yet).

### PHASE M5 — Mobile UX polish — **DONE**
- `globals.css`: safe-area vars + applied; `overscroll-behavior-y: none`; `user-select: none` w/ overrides for inputs/textareas/contenteditable; `min-height: 44px` on `button, a, label`; inputs forced to `font-size: 16px`. ✅
- `CheckForm.tsx`: delay-hours uses `inputMode="numeric"`, `enterKeyHint="next"`; date input has `enterKeyHint="next"`. ✅
- `AirportCombobox.tsx`: `autoCapitalize="characters"`, `autoCorrect="off"`, `spellCheck={false}`, `enterKeyHint="next"`. ✅
- `viewport.userScalable: true` (BUG-6 fixed). ✅

### PHASE M6 — Native interactions — **DONE**
- `src/lib/native.ts`: `hapticLight/Medium/Success/Error`, `applyStatusBarTheme`, `hideSplash`, `onBackButton`, **`openExternal`**. ✅
- `src/components/BackButtonHandler.tsx` — created and mounted in `layout.tsx`. ✅
- Haptics wired in `CheckForm.tsx` (light on submit, success/error on result, error on throw). ✅
- Haptics wired in `ResultCard.tsx` (medium on letter toggle / share). ✅
- `OfflineBanner.tsx` — mounted in `layout.tsx`, falls back to `online`/`offline` events on web. ✅
- Splash hide delay = 1200 ms (BUG-5 fixed). ✅
- `Footer.tsx` — only has internal `<a>` to `/privacy`, `/terms` and `mailto:` so no `openExternal` migration needed; if you ever add a real external URL, route it through `openExternal`.

### PHASE M7 — Offline + persistence — **DONE**
- `src/lib/localClaims.ts` — Preferences (native) / localStorage (web), capped at 100 entries. ✅
- `CheckForm.tsx` calls `saveLocalClaim(...)` after every **eligible** check (BUG-3 fixed). ✅
- `flightDate` is collected from a real `<input type="date">` in `CheckForm` (BUG-4 fixed). ✅
- `src/app/history/page.tsx` — list, empty state, delete. ✅
- `src/components/BottomTabs.tsx` — Home / History tabs, native-only via `await isNative()`. ✅ Mounted globally in `layout.tsx`.
- Share button in `ResultCard.tsx` — uses `@capacitor/share` on native, falls back to `navigator.share`, then clipboard, then mailto. ✅

### PHASE M8 — Pro flag plumbing — **DONE**
- `src/lib/pro.ts` — `isPro()` / `setPro()` (Preferences + localStorage). ✅
- `src/app/dev/pro/page.tsx` — gated by `NEXT_PUBLIC_ALLOW_DEV_PRO === '1'`. ✅
- `src/app/upgrade/page.tsx` — native: web-redirect via `openExternal`; web: placeholder. ✅
- `src/lib/pdfDownload.ts` — Filesystem + FileOpener on native, Blob anchor on web. ✅
- `ResultCard.tsx` gates letter/PDF behind `await isPro()`. ✅
- `ResultCard.tsx` calls `buildLetter()` from `src/lib/letter.ts` with real passenger inputs. ✅
- `ResultCard.tsx` has Download-PDF button calling `buildPdf()` → `downloadPdf()`. ✅

### PHASE M9 — Simulator/emulator testing — **NOT STARTED**
### PHASE M10 — Store release prep — **NOT STARTED**

---

## 2. Open issues / remaining bugs (rev 2)

### BUG-10 — `ResultCard` letter wired to `buildLetter()` ✅
**File:** `src/components/ResultCard.tsx`.
**Fix applied:** Imported `buildLetter` from `@/lib/letter`. Added an expandable form collecting passenger name, address, booking ref, airline name and IBAN. Real route/date/jurisdiction/amount/currency are passed via the result object.
> **Fix (rev 3):** Added `arrivalDelayHours` prop to `ResultCard` and pass it from `CheckForm` so `letter.ts` template doesn't render "undefined hours late" for delayed flights.

### BUG-11 — `ResultCard` gates letter/PDF behind `isPro()` ✅
**File:** `src/components/ResultCard.tsx`.
**Fix applied:** On mount calls `isPro().then(setPro)`. Non-Pro users see a Pro upsell with a `<Link href="/upgrade">Unlock Pro — €6.99</Link>` instead of the letter form.

### BUG-12 — Download-PDF button wired ✅
**File:** `src/components/ResultCard.tsx`.
**Fix applied:** Added a **Download PDF** button (Pro-only, shown after letter is generated) that calls `buildPdf(letterText, ...)` → `downloadPdf(bytes, 'SkyOwed-claim-letter.pdf')`.

### BUG-13 — `BottomTabs` moved to `layout.tsx` ✅
**Fix applied:** `<BottomTabs />` now mounts once in `src/app/layout.tsx` next to `<OfflineBanner />`. Removed the per-page mounts from `src/app/page.tsx` and `src/app/history/page.tsx`. Component still self-hides on web via `isNative()`.

### BUG-14 — Share uses `@capacitor/share` ✅
**File:** `src/components/ResultCard.tsx`.
**Fix applied:** `handleShare()` now does `if (await isNative()) { const { Share } = await import('@capacitor/share'); await Share.share(...) }` then falls back to `navigator.share`, then clipboard, then mailto.

### BUG-15 — `resources/icon-foreground.png` generated ✅
**Fix applied:** Created `resources/icon-foreground.svg` (transparent plane mark) and rendered it to `resources/icon-foreground.png` at 1024×1024 via sharp.

### BUG-16 — `capacitor-assets generate` run ✅
**Fix applied:** Ran `npx capacitor-assets generate --iconBackgroundColor "#05060a" --splashBackgroundColor "#05060a"`. 105 Android assets written (1.04 MB). `mipmap-*/ic_launcher*.png` now show the branded plane.

### BUG-17 — `npm test` fixed for Node 21 ✅
**File:** `package.json:12`.
**Problem:** Script used `node --test --experimental-strip-types ...`. Node 21 does not accept `--experimental-strip-types` (added in Node 22.6+).
**Fix applied:** Added `tsx` to devDependencies and changed test script to `npx tsx --test src/lib/eligibility.test.ts src/lib/airlines.test.ts`. Verified green: 8/8 tests pass.

### BUG-18 — `assembleDebug` requires manual verification
**Status:** Code changes complete; build environment ready (JDK 23 installed, Gradle 8.2.1 downloaded). Build must be run manually due to tooling limitations.
**Manual steps:**
```pwsh
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
cd C:\Users\wajih\OneDrive\Bureau\app\skyowed\android
.\gradlew.bat assembleDebug
```
If R8 strips Capacitor reflection-loaded plugins, add `-keep class com.getcapacitor.** { *; }` to `android/app/proguard-rules.pro`.

### BUG-19 — Splash race on slow devices (polish, not blocker)
**File:** `src/components/NativeBridge.tsx:13`.
**Problem:** `setTimeout(..., 1200)` is a fixed timer regardless of paint. On slow devices the JS may not have painted yet → 1.2 s of black before content appears.
**Fix (later):** call `hideSplash()` after first paint with a 1200 ms minimum floor.

---

## 3. Recommended order of work (remaining)

Steps 1–3 from rev 2 are all done. Pick up from Step 4.

### Step 4 — Android emulator smoke test (BUG-18 + M9.2)
```pwsh
npm run cap:sync
cd android ; .\gradlew assembleDebug ; cd ..
npm run cap:android
```
In Android Studio open Pixel 7 / API 34 and walk the M9.2 checklist:
- splash → home
- back button navigates / exits at root
- LHR → CDG, 4 h delay, DELAYED → eligible result
- airplane mode toggled → `OfflineBanner` appears, eligibility still works
- saved check appears in History
- Download PDF lands in Downloads
- external links open in Chrome Custom Tab

Document blockers in `PROGRESS.md`.

### Step 5 — M10 store prep (Android only on Windows)
1. `scripts/generate-keystore.ps1` (already in repo).
2. Add `signingConfigs.release` to `android/app/build.gradle` referencing the keystore via `~/.gradle/gradle.properties`.
3. `cd android ; .\gradlew bundleRelease` → upload `app-release.aab` to Play Console internal testing.
4. Fill `STORE_LISTING.md`, capture Pixel 7 Pro screenshots, declare "No data collected" in Data Safety.
5. Defer iOS (M10.5) until Mac access.

---

## 4. Files you will create

| Path | Purpose | Phase |
| --- | --- | --- |
| `resources/icon-foreground.png` | Android adaptive icon foreground | M3 |
| (optional) `src/app/letter/page.tsx` | passenger-detail form + full localized letter | M8 |

## 5. Files you will modify

| Path | Why |
| --- | --- |
| `src/components/ResultCard.tsx` | wire `buildLetter`, gate behind `isPro`, add Download-PDF, switch share to `@capacitor/share` (BUG-10, 11, 12, 14) |
| `src/app/layout.tsx` | mount `<BottomTabs />` here (BUG-13) |
| `src/app/page.tsx`, `src/app/history/page.tsx` | remove per-page `<BottomTabs />` (BUG-13) |
| `package.json` | bump engines to Node ≥22.6 OR rework test script (BUG-17) |
| `android/app/proguard-rules.pro` | add `-keep class com.getcapacitor.** { *; }` if R8 strips plugins |
| `android/app/build.gradle` | add `signingConfigs.release` for M10 |

## 6. Files that already look good — do not touch unless necessary

`src/lib/native.ts`, `src/lib/localClaims.ts`, `src/lib/pro.ts`, `src/lib/pdfDownload.ts`, `src/lib/isMobileBuild.ts`, `src/components/NativeBridge.tsx`, `src/components/BackButtonHandler.tsx`, `src/components/OfflineBanner.tsx`, `src/components/BottomTabs.tsx`, `src/components/WebOnlyNotice.tsx`, `scripts/mobile-prebuild.js`, `scripts/mobile-postbuild.js`, `next.config.mjs`, `android/app/src/main/AndroidManifest.xml`, `android/app/build.gradle` (build types section), `android/variables.gradle`.

---

## 7. Verification commands (Windows pwsh)

```pwsh
# Web build (must stay green)
npm run build

# Mobile static export — VERIFIED GREEN as of rev 2
npm run build:mobile
Test-Path .\out\index.html        # must be True
git status --short                  # must NOT show any _api_disabled / _auth_disabled / _middleware.ts

# Android dev build
npm run cap:sync
cd android ; .\gradlew assembleDebug ; cd ..

# Open Android Studio for emulator
npm run cap:android

# Unit tests — VERIFIED GREEN on Node 21 using tsx
npm test
```

---

## 8. Quick sanity checklist for the next dev

- [x] BUG-10  `ResultCard` uses `buildLetter()` with real fields
- [x] BUG-11  `ResultCard` gates letter/PDF behind `await isPro()`
- [x] BUG-12  Download-PDF button calls `buildPdf` → `downloadPdf`
- [x] BUG-13  `<BottomTabs />` mounted in `layout.tsx`, removed from pages
- [x] BUG-14  Share uses `@capacitor/share` on native
- [x] BUG-15  `resources/icon-foreground.png` exists (1024×1024 transparent)
- [x] BUG-16  `npx capacitor-assets generate` run, native icons replaced
- [x] BUG-17  `npm test` green (Node 21 via `tsx`)
- [ ] BUG-18  `gradlew assembleDebug` succeeds end-to-end
- [ ] M9.2 Android emulator smoke checklist passed
- [ ] M10 Play Console internal track build live
- [x] iOS work deferred to Mac session — noted in `PROGRESS.md`

---

## 9. Stop conditions

Stop and report to the human if:
- `npm run build:mobile` regresses and `out/index.html` is no longer produced.
- `gradlew assembleDebug` fails with an error not solved by adding `-keep` rules to `proguard-rules.pro`.
- `capacitor-assets generate` rejects the source PNGs (wrong size, non-square, or bad transparency on icon).
- A `_*_disabled` path keeps reappearing in `git status` after every build (means postbuild is silently failing).
- Any task in this file requires a credential, a paid account, or a Mac (iOS, Apple ID, App Store Connect).

End of guide (rev 3).
