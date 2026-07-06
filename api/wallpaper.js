const fs = require('fs');
const path = require('path');
const { generateSVG } = require('../utils/wallpaperGenerator');
const { getIndiaDate } = require('../utils/dateUtils');

// Point fontconfig at the bundled TTFs so sharp (librsvg/pango) can render
// <text> on serverless machines that ship no system fonts.
const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts');
const FONTCONFIG_DIR = '/tmp/wallpaper-fontconfig';

function setupFonts() {
  try {
    if (
      !fs.existsSync(path.join(FONT_DIR, 'Cinzel_600SemiBold.ttf')) ||
      !fs.existsSync(path.join(FONT_DIR, 'EBGaramond_400Regular_Italic.ttf'))
    ) {
      return false;
    }
    fs.mkdirSync(FONTCONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(FONTCONFIG_DIR, 'fonts.conf'),
      `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONT_DIR}</dir>
  <cachedir>${FONTCONFIG_DIR}/cache</cachedir>
</fontconfig>
`
    );
    process.env.FONTCONFIG_PATH = FONTCONFIG_DIR;
    return true;
  } catch (e) {
    console.error('Font setup failed, falling back to shape text:', e);
    return false;
  }
}

// If the fonts can't be set up, fall back to the built-in shape glyphs
const TEXT_ENGINE = setupFonts() ? 'font' : 'shapes';

// Parse the optional ?accent=RRGGBB param from the raw URL so we don't
// depend on runtime-specific helpers like req.query
function getConfigFromRequest(req) {
  const config = { textEngine: TEXT_ENGINE };
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const accent = url.searchParams.get('accent');
    if (accent && /^[0-9a-fA-F]{6}$/.test(accent)) {
      config.accentColor = `#${accent}`;
    }
  } catch (e) {
    // Ignore malformed URLs and fall back to defaults
  }
  return config;
}

// Use only plain Node.js response APIs (statusCode/setHeader/end).
// Express-style helpers (res.status/res.send/res.json) are not available
// on every Vercel runtime and crash with "res.status is not a function".
function send(res, contentType, body) {
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(body);
}

module.exports = async (req, res) => {
  try {
    const now = getIndiaDate();
    const svg = generateSVG(now, getConfigFromRequest(req));

    // Convert SVG to PNG using sharp
    const svgBuffer = Buffer.from(svg);

    try {
      const sharp = require('sharp');
      const pngBuffer = await sharp(svgBuffer).png().toBuffer();
      send(res, 'image/png', pngBuffer);
    } catch (sharpError) {
      // Fallback to SVG if sharp is not available
      send(res, 'image/svg+xml', svg);
    }
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to generate wallpaper' }));
  }
};
