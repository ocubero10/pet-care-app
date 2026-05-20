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
    /* React Native Web renders text components with fontFamily: 'System'.
       Redefining 'System' as @font-face that points at Inter lets us
       fix missing Latin-Extended glyphs (tildes, ñ, ¿/¡) on Android
       browsers with limited system fonts, WITHOUT touching the icon
       font-families (Ionicons, MaterialCommunityIcons, etc.) used by
       @expo/vector-icons. */
    @font-face {
      font-family: 'System';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local('Inter'), local('Inter-Regular'),
           url('https://rsms.me/inter/font-files/Inter-Regular.woff2?v=4.0') format('woff2');
    }
    @font-face {
      font-family: 'System';
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: local('Inter Medium'), local('Inter-Medium'),
           url('https://rsms.me/inter/font-files/Inter-Medium.woff2?v=4.0') format('woff2');
    }
    @font-face {
      font-family: 'System';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: local('Inter SemiBold'), local('Inter-SemiBold'),
           url('https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=4.0') format('woff2');
    }
    @font-face {
      font-family: 'System';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: local('Inter Bold'), local('Inter-Bold'),
           url('https://rsms.me/inter/font-files/Inter-Bold.woff2?v=4.0') format('woff2');
    }
    /* Default for body-level inheritance only — does not override inline styles. */
    html, body, #root {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
