const { getCompletedDays, getTotalDaysInYear, getYearProgress, getMonthEndDays, getDayOfYear } = require('./dateUtils');
const { getQuoteForDay } = require('./quotes');
const { renderText, drawChar, getCharWidth, measureText } = require('./letterShapes');

// Default configuration
const DEFAULT_CONFIG = {
  width: 1170,
  height: 2532,
  cols: 14, // 2 weeks per row

  // iOS crops wallpapers unpredictably (9-16% zoom observed), so keep the
  // whole composition compact and end all content well above the bottom
  // lock-screen shortcuts
  topPadding: 420,
  sidePadding: 380,
  percentageSpace: 80,
  quoteSpace: 120,
  bottomPadding: 280,

  // 'font' renders text with the bundled TTFs (Cinzel + EB Garamond);
  // 'shapes' falls back to the built-in monoline glyphs when fonts are
  // unavailable
  textEngine: 'font',

  // "Illuminated Codex" palette: lapis lazuli background, gold-leaf cells
  backgroundColor: '#0B1626',
  backgroundTop: '#141F3B',
  backgroundBottom: '#070B18',
  goldHi: '#F0D080',              // gold-leaf gradient, light end
  goldLo: '#B98A2F',              // gold-leaf gradient, dark end
  emptyCircleColor: '#1B2747',    // future day cells
  accentColor: '#FFDF8E',         // today marker
  textColor: '#EFE3C0',
  quoteColor: '#A99E7C',
  frameColor: '#8A6D2F',
  monthLetterOnFilled: '#54390E',
  monthLetterOnEmpty: '#3A4C7E',
};

/**
 * Calculate grid layout parameters
 */
function calculateGridLayout(totalDays, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const rows = Math.ceil(totalDays / cfg.cols);

  const gridWidth = cfg.width - (cfg.sidePadding * 2);
  const gridHeight = cfg.height - cfg.topPadding - cfg.percentageSpace - cfg.quoteSpace - cfg.bottomPadding;

  const horizontalSpacing = gridWidth / cfg.cols;
  const verticalSpacing = gridHeight / rows;
  const circleRadius = Math.min(horizontalSpacing, verticalSpacing) * 0.35;

  const totalGridWidth = cfg.cols * horizontalSpacing;
  const totalGridHeight = rows * verticalSpacing;
  const startX = cfg.sidePadding + (gridWidth - totalGridWidth) / 2;
  const startY = cfg.topPadding + (gridHeight - totalGridHeight) / 2;

  return {
    rows,
    cols: cfg.cols,
    horizontalSpacing,
    verticalSpacing,
    circleRadius,
    startX,
    startY,
    config: cfg,
  };
}

/**
 * Escape special XML characters for text nodes
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Emit an SVG <text> element set in one of the bundled typefaces
 */
function svgText(text, x, y, { font, size, weight, fill, spacing, italic }) {
  const family = font === 'cinzel' ? 'Cinzel' : "'EB Garamond'";
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  const style = italic ? ' font-style="italic"' : '';
  return `<text x="${+x.toFixed(2)}" y="${+y.toFixed(2)}" font-family="${family}, serif" font-size="${size}" font-weight="${weight}"${style} fill="${fill}"${ls} text-anchor="middle">${escapeXml(text)}</text>`;
}

/**
 * Rough width estimate for EB Garamond italic (used only for word-wrapping)
 */
function estimateTextWidth(text, fontSize) {
  let units = 0;
  for (const ch of text) {
    if (ch === ' ') units += 0.26;
    else if ("iljtf.,;'!".includes(ch)) units += 0.24;
    else if ('mwMW'.includes(ch)) units += 0.78;
    else if (/[A-Z0-9]/.test(ch)) units += 0.6;
    else units += 0.46;
  }
  return units * fontSize;
}

/**
 * Word-wrap the quote into centered lines
 */
function wrapQuote(quote, fontSize, maxWidth, measure) {
  const words = quote.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (measure(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Render the quote centered on (centerX, centerY)
 */
function generateQuoteText(quote, centerX, centerY, fontSize, maxWidth, color, useFont) {
  let svg = '';

  if (useFont) {
    const lines = wrapQuote(quote, fontSize, maxWidth, estimateTextWidth);
    const lineHeight = fontSize * 1.5;
    lines.forEach((line, index) => {
      const lineCenterY = centerY + (index - (lines.length - 1) / 2) * lineHeight;
      svg += svgText(line, centerX, lineCenterY + fontSize * 0.33, {
        font: 'garamond', size: fontSize, weight: 400, italic: true, fill: color,
      });
    });
    return svg;
  }

  const letterSpacing = fontSize * 0.12;
  const lines = wrapQuote(quote, fontSize, maxWidth, (t, s) => measureText(t, s, letterSpacing));
  const lineHeight = fontSize * 1.9;
  const startY = centerY - ((lines.length - 1) * lineHeight + fontSize) / 2;
  lines.forEach((line, index) => {
    svg += renderText(line, centerX, startY + index * lineHeight, fontSize, color, letterSpacing);
  });
  return svg;
}

/**
 * Generate SVG markup for the wallpaper
 */
function generateSVG(date, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const year = date.getFullYear();
  const completedDays = getCompletedDays(date);
  const totalDays = getTotalDaysInYear(year);
  const yearProgress = getYearProgress(date);
  const todayNumber = completedDays + 1;

  const layout = calculateGridLayout(totalDays, cfg);
  const useFont = cfg.textEngine !== 'shapes';

  let svg = `<svg width="${cfg.width}" height="${cfg.height}" xmlns="http://www.w3.org/2000/svg">`;

  // Lapis gradient background, gold-leaf gradient for cells, candle glow
  svg += `<defs>`;
  svg += `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">`;
  svg += `<stop offset="0" stop-color="${cfg.backgroundTop}"/>`;
  svg += `<stop offset="1" stop-color="${cfg.backgroundBottom}"/>`;
  svg += `</linearGradient>`;
  svg += `<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">`;
  svg += `<stop offset="0" stop-color="${cfg.goldHi}"/>`;
  svg += `<stop offset="1" stop-color="${cfg.goldLo}"/>`;
  svg += `</linearGradient>`;
  svg += `<radialGradient id="todayGlow">`;
  svg += `<stop offset="0" stop-color="${cfg.accentColor}" stop-opacity="0.45"/>`;
  svg += `<stop offset="1" stop-color="${cfg.accentColor}" stop-opacity="0"/>`;
  svg += `</radialGradient>`;
  svg += `</defs>`;

  svg += `<rect width="${cfg.width}" height="${cfg.height}" fill="${cfg.backgroundColor}"/>`;
  svg += `<rect width="${cfg.width}" height="${cfg.height}" fill="url(#bg)"/>`;

  // Day grid: soft rounded cells, dimmed future days, glowing "today"
  const uniformSpacing = Math.min(layout.horizontalSpacing, layout.verticalSpacing);
  const boxSize = uniformSpacing * 0.78;
  const gap = uniformSpacing - boxSize;
  const cornerRadius = +(boxSize * 0.3).toFixed(2);

  const totalGridWidth = layout.cols * uniformSpacing;
  const totalGridHeight = layout.rows * uniformSpacing;
  const gridStartX = (cfg.width - totalGridWidth) / 2;
  const gridStartY = cfg.topPadding + (cfg.height - cfg.topPadding - cfg.percentageSpace - cfg.quoteSpace - cfg.bottomPadding - totalGridHeight) / 2;

  const monthEndDays = getMonthEndDays(year);
  const letterSize = boxSize * 0.46;
  // Center the final partial row so leftover days don't dangle at the left edge
  const lastRowCells = totalDays - (layout.rows - 1) * layout.cols;

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const dayNumber = row * layout.cols + col + 1;
      if (dayNumber > totalDays) continue;

      const rowOffset = row === layout.rows - 1 ? ((layout.cols - lastRowCells) * uniformSpacing) / 2 : 0;
      const x = +(gridStartX + rowOffset + col * uniformSpacing + gap / 2).toFixed(2);
      const y = +(gridStartY + row * uniformSpacing + gap / 2).toFixed(2);
      const monthLetter = monthEndDays[dayNumber];
      const cell = (fill, opacity) =>
        `<rect x="${x}" y="${y}" width="${boxSize.toFixed(2)}" height="${boxSize.toFixed(2)}" rx="${cornerRadius}" fill="${fill}"${opacity ? ` fill-opacity="${opacity}"` : ''}/>`;
      const letter = (color) => {
        if (!monthLetter) return '';
        if (useFont) {
          const fontSize = boxSize * 0.62;
          return svgText(monthLetter.toUpperCase(), x + boxSize / 2, y + boxSize / 2 + fontSize * 0.36, {
            font: 'garamond', size: +fontSize.toFixed(2), weight: 500, fill: color,
          });
        }
        const lx = x + (boxSize - getCharWidth(monthLetter, letterSize)) / 2;
        const ly = y + (boxSize - letterSize) / 2;
        return drawChar(monthLetter, lx, ly, letterSize, color);
      };

      if (dayNumber === todayNumber) {
        // Today: the brightest gold with a candle glow, so you can find
        // yourself in the year
        const cx = x + boxSize / 2;
        const cy = y + boxSize / 2;
        svg += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(boxSize * 2.6).toFixed(2)}" fill="url(#todayGlow)"/>`;
        svg += cell(cfg.accentColor);
        svg += letter(cfg.backgroundBottom);
      } else if (dayNumber <= completedDays) {
        // Gold-leaf tessera; deterministic per-day shimmer like real leaf
        const shimmer = (0.82 + ((dayNumber * 2654435761) % 97) / 97 * 0.18).toFixed(2);
        svg += cell('url(#leaf)', shimmer);
        svg += letter(cfg.monthLetterOnFilled);
      } else {
        svg += cell(cfg.emptyCircleColor);
        svg += letter(cfg.monthLetterOnEmpty);
      }
    }
  }

  const gridBottom = gridStartY + totalGridHeight;

  // Fine double-rule plate frame with diamond finials at the corners
  const frameMargin = 34;
  const fx1 = gridStartX + gap / 2 - frameMargin;
  const fy1 = gridStartY + gap / 2 - frameMargin;
  const fx2 = gridStartX + totalGridWidth - gap / 2 + frameMargin;
  const fy2 = gridBottom - gap / 2 + frameMargin;
  svg += `<rect x="${fx1.toFixed(2)}" y="${fy1.toFixed(2)}" width="${(fx2 - fx1).toFixed(2)}" height="${(fy2 - fy1).toFixed(2)}" fill="none" stroke="${cfg.frameColor}" stroke-width="1.6"/>`;
  svg += `<rect x="${(fx1 - 8).toFixed(2)}" y="${(fy1 - 8).toFixed(2)}" width="${(fx2 - fx1 + 16).toFixed(2)}" height="${(fy2 - fy1 + 16).toFixed(2)}" fill="none" stroke="${cfg.frameColor}" stroke-opacity="0.45" stroke-width="1"/>`;
  const diamond = 7;
  for (const [dx, dy] of [[fx1 - 8, fy1 - 8], [fx2 + 8, fy1 - 8], [fx1 - 8, fy2 + 8], [fx2 + 8, fy2 + 8]]) {
    svg += `<rect x="${(dx - diamond / 2).toFixed(2)}" y="${(dy - diamond / 2).toFixed(2)}" width="${diamond}" height="${diamond}" fill="${cfg.accentColor}" transform="rotate(45 ${dx.toFixed(2)} ${dy.toFixed(2)})"/>`;
  }

  // Year percentage in Roman capitals, centered below the frame
  const pctCenterY = gridBottom + cfg.percentageSpace / 2;
  if (useFont) {
    svg += svgText(`${yearProgress}%`, cfg.width / 2, pctCenterY + 46, {
      font: 'cinzel', size: 58, weight: 600, fill: cfg.textColor, spacing: 3,
    });
  } else {
    svg += renderText(`${yearProgress}%`, cfg.width / 2, pctCenterY - 24, 48, cfg.textColor, 48 * 0.12);
  }

  // Daily quote in italics below the percentage
  const dayOfYear = getDayOfYear(date);
  const quote = getQuoteForDay(dayOfYear);
  const quoteCenterY = gridBottom + cfg.percentageSpace + cfg.quoteSpace / 2 + (useFont ? 36 : 0);
  svg += generateQuoteText(quote, cfg.width / 2, quoteCenterY, useFont ? 48 : 24, 780, cfg.quoteColor, useFont);

  svg += `</svg>`;

  return svg;
}

module.exports = {
  generateSVG,
  calculateGridLayout,
  DEFAULT_CONFIG,
};
