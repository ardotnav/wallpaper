const { getCompletedDays, getTotalDaysInYear, getYearProgress, getMonthEndDays, getDayOfYear } = require('./dateUtils');
const { getQuoteForDay } = require('./quotes');
const { renderText, drawChar, getCharWidth, measureText } = require('./letterShapes');

// Default configuration
const DEFAULT_CONFIG = {
  width: 1170,
  height: 2532,
  cols: 14, // 2 weeks per row

  // iOS zooms wallpapers slightly (~9%) for the parallax effect, so keep
  // content clear of the bottom lock-screen shortcuts
  topPadding: 420,
  sidePadding: 320,
  percentageSpace: 80,
  quoteSpace: 120,
  bottomPadding: 340,

  // 'font' renders text with the bundled Space Grotesk TTFs; 'shapes' falls
  // back to the built-in monoline glyphs when the fonts are unavailable
  textEngine: 'font',

  // Colors
  backgroundColor: '#0B1626',
  backgroundTop: '#101E32',
  backgroundBottom: '#060B14',
  filledCircleColor: '#E8EDF4',   // completed day cells
  emptyCircleColor: '#182640',    // future day cells
  accentColor: '#F5B84F',         // today marker
  textColor: '#EDF1F7',
  captionColor: '#5C6D85',
  quoteColor: '#7B89A0',
  monthLetterOnFilled: '#64748B',
  monthLetterOnEmpty: '#35496D',
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
 * Emit an SVG <text> element set in the bundled Space Grotesk
 */
function svgText(text, x, y, { size, weight, fill, spacing }) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${+x.toFixed(2)}" y="${+y.toFixed(2)}" font-family="'Space Grotesk', sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${ls} text-anchor="middle">${escapeXml(text)}</text>`;
}

/**
 * Rough width estimate for Space Grotesk (used only for word-wrapping)
 */
function estimateTextWidth(text, fontSize) {
  let units = 0;
  for (const ch of text) {
    if (ch === ' ') units += 0.3;
    else if ("iljt.,'!".includes(ch)) units += 0.3;
    else if ('mwMW'.includes(ch)) units += 0.88;
    else if (/[A-Z0-9]/.test(ch)) units += 0.68;
    else units += 0.56;
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
    const lineHeight = fontSize * 1.55;
    lines.forEach((line, index) => {
      const lineCenterY = centerY + (index - (lines.length - 1) / 2) * lineHeight;
      svg += svgText(line, centerX, lineCenterY + fontSize * 0.35, {
        size: fontSize, weight: 500, fill: color, spacing: 0.5,
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

  // Gradient background with a faint glow behind the grid for depth
  svg += `<defs>`;
  svg += `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">`;
  svg += `<stop offset="0" stop-color="${cfg.backgroundTop}"/>`;
  svg += `<stop offset="1" stop-color="${cfg.backgroundBottom}"/>`;
  svg += `</linearGradient>`;
  svg += `<radialGradient id="todayGlow">`;
  svg += `<stop offset="0" stop-color="${cfg.accentColor}" stop-opacity="0.4"/>`;
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
      const cell = (fill) =>
        `<rect x="${x}" y="${y}" width="${boxSize.toFixed(2)}" height="${boxSize.toFixed(2)}" rx="${cornerRadius}" fill="${fill}"/>`;
      const letter = (color) => {
        if (!monthLetter) return '';
        if (useFont) {
          const fontSize = boxSize * 0.56;
          return svgText(monthLetter.toUpperCase(), x + boxSize / 2, y + boxSize / 2 + fontSize * 0.36, {
            size: +fontSize.toFixed(2), weight: 700, fill: color,
          });
        }
        const lx = x + (boxSize - getCharWidth(monthLetter, letterSize)) / 2;
        const ly = y + (boxSize - letterSize) / 2;
        return drawChar(monthLetter, lx, ly, letterSize, color);
      };

      if (dayNumber === todayNumber) {
        // Today: accent cell with a soft glow so you can find yourself in the year
        const cx = x + boxSize / 2;
        const cy = y + boxSize / 2;
        svg += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(boxSize * 2.6).toFixed(2)}" fill="url(#todayGlow)"/>`;
        svg += cell(cfg.accentColor);
        svg += letter(cfg.backgroundBottom);
      } else if (dayNumber <= completedDays) {
        svg += cell(cfg.filledCircleColor);
        svg += letter(cfg.monthLetterOnFilled);
      } else {
        svg += cell(cfg.emptyCircleColor);
        svg += letter(cfg.monthLetterOnEmpty);
      }
    }
  }

  const gridBottom = gridStartY + totalGridHeight;

  // Year percentage centered below grid
  const pctCenterY = gridBottom + cfg.percentageSpace / 2;
  if (useFont) {
    svg += svgText(`${yearProgress}%`, cfg.width / 2, pctCenterY + 64 * 0.35, {
      size: 64, weight: 700, fill: cfg.textColor, spacing: 1,
    });
  } else {
    svg += renderText(`${yearProgress}%`, cfg.width / 2, pctCenterY - 28, 56, cfg.textColor, 56 * 0.12);
  }

  // Daily quote centered below percentage, kept narrow so it never runs edge-to-edge
  const dayOfYear = getDayOfYear(date);
  const quote = getQuoteForDay(dayOfYear);
  const quoteCenterY = gridBottom + cfg.percentageSpace + cfg.quoteSpace / 2;
  svg += generateQuoteText(quote, cfg.width / 2, quoteCenterY, useFont ? 30 : 26, 820, cfg.quoteColor, useFont);

  svg += `</svg>`;

  return svg;
}

module.exports = {
  generateSVG,
  calculateGridLayout,
  DEFAULT_CONFIG,
};
