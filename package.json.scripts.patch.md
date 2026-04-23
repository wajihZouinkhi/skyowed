Add these to package.json "scripts":

```json
"build": "next build",
"cap:sync": "next build && npx cap sync",
"cap:ios": "next build && npx cap sync ios && npx cap open ios",
"cap:android": "next build && npx cap sync android && npx cap open android"
```

And add these to "dependencies":
```json
"@capacitor/core": "^6.1.2",
"@capacitor/ios": "^6.1.2",
"@capacitor/android": "^6.1.2",
"@capacitor/status-bar": "^6.0.2",
"@capacitor/splash-screen": "^6.0.2",
"@capacitor/app": "^6.0.2",
"@capacitor/haptics": "^6.0.2"
```

And to "devDependencies":
```json
"@capacitor/cli": "^6.1.2"
```
