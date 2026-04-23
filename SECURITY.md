# SkyOwed — Security Posture

SkyOwed is intentionally minimal. The entire eligibility logic runs **on-device**.
There is no backend, no user accounts, no analytics, and no third-party SDKs.

## Data
- **Collected:** none.
- **Transmitted:** none beyond the initial static asset download.
- **Stored on device:** `skyowed.theme` (string), `skyowed.prefs` (JSON of last
  airports + reason). Both live in `localStorage`. Nothing leaves the device.

## Transport
- Web deployment is HTTPS-only. HSTS is enabled by the hosting provider.
- Native apps load only bundled static assets (`capacitor://`), so the WebView
  never fetches external origins at runtime.
- `android.allowMixedContent = false` in `capacitor.config.ts`.

## Content Security Policy (web deployment)
`next.config.mjs` sets headers that block:
- Third-party scripts (`script-src 'self'`)
- Framed embedding by other origins (`frame-ancestors 'none'`)
- Mixed content (`upgrade-insecure-requests`)
- Referrer leakage (`Referrer-Policy: strict-origin-when-cross-origin`)

## Permissions (native)
- iOS: **no** `NS*UsageDescription` keys required (no camera, mic, location,
  photos, contacts, tracking, motion, Bluetooth, etc.).
- Android: **no** runtime permissions requested. `INTERNET` is only used for the
  bundled asset load; no network at runtime after install.

## Input handling
- User inputs never leave the device.
- Inputs that flow into the generated claim letter are HTML-escaped on render
  (React default). No `dangerouslySetInnerHTML` accepts user strings.

## Dependencies
- Production bundle: `next`, `react`, `react-dom`, `@capacitor/*`. No analytics,
  no ad SDKs, no remote-config SDKs.
- Supply-chain hygiene: `npm audit` on every release. Pinned minor versions.

## Reporting
Report vulnerabilities privately to `security@skyowed.app`. We aim to respond
within 72 hours.
