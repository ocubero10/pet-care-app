// Post-build step for `expo export -p web`. Injects a Google Font (Inter)
// link into dist/index.html and a CSS override so every text node falls
// back to that font. Reason: some Android browsers (Huawei/Honor stock)
// ship a system font that lacks Latin Extended glyphs, so tildes and ¿/¡
// render as missing-glyph boxes. Inter ships those glyphs.

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(file)) {
  console.error(`[inject-web-fonts] ${file} not found — did expo export run?`);
  process.exit(1);
}

const inject = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
  <style id="inter-override">
    html, body, #root, #root * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }
    /* Keep icon font-families intact for @expo/vector-icons (they use Unicode PUA glyphs). */
    [style*="MaterialCommunityIcons"],
    [style*="Ionicons"],
    [style*="AntDesign"],
    [style*="Entypo"],
    [style*="EvilIcons"],
    [style*="Feather"],
    [style*="FontAwesome"],
    [style*="Fontisto"],
    [style*="Foundation"],
    [style*="MaterialIcons"],
    [style*="Octicons"],
    [style*="SimpleLineIcons"],
    [style*="Zocial"] {
      font-family: revert !important;
    }
  </style>
`;

const html = fs.readFileSync(file, 'utf8');
if (html.includes('inter-override')) {
  console.log('[inject-web-fonts] already injected, skipping.');
  process.exit(0);
}
const patched = html.replace('</head>', `${inject}\n</head>`);
fs.writeFileSync(file, patched, 'utf8');
console.log('[inject-web-fonts] injected Inter font and override into dist/index.html');
