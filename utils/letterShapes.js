/**
 * Monoline shape-based text rendering — no fonts required.
 *
 * Every glyph is defined once in a normalized 1x1 box (y grows downward)
 * and drawn as thin stroked paths with rounded caps and joins, so text
 * renders like a clean geometric typeface on any machine, including
 * serverless environments with no system fonts installed.
 *
 * Glyph ops:
 *   M(x, y)                 move to point
 *   L(x, y)                 line to point
 *   A(cx, cy, r, a1, a2)    circular arc around (cx, cy); angles are screen
 *                           degrees (0 = east, 90 = south, 180 = west,
 *                           270 = north), swept from a1 to a2 (max 180°)
 *   C(cx, cy, r)            stroked circle
 *   R(x, y, w, h, rx)       stroked rounded rectangle
 *   D(cx, cy, r)            filled dot
 */

const STROKE = 0.115; // default stroke width relative to glyph height

const M = (x, y) => ['M', x, y];
const L = (x, y) => ['L', x, y];
const A = (cx, cy, r, a1, a2) => ['A', cx, cy, r, a1, a2];
const C = (cx, cy, r) => ['C', cx, cy, r];
const R = (x, y, w, h, rx) => ['R', x, y, w, h, rx];
const D = (cx, cy, r) => ['D', cx, cy, r];

// Shared metrics: most glyphs sit in a 0.58-wide box with 0.29 bowl radius.
const W = 0.58;

const GLYPHS = {
  a: { w: W, ops: [M(0, 1), L(0.29, 0), L(0.58, 1), M(0.115, 0.66), L(0.465, 0.66)] },
  b: { w: W, ops: [
    M(0.31, 0.46), L(0, 0.46), L(0, 0), L(0.31, 0), A(0.31, 0.23, 0.23, 270, 450),
    M(0.31, 0.46), A(0.31, 0.73, 0.27, 270, 450), L(0, 1), L(0, 0.46),
  ] },
  c: { w: W, ops: [
    A(0.29, 0.29, 0.29, 335, 270), A(0.29, 0.29, 0.29, 270, 180), L(0, 0.71),
    A(0.29, 0.71, 0.29, 180, 90), A(0.29, 0.71, 0.29, 90, 25),
  ] },
  d: { w: W, ops: [
    M(0, 1), L(0, 0), L(0.29, 0), A(0.29, 0.29, 0.29, 270, 360), L(0.58, 0.71),
    A(0.29, 0.71, 0.29, 0, 90), L(0, 1),
  ] },
  e: { w: W, ops: [M(0.55, 0), L(0, 0), L(0, 1), L(0.55, 1), M(0, 0.48), L(0.44, 0.48)] },
  f: { w: W, ops: [M(0.55, 0), L(0, 0), L(0, 1), M(0, 0.48), L(0.42, 0.48)] },
  g: { w: W, ops: [
    A(0.29, 0.29, 0.29, 335, 270), A(0.29, 0.29, 0.29, 270, 180), L(0, 0.71),
    A(0.29, 0.71, 0.29, 180, 90), A(0.29, 0.71, 0.29, 90, 0),
    L(0.58, 0.58), L(0.34, 0.58),
  ] },
  h: { w: W, ops: [M(0, 0), L(0, 1), M(0.58, 0), L(0.58, 1), M(0, 0.48), L(0.58, 0.48)] },
  i: { w: 0.10, ops: [M(0.05, 0), L(0.05, 1)] },
  j: { w: W, ops: [
    M(0.58, 0), L(0.58, 0.71), A(0.29, 0.71, 0.29, 0, 90), A(0.29, 0.71, 0.29, 90, 155),
  ] },
  k: { w: W, ops: [M(0, 0), L(0, 1), M(0.55, 0), L(0.03, 0.52), M(0.20, 0.36), L(0.58, 1)] },
  l: { w: 0.50, ops: [M(0, 0), L(0, 1), L(0.50, 1)] },
  m: { w: 0.78, ops: [M(0, 1), L(0, 0), L(0.39, 0.56), L(0.78, 0), L(0.78, 1)] },
  n: { w: W, ops: [M(0, 1), L(0, 0), L(0.58, 1), L(0.58, 0)] },
  o: { w: W, ops: [R(0, 0, 0.58, 1, 0.29)] },
  p: { w: W, ops: [
    M(0, 1), L(0, 0), L(0.31, 0), A(0.31, 0.27, 0.27, 270, 450), L(0, 0.54),
  ] },
  q: { w: W, ops: [R(0, 0, 0.58, 1, 0.29), M(0.40, 0.80), L(0.62, 1.04)] },
  r: { w: W, ops: [
    M(0, 1), L(0, 0), L(0.31, 0), A(0.31, 0.27, 0.27, 270, 450), L(0, 0.54),
    M(0.28, 0.54), L(0.58, 1),
  ] },
  s: { w: W, ops: [
    A(0.29, 0.24, 0.24, 335, 180), A(0.29, 0.24, 0.24, 180, 90),
    L(0.29, 0.52), A(0.29, 0.76, 0.24, 270, 360), A(0.29, 0.76, 0.24, 0, 90),
    A(0.29, 0.76, 0.24, 90, 155),
  ] },
  t: { w: W, ops: [M(0.29, 0), L(0.29, 1), M(0, 0), L(0.58, 0)] },
  u: { w: W, ops: [
    M(0, 0), L(0, 0.71), A(0.29, 0.71, 0.29, 180, 90), A(0.29, 0.71, 0.29, 90, 0), L(0.58, 0),
  ] },
  v: { w: W, ops: [M(0, 0), L(0.29, 1), L(0.58, 0)] },
  w: { w: 0.78, ops: [M(0, 0), L(0.16, 1), L(0.39, 0.38), L(0.62, 1), L(0.78, 0)] },
  x: { w: W, ops: [M(0, 0), L(0.58, 1), M(0.58, 0), L(0, 1)] },
  y: { w: W, ops: [M(0, 0), L(0.29, 0.5), L(0.58, 0), M(0.29, 0.5), L(0.29, 1)] },
  z: { w: W, ops: [M(0, 0), L(0.58, 0), L(0, 1), L(0.58, 1)] },

  '0': { w: W, ops: [R(0, 0, 0.58, 1, 0.29)] },
  '1': { w: 0.40, ops: [M(0.08, 0.16), L(0.30, 0), L(0.30, 1)] },
  '2': { w: W, ops: [
    A(0.29, 0.27, 0.27, 195, 270), A(0.29, 0.27, 0.27, 270, 375), L(0, 1), L(0.58, 1),
  ] },
  '3': { w: W, ops: [
    A(0.29, 0.25, 0.24, 205, 270), A(0.29, 0.25, 0.24, 270, 360), A(0.29, 0.25, 0.24, 0, 60),
    A(0.29, 0.75, 0.25, 300, 360), A(0.29, 0.75, 0.25, 0, 90), A(0.29, 0.75, 0.25, 90, 155),
  ] },
  '4': { w: W, ops: [M(0.44, 1), L(0.44, 0), L(0, 0.66), L(0.58, 0.66)] },
  '5': { w: W, ops: [
    M(0.54, 0), L(0.06, 0), L(0.06, 0.44),
    A(0.30, 0.70, 0.30, 230, 270), A(0.30, 0.70, 0.30, 270, 360),
    A(0.30, 0.70, 0.30, 0, 90), A(0.30, 0.70, 0.30, 90, 145),
  ] },
  '6': { w: W, ops: [
    A(0.29, 0.29, 0.29, 320, 270), A(0.29, 0.29, 0.29, 270, 180), L(0, 0.71),
    C(0.29, 0.71, 0.29),
  ] },
  '7': { w: W, ops: [M(0, 0), L(0.58, 0), L(0.16, 1)] },
  '8': { w: W, ops: [C(0.29, 0.235, 0.225), C(0.29, 0.745, 0.255)] },
  '9': { w: W, ops: [
    C(0.29, 0.29, 0.29), M(0.58, 0.29), L(0.58, 0.71), A(0.29, 0.71, 0.29, 0, 90),
  ] },

  '%': { w: W, ops: [C(0.115, 0.125, 0.105), C(0.465, 0.875, 0.105), M(0.52, 0.03), L(0.06, 0.97)] },
  '.': { w: 0.14, ops: [D(0.07, 0.93, 0.07)] },
  ',': { w: 0.14, ops: [D(0.07, 0.90, 0.07), M(0.09, 0.96), L(0.02, 1.10)] },
  "'": { w: 0.12, ops: [M(0.06, 0.02), L(0.02, 0.20)] },
  '-': { w: 0.34, ops: [M(0, 0.5), L(0.34, 0.5)] },
  '!': { w: 0.12, ops: [M(0.06, 0), L(0.06, 0.60), D(0.06, 0.93, 0.07)] },
  '?': { w: W, ops: [
    A(0.29, 0.26, 0.26, 200, 270), A(0.29, 0.26, 0.26, 270, 380),
    L(0.29, 0.56), L(0.29, 0.64), D(0.29, 0.93, 0.07),
  ] },
  ' ': { w: 0.36, ops: [] },
};

// Curly quote variants map to their straight equivalents.
GLYPHS['‘'] = GLYPHS["'"];
GLYPHS['’'] = GLYPHS["'"];
GLYPHS['“'] = GLYPHS["'"];
GLYPHS['”'] = GLYPHS["'"];

/** Point on a circle at a screen angle (degrees, y-down). */
function arcPoint(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/**
 * Draw a single character at (x, y) scaled to `size` height.
 * Returns SVG markup (stroked paths/shapes).
 */
function drawChar(char, x, y, size, color, strokeWidth) {
  const glyph = GLYPHS[char] || GLYPHS[char.toLowerCase()];
  if (!glyph || glyph.ops.length === 0) return '';

  const tw = strokeWidth || size * STROKE;
  const px = (nx) => +(x + nx * size).toFixed(2);
  const py = (ny) => +(y + ny * size).toFixed(2);
  const pr = (nr) => +(nr * size).toFixed(2);

  const strokeAttrs = `fill="none" stroke="${color}" stroke-width="${+tw.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"`;

  let d = '';
  let extras = '';
  let cur = null; // current point in normalized coords

  const moveOrLine = (nx, ny) => {
    const gap = cur ? Math.hypot(nx - cur[0], ny - cur[1]) : Infinity;
    if (gap > 0.02) {
      d += `M ${px(nx)} ${py(ny)} `;
    } else if (gap > 0.001) {
      d += `L ${px(nx)} ${py(ny)} `;
    }
    cur = [nx, ny];
  };

  for (const op of glyph.ops) {
    switch (op[0]) {
      case 'M': {
        d += `M ${px(op[1])} ${py(op[2])} `;
        cur = [op[1], op[2]];
        break;
      }
      case 'L': {
        d += `L ${px(op[1])} ${py(op[2])} `;
        cur = [op[1], op[2]];
        break;
      }
      case 'A': {
        const [, cx, cy, r, a1, a2] = op;
        const [sx, sy] = arcPoint(cx, cy, r, a1);
        const [ex, ey] = arcPoint(cx, cy, r, a2);
        moveOrLine(sx, sy);
        const sweep = a2 > a1 ? 1 : 0;
        const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
        d += `A ${pr(r)} ${pr(r)} 0 ${large} ${sweep} ${px(ex)} ${py(ey)} `;
        cur = [ex, ey];
        break;
      }
      case 'C': {
        extras += `<circle cx="${px(op[1])}" cy="${py(op[2])}" r="${pr(op[3])}" ${strokeAttrs}/>`;
        break;
      }
      case 'R': {
        extras += `<rect x="${px(op[1])}" y="${py(op[2])}" width="${pr(op[3])}" height="${pr(op[4])}" rx="${pr(op[5])}" ${strokeAttrs}/>`;
        break;
      }
      case 'D': {
        extras += `<circle cx="${px(op[1])}" cy="${py(op[2])}" r="${pr(op[3])}" fill="${color}"/>`;
        break;
      }
    }
  }

  let svg = extras;
  if (d.trim()) {
    svg += `<path d="${d.trim()}" ${strokeAttrs}/>`;
  }
  return svg;
}

/**
 * Advance width of a character at a given size.
 */
function getCharWidth(char, size) {
  const glyph = GLYPHS[char] || GLYPHS[char.toLowerCase()];
  return (glyph ? glyph.w : 0.58) * size;
}

/**
 * Measure the total width of a string at a given size and letter spacing.
 */
function measureText(text, letterHeight, spacing = 0) {
  let total = 0;
  for (const char of text) {
    total += getCharWidth(char, letterHeight) + spacing;
  }
  return Math.max(0, total - spacing);
}

/**
 * Render a string centered on centerX, top-aligned at y.
 */
function renderText(text, centerX, y, letterHeight, color, spacing = 0, strokeWidth) {
  let currentX = centerX - measureText(text, letterHeight, spacing) / 2;
  let svg = '';
  for (const char of text) {
    svg += drawChar(char, currentX, y, letterHeight, color, strokeWidth);
    currentX += getCharWidth(char, letterHeight) + spacing;
  }
  return svg;
}

module.exports = {
  drawChar,
  getCharWidth,
  measureText,
  renderText,
};
