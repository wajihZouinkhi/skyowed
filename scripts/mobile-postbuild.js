const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

// Mirror of MOVES in mobile-prebuild.js.
// Each entry: [live path, disabled path, label]
const MOVES = [
  [path.join(SRC, 'app', 'api'), path.join(SRC, 'app', '_api_disabled'), 'src/app/api'],
  [path.join(SRC, 'app', 'auth'), path.join(SRC, 'app', '_auth_disabled'), 'src/app/auth'],
  [path.join(SRC, 'middleware.ts'), path.join(SRC, '_middleware.ts'), 'src/middleware.ts'],
];

// NOTE: Not gated on BUILD_TARGET — we always want to restore if a
// disabled path is found, so an interrupted build never leaves the
// repo in a broken state.
function main() {
  for (const [from, to, label] of MOVES) {
    if (fs.existsSync(to)) {
      fs.renameSync(to, from);
      console.log(`[mobile-postbuild] Restored ${path.basename(to)} -> ${label}`);
    }
  }
}

main();
