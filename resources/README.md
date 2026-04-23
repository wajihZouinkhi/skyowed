# App icons and splash screens

Put two source images here, then run the generator from the repo root:

- `resources/icon.png` — 1024×1024, opaque background, centered glyph, no text.
- `resources/splash.png` — 2732×2732, centered logo on `#05060a`, safe zone 1200×1200.

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate \
  --iconBackgroundColor '#05060a' \
  --iconBackgroundColorDark '#05060a' \
  --splashBackgroundColor '#05060a' \
  --splashBackgroundColorDark '#05060a'
```

The generator writes every required iOS and Android size automatically.

## Icon spec
- Shape: rounded square (iOS masks to rounded rect; Android adaptive icon requires a 108dp safe zone)
- Background: solid `#05060a`
- Foreground: the SkyOwed mark (violet→cyan gradient plane), centered, occupying ~60% of the 1024 canvas
- No transparency for the iOS variant (Apple rejects alpha in the App Store icon)

## Splash spec
- 2732×2732 canvas
- Logo lives inside the central 1200×1200 safe area
- Background matches `#05060a` (dark) — add a light variant if you want adaptive splashes
