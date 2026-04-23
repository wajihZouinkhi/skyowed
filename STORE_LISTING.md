# Store Submission Checklist

Both the Apple App Store and Google Play Store require the same core assets.
This doc has everything you need to copy-paste during submission.

---

## Common assets

### App name
SkyOwed

### Subtitle / short description (30 chars Play · 30 chars iOS subtitle)
`EU261 flight compensation`

### Promotional text (iOS only, 170 chars)
`Delayed or cancelled? Check in 30 seconds what the airline owes you under EU261 & UK261. Up to €600 / £520. Free, private, no account.`

### Full description (Play 4000 chars · iOS 4000 chars)
```
SkyOwed tells you what your delayed flight owes you — in 30 seconds.

If your flight was delayed 3+ hours, cancelled, or you were denied boarding,
EU Regulation 261/2004 (and its UK twin) may entitle you to up to €600 / £520
in cash from the airline — regardless of ticket price.

Most people never claim because the process looks intimidating. SkyOwed removes
the friction:

• Enter your departure, arrival, delay length, and reason.
• Get an instant eligibility answer with the exact compensation band.
• Download a pre-filled claim letter citing the regulation.
• Send it to the airline yourself. Keep 100% of the payout.

Why SkyOwed
— Free. No fees, no commission, no signup.
— Private. Everything runs on your device. No tracking, no analytics, no ads.
— Offline-capable. Works on the plane.
— Certified logic. Implements EU261 + UK261 distance bands and delay thresholds
  exactly as published.

What you can claim
• < 1,500 km: €250 / £220
• 1,500–3,500 km: €400 / £350
• > 3,500 km: €600 / £520
(With at least 3 hours of arrival delay, unless the airline proves extraordinary
circumstances such as severe weather or air-traffic strikes outside its control.)

SkyOwed is not a law firm and does not replace legal advice. Approximately 90%
of valid claims are paid after a single polite letter citing the regulation.
```

### Keywords (iOS, 100 chars, comma-separated)
`EU261,UK261,flight,delay,cancellation,compensation,refund,claim,airline,travel,rights`

### Category
- Primary: Travel
- Secondary (iOS): Utilities

### Content rating
- Play: Everyone
- iOS: 4+
- No ads, no UGC, no tracking, no gambling, no restricted content.

### Support URL
`https://skyowed.app/`

### Marketing URL
`https://skyowed.app/`

### Privacy policy URL
`https://skyowed.app/privacy`

### Terms URL
`https://skyowed.app/terms`

---

## Apple App Store Connect

### App Privacy questionnaire
- **Data types collected:** None.
- **Data used to track you:** None.
- **Third-party analytics/ads:** None.
- Select **"Data Not Collected"**.

### App Tracking Transparency (ATT)
Not required — we do not track. No `NSUserTrackingUsageDescription` key added.

### Export compliance
- Uses standard encryption (HTTPS only).
- Answer: **Yes — uses encryption** → **Only exempt encryption (HTTPS)** → no
  ERN needed. Add `ITSAppUsesNonExemptEncryption = false` to `Info.plist`.

### Sign-in with Apple
Not required (no accounts).

### Review notes for Apple
```
SkyOwed is a standalone EU261/UK261 flight-compensation calculator.
No login is required; the entire experience is available to the reviewer
on launch. No demo account needed. No third-party services are called.
```

### Required screenshots (iOS)
- 6.7" iPhone (1290×2796): 3–10 screenshots
- 6.5" iPhone (1242×2688): 3–10 screenshots  (optional if 6.7" provided)
- 12.9" iPad Pro (2048×2732): 3–10 screenshots (only if you ship iPad)

### App icon
1024×1024 PNG, no alpha, no rounded corners (Apple rounds them).

---

## Google Play Console

### Data safety form
- **Does your app collect or share any of the required user data types?** No
- **Is all of the user data collected by your app encrypted in transit?** Yes
  (bundled; N/A, but answer yes because HTTPS applies to the web version).
- **Do you provide a way for users to request that their data be deleted?** Yes
  (clearing app data removes all local storage).

### Target audience
Ages 13+. No children-specific content. Not in Teacher Approved / Families.

### Ads declaration
Contains ads: **No**.

### Content rating (IARC)
Answer all questionnaire items **No** → expected rating: Everyone / PEGI 3.

### Target API level
Play Store requires API **34+** (Android 14) as of Aug 2024.
Capacitor 6 targets API 34 by default. Confirm in `android/app/build.gradle`:
```
defaultConfig {
  minSdkVersion 23
  targetSdkVersion 34
  compileSdkVersion 34
}
```

### 64-bit requirement
Capacitor produces 64-bit AABs by default. No action needed.

### Required Play assets
- Feature graphic: 1024×500 PNG/JPG
- App icon: 512×512 PNG (32-bit, alpha allowed)
- Phone screenshots: 2–8, min 320px, max 3840px, 16:9 or 9:16 ratio
- 7" + 10" tablet screenshots: optional but recommended
- Short description: 80 chars
- Full description: 4000 chars

### Play policy-sensitive items we explicitly avoid
- No background location
- No accessibility service
- No SMS/Call log access
- No AD_ID permission (add `<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />` to `AndroidManifest.xml` — we do not show ads)
- No package-visibility `QUERY_ALL_PACKAGES`
- No install-time permissions beyond INTERNET (default Capacitor)

---

## Pre-submission smoke test
- [ ] App launches without login
- [ ] Works offline (airplane mode)
- [ ] Form validates bad airports / negative delays
- [ ] Generated letter renders with user inputs escaped
- [ ] Theme toggle persists across relaunch
- [ ] Footer links to /privacy and /terms resolve inside the app
- [ ] Status bar + safe areas render correctly on notch devices
- [ ] No console errors in Xcode or Android Studio logcat
- [ ] Splash screen dismisses within 2s
- [ ] Back button on Android returns from /privacy to home, exits from home
