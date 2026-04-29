# Generate Android signing keystore for Google Play Store
# Run this ONCE and keep the .jks file and passwords secure

$KEYSTORE_FILE = "android/app/skyowed-release.keystore"
$ALIAS = "skyowed"
$VALIDITY = 10000

Write-Host "Generating keystore at $KEYSTORE_FILE..."
Write-Host "SAVE PASSWORDS — you cannot update the app without them."

& keytool -genkey -v -keystore $KEYSTORE_FILE -alias $ALIAS -keyalg RSA -keysize 2048 -validity $VALIDITY

Write-Host "Keystore created: $KEYSTORE_FILE"
Write-Host "Add to android/app/build.gradle signingConfigs section"
