/**
 * Shape-based letter rendering for universal compatibility
 * Each letter is drawn using SVG rectangles - no fonts required
 */

/**
 * Draw a letter using geometric shapes
 * @param {string} char - Single character to draw
 * @param {number} x - X position
 * @param {number} y - Y position  
 * @param {number} size - Height of the letter
 * @param {number} color - Fill color
 * @returns {string} SVG markup
 */
function drawChar(char, x, y, size, color) {
  const s = size;
  const t = s * 0.18; // stroke thickness
  const r = t / 2;    // corner radius
  const w = s * 0.7;  // character width
  
  const c = char.toLowerCase();
  let svg = '';
  
  // Helper for horizontal bar
  const hBar = (bx, by, bw) => `<rect x="${bx}" y="${by}" width="${bw}" height="${t}" fill="${color}" rx="${r}"/>`;
  // Helper for vertical bar
  const vBar = (bx, by, bh) => `<rect x="${bx}" y="${by}" width="${t}" height="${bh}" fill="${color}" rx="${r}"/>`;
  
  switch (c) {
    case 'a':
      svg += vBar(x, y + s * 0.35, s * 0.65);
      svg += vBar(x + w - t, y + s * 0.35, s * 0.65);
      svg += hBar(x, y + s * 0.35, w);
      svg += hBar(x + t, y + s * 0.55, w - t * 2);
      svg += hBar(x + t, y, w - t * 2);
      break;
    case 'b':
      svg += vBar(x, y, s);
      svg += hBar(x, y, w * 0.85);
      svg += hBar(x, y + s * 0.45, w * 0.85);
      svg += hBar(x, y + s - t, w * 0.85);
      svg += vBar(x + w * 0.85 - t, y + t, s * 0.35);
      svg += vBar(x + w - t, y + s * 0.5, s * 0.4);
      break;
    case 'c':
      svg += vBar(x, y + t, s - t * 2);
      svg += hBar(x + t, y, w - t);
      svg += hBar(x + t, y + s - t, w - t);
      break;
    case 'd':
      svg += vBar(x, y, s);
      svg += hBar(x, y, w * 0.7);
      svg += hBar(x, y + s - t, w * 0.7);
      svg += vBar(x + w - t, y + t, s - t * 2);
      svg += vBar(x + w * 0.7 - t, y, t * 1.5);
      svg += vBar(x + w * 0.7 - t, y + s - t * 1.5, t * 1.5);
      break;
    case 'e':
      svg += vBar(x, y, s);
      svg += hBar(x, y, w);
      svg += hBar(x, y + s * 0.45, w * 0.75);
      svg += hBar(x, y + s - t, w);
      break;
    case 'f':
      svg += vBar(x, y, s);
      svg += hBar(x, y, w);
      svg += hBar(x, y + s * 0.45, w * 0.65);
      break;
    case 'g':
      svg += vBar(x, y + t, s - t * 2);
      svg += hBar(x + t, y, w - t);
      svg += hBar(x + t, y + s - t, w - t);
      svg += vBar(x + w - t, y + s * 0.5, s * 0.4);
      svg += hBar(x + w * 0.45, y + s * 0.5, w * 0.55 - t);
      break;
    case 'h':
      svg += vBar(x, y, s);
      svg += vBar(x + w - t, y, s);
      svg += hBar(x + t, y + s * 0.45, w - t * 2);
      break;
    case 'i':
      svg += vBar(x + w * 0.35, y, s);
      svg += hBar(x, y, w);
      svg += hBar(x, y + s - t, w);
      break;
    case 'j':
      svg += vBar(x + w - t, y, s * 0.85);
      svg += hBar(x, y, w);
      svg += hBar(x, y + s - t, w * 0.85);
      svg += vBar(x, y + s * 0.65, s * 0.35 - t);
      break;
    case 'k':
      svg += vBar(x, y, s);
      svg += vBar(x + w - t, y, s * 0.4);
      svg += vBar(x + w - t, y + s * 0.55, s * 0.45);
      svg += hBar(x + t, y + s * 0.4, w * 0.5);
      svg += hBar(x + t, y + s * 0.55, w * 0.5);
      break;
    case 'l':
      svg += vBar(x, y, s);
      svg += hBar(x, y + s - t, w);
      break;
    case 'm':
      svg += vBar(x, y, s);
      svg += vBar(x + w - t, y, s);
      svg += vBar(x + w * 0.5 - t / 2, y + t * 2, s - t * 2);
      svg += hBar(x + t, y, w - t * 2);
      break;
    case 'n':
      svg += vBar(x, y, s);
      svg += vBar(x + w - t, y, s);
      svg += hBar(x + t, y, w - t * 2);
      break;
    case 'o':
      svg += vBar(x, y + t, s - t * 2);
      svg += vBar(x + w - t, y + t, s - t * 2);
      svg += hBar(x + t, y, w - t * 2);
      svg += hBar(x + t, y + s - t, w - t * 2);
      break;
    case 'p':
      svg += vBar(x, y, s);
      svg += hBar(x, y, w);
      svg += hBar(x, y + s * 0.5, w);
      svg += vBar(x + w - t, y + t, s * 0.4);
      break;
    case 'q':
      svg += vBar(x, y + t, s - t * 2);
      svg += vBar(x + w - t, y + t, s - t * 2);
      svg += hBar(x + t, y, w - t * 2);
      svg += hBar(x + t, y + s - t, w - t * 2);
      svg += vBar(x + w * 0.6, y + s * 0.65, s * 0.35);
      break;
    case 'r':
      svg += vBar(x, y, s);
      svg += hBar(x, y, w);
      svg += hBar(x, y + s * 0.5, w);
      svg += vBar(x + w - t, y + t, s * 0.4);
      svg += vBar(x + w - t, y + s * 0.55, s * 0.45);
      svg += hBar(x + w * 0.4, y + s * 0.5, w * 0.3);
      break;
    case 's':
      svg += hBar(x, y, w);
      svg += hBar(x, y + s * 0.45, w);
      svg += hBar(x, y + s - t, w);
      svg += vBar(x, y + t, s * 0.35);
      svg += vBar(x + w - t, y + s * 0.5, s * 0.4);
      break;
    case 't':
      svg += vBar(x + w * 0.5 - t / 2, y, s);
      svg += hBar(x, y, w);
      break;
    case 'u':
      svg += vBar(x, y, s - t);
      svg += vBar(x + w - t, y, s - t);
      svg += hBar(x + t, y + s - t, w - t * 2);
      break;
    case 'v':
      svg += vBar(x, y, s * 0.65);
      svg += vBar(x + w - t, y, s * 0.65);
      svg += vBar(x + w * 0.25, y + s * 0.55, s * 0.45);
      svg += vBar(x + w * 0.75 - t, y + s * 0.55, s * 0.45);
      svg += hBar(x + w * 0.25, y + s - t, w * 0.5);
      break;
    case 'w':
      svg += vBar(x, y, s - t);
      svg += vBar(x + w - t, y, s - t);
      svg += vBar(x + w * 0.5 - t / 2, y + s * 0.4, s * 0.6 - t);
      svg += hBar(x + t, y + s - t, w - t * 2);
      break;
    case 'x':
      svg += vBar(x, y, s * 0.4);
      svg += vBar(x + w - t, y, s * 0.4);
      svg += vBar(x, y + s * 0.6, s * 0.4);
      svg += vBar(x + w - t, y + s * 0.6, s * 0.4);
      svg += hBar(x + t, y + s * 0.4, w - t * 2);
      svg += hBar(x + t, y + s * 0.55, w - t * 2);
      break;
    case 'y':
      svg += vBar(x, y, s * 0.5);
      svg += vBar(x + w - t, y, s * 0.5);
      svg += vBar(x + w * 0.5 - t / 2, y + s * 0.4, s * 0.6);
      svg += hBar(x + t, y + s * 0.45, w - t * 2);
      break;
    case 'z':
      svg += hBar(x, y, w);
      svg += hBar(x, y + s - t, w);
      svg += vBar(x + w - t, y + t, s * 0.35);
      svg += vBar(x, y + s * 0.55, s * 0.35);
      svg += hBar(x + t, y + s * 0.45, w - t * 2);
      break;
    case ' ':
      // Space - no drawing needed
      break;
    case '.':
      svg += `<rect x="${x + w * 0.3}" y="${y + s - t * 1.5}" width="${t * 1.2}" height="${t * 1.2}" fill="${color}" rx="${r}"/>`;
      break;
    case ',':
      svg += `<rect x="${x + w * 0.3}" y="${y + s - t * 2}" width="${t * 1.2}" height="${t * 2.5}" fill="${color}" rx="${r}"/>`;
      break;
    case "'":
    case "'":
    case "'":
      svg += `<rect x="${x + w * 0.35}" y="${y}" width="${t}" height="${t * 2}" fill="${color}" rx="${r}"/>`;
      break;
    case '"':
    case '"':
    case '"':
      svg += `<rect x="${x + w * 0.2}" y="${y}" width="${t}" height="${t * 2}" fill="${color}" rx="${r}"/>`;
      svg += `<rect x="${x + w * 0.5}" y="${y}" width="${t}" height="${t * 2}" fill="${color}" rx="${r}"/>`;
      break;
    case '-':
      svg += hBar(x + t, y + s * 0.45, w - t * 2);
      break;
    case '!':
      svg += vBar(x + w * 0.35, y, s * 0.7);
      svg += `<rect x="${x + w * 0.3}" y="${y + s - t * 1.5}" width="${t * 1.2}" height="${t * 1.2}" fill="${color}" rx="${r}"/>`;
      break;
    case '?':
      svg += hBar(x, y, w);
      svg += vBar(x + w - t, y + t, s * 0.25);
      svg += hBar(x + w * 0.3, y + s * 0.35, w * 0.7 - t);
      svg += vBar(x + w * 0.35, y + s * 0.35, s * 0.35);
      svg += `<rect x="${x + w * 0.3}" y="${y + s - t * 1.5}" width="${t * 1.2}" height="${t * 1.2}" fill="${color}" rx="${r}"/>`;
      break;
    default:
      // Unknown character - draw a small square placeholder
      svg += `<rect x="${x + w * 0.25}" y="${y + s * 0.25}" width="${w * 0.5}" height="${s * 0.5}" fill="${color}" fill-opacity="0.3" rx="${r}"/>`;
  }
  
  return svg;
}

/**
 * Get the width of a character
 */
function getCharWidth(char, size) {
  if (char === ' ') return size * 0.4;
  if (char === '.' || char === ',' || char === '!' || char === "'" || char === "'") return size * 0.35;
  return size * 0.7;
}

/**
 * Render a full string as SVG shapes
 * @param {string} text - Text to render
 * @param {number} centerX - Center X position
 * @param {number} y - Y position (top of text)
 * @param {number} letterHeight - Height of each letter
 * @param {number} color - Fill color
 * @param {number} spacing - Additional spacing between letters
 * @returns {string} SVG markup
 */
function renderText(text, centerX, y, letterHeight, color, spacing = 0) {
  // Calculate total width
  let totalWidth = 0;
  for (const char of text) {
    totalWidth += getCharWidth(char, letterHeight) + spacing;
  }
  totalWidth -= spacing; // Remove last spacing
  
  // Start position (centered)
  let currentX = centerX - totalWidth / 2;
  let svg = '';
  
  for (const char of text) {
    svg += drawChar(char, currentX, y, letterHeight, color);
    currentX += getCharWidth(char, letterHeight) + spacing;
  }
  
  return svg;
}

module.exports = {
  drawChar,
  getCharWidth,
  renderText,
};
