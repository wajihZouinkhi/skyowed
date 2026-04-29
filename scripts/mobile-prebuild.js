const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

// Paths to temporarily rename away for mobile static export.
// Each entry: [live path, disabled path, label]
const MOVES = [
  [path.join(SRC, 'app', 'api'), path.join(SRC, 'app', '_api_disabled'), 'src/app/api'],
  [path.join(SRC, 'app', 'auth'), path.join(SRC, 'app', '_auth_disabled'), 'src/app/auth'],
  [path.join(SRC, 'middleware.ts'), path.join(SRC, '_middleware.ts'), 'src/middleware.ts'],
];

function main() {
  if (process.env.BUILD_TARGET !== 'mobile') {
    console.log('[mobile-prebuild] Not a mobile build, skipping.');
    return;
  }

  // BUG-9: Defensive restore — if a previous build crashed, orphaned _*_disabled
  // files may exist alongside the live ones. Restore them first.
  for (const [from, to, label] of MOVES) {
    if (fs.existsSync(to) && fs.existsSync(from)) {
      fs.rmSync(to, { recursive: true, force: true });
      console.log(`[mobile-prebuild] Cleaned orphaned ${path.basename(to)}`);
    }
  }

  for (const [from, to, label] of MOVES) {
    if (fs.existsSync(from)) {
      fs.renameSync(from, to);
      console.log(`[mobile-prebuild] Renamed ${label} -> ${path.basename(to)}`);
    }
  }
}

main();
