# Native project patches

Run `npx cap add ios` and `npx cap add android` first, then apply these one-time patches.
You only do this once — `cap sync` preserves them.

---

## iOS — `ios/App/App/Info.plist`

Add inside the top-level `<dict>`:

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

We intentionally DO NOT add any `NS*UsageDescription` keys — SkyOwed asks for
no runtime permissions. App Review rejects apps that declare unused permission
strings.

---

## Android — `android/app/src/main/AndroidManifest.xml`

### 1. Remove advertising ID permission
Capacitor does not add it by default, but Play requires an explicit opt-out if
any transitive dependency adds it. Inside `<manifest>`, next to the existing
`<uses-permission>` tags, add:

```xml
<uses-permission
    android:name="com.google.android.gms.permission.AD_ID"
    tools:node="remove" />
```

And add `xmlns:tools="http://schemas.android.com/tools"` to the root `<manifest>` tag
if it isn't already there.

### 2. Lock orientation to portrait on phones
Inside `<activity android:name=".MainActivity" ... >`:

```xml
android:screenOrientation="portrait"
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
```

### 3. Backup / data-extraction rules
In `android/app/src/main/res/xml/data_extraction_rules.xml` and
`backup_rules.xml`, keep Capacitor defaults — they exclude Cookies and
WebView caches from Auto Backup, which is what we want.

---

## Android — `android/app/build.gradle`

Confirm these values:

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

---

## Signing

### Android upload keystore
```bash
keytool -genkey -v -keystore skyowed-upload.keystore \
  -alias skyowed -keyalg RSA -keysize 2048 -validity 10000
```
Store in a password manager. Add to `~/.gradle/gradle.properties`:
```
SKYOWED_UPLOAD_STORE_FILE=/absolute/path/skyowed-upload.keystore
SKYOWED_UPLOAD_KEY_ALIAS=skyowed
SKYOWED_UPLOAD_STORE_PASSWORD=...
SKYOWED_UPLOAD_KEY_PASSWORD=...
```

### iOS signing
Automatic signing via Xcode is fine for first release. Enable **Automatically
manage signing** → choose your team → Xcode provisions everything.

---

## Play Integrity
Enable in Play Console → Release → App integrity. No code changes needed for
basic Play Integrity; the default Capacitor shell is compatible.

## App Store Connect — review tips
- Submit with the **demo video** of the happy-path flow if review takes more than 24h.
- In the review note, stress that everything works without account or network.
