const fs = require('fs');
const path = require('path');

async function main() {
  // Check if sharp is available
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('[generate-assets] sharp is not installed. Run: npm install sharp');
    process.exit(1);
  }

  const resDir = path.join(__dirname, '..', 'resources');
  const srcDir = path.join(resDir, 'src');

  const iconSvg = fs.readFileSync(path.join(srcDir, 'icon.svg'));
  await sharp(iconSvg, { density: 300 })
    .resize(1024, 1024, { fit: 'contain', background: { r: 5, g: 6, b: 10, alpha: 1 } })
    .png()
    .toFile(path.join(resDir, 'icon.png'));
  console.log('[generate-assets] Created resources/icon.png (1024x1024)');

  const splashSvg = fs.readFileSync(path.join(srcDir, 'splash.svg'));
  await sharp(splashSvg, { density: 300 })
    .resize(2732, 2732, { fit: 'contain', background: { r: 5, g: 6, b: 10, alpha: 1 } })
    .png()
    .toFile(path.join(resDir, 'splash.png'));
  console.log('[generate-assets] Created resources/splash.png (2732x2732)');

  console.log('[generate-assets] Done. Now run:');
  console.log('  npx capacitor-assets generate --iconBackgroundColor="#05060a" --splashBackgroundColor="#05060a"');
}

main().catch(e => { console.error(e); process.exit(1); });
