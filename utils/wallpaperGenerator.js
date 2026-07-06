const { getCompletedDays, getTotalDaysInYear, getYearProgress, getMonthEndDays, getDayOfYear } = require('./dateUtils');
const { getQuoteForDay } = require('./quotes');
const { renderText, drawChar, getCharWidth, measureText } = require('./letterShapes');

// Default configuration
const DEFAULT_CONFIG = {
  width: 1170,
  height: 2532,
  cols: 14, // 2 weeks per row

  topPadding: 420,
  sidePadding: 320,
  percentageSpace: 80,
  quoteSpace: 120,
  bottomPadding: 240,

  // Colors
  backgroundColor: '#0B1626',
  backgroundTop: '#101E32',
  backgroundBottom: '#060B14',
  filledCircleColor: '#E8EDF4',   // completed day cells
  emptyCircleColor: '#182640',    // future day cells
  accentColor: '#F5B84F',         // today marker, bar tip
  textColor: '#EDF1F7',
  captionColor: '#5C6D85',
  quoteColor: '#6C7E96',
  monthLetterOnFilled: '#8E9AAB',
  monthLetterOnEmpty: '#2E4160',
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
 * Word-wrap and render the quote as centered monoline text
 */
function generateQuoteText(quote, centerX, centerY, fontSize, maxWidth, color) {
  const letterSpacing = fontSize * 0.12;

  const words = quote.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (measureText(testLine, fontSize, letterSpacing) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = fontSize * 1.9;
  const totalHeight = (lines.length - 1) * lineHeight + fontSize;
  const startY = centerY - totalHeight / 2;

  let svg = '';
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
  const boxSize = uniformSpacing * 0.82;
  const gap = uniformSpacing - boxSize;
  const cornerRadius = +(boxSize * 0.3).toFixed(2);

  const totalGridWidth = layout.cols * uniformSpacing;
  const totalGridHeight = layout.rows * uniformSpacing;
  const gridStartX = (cfg.width - totalGridWidth) / 2;
  const gridStartY = cfg.topPadding + (cfg.height - cfg.topPadding - cfg.percentageSpace - cfg.quoteSpace - cfg.bottomPadding - totalGridHeight) / 2;

  const monthEndDays = getMonthEndDays(year);
  const letterSize = boxSize * 0.5;

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const dayNumber = row * layout.cols + col + 1;
      if (dayNumber > totalDays) continue;

      const x = +(gridStartX + col * uniformSpacing + gap / 2).toFixed(2);
      const y = +(gridStartY + row * uniformSpacing + gap / 2).toFixed(2);
      const monthLetter = monthEndDays[dayNumber];
      const cell = (fill) =>
        `<rect x="${x}" y="${y}" width="${boxSize.toFixed(2)}" height="${boxSize.toFixed(2)}" rx="${cornerRadius}" fill="${fill}"/>`;
      const letter = (color) => {
        if (!monthLetter) return '';
        const lx = x + (boxSize - getCharWidth(monthLetter, letterSize)) / 2;
        const ly = y + (boxSize - letterSize) / 2;
        return drawChar(monthLetter, lx, ly, letterSize, color);
      };

      if (dayNumber === todayNumber) {
        // Today: accent cell with a soft glow so you can find yourself in the year
        const cx = x + boxSize / 2;
        const cy = y + boxSize / 2;
        svg += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(boxSize * 2.4).toFixed(2)}" fill="url(#todayGlow)"/>`;
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

  // Year percentage in monoline digits, centered below grid
  const pctSize = 52;
  const pctCenterY = gridBottom + cfg.percentageSpace / 2;
  svg += renderText(`${yearProgress}%`, cfg.width / 2, pctCenterY - pctSize / 2, pctSize, cfg.textColor, pctSize * 0.1);

  // Daily quote centered below percentage
  const dayOfYear = getDayOfYear(date);
  const quote = getQuoteForDay(dayOfYear);
  const quoteCenterY = gridBottom + cfg.percentageSpace + cfg.quoteSpace / 2;
  svg += generateQuoteText(quote, cfg.width / 2, quoteCenterY, 26, cfg.width - 120, cfg.quoteColor);

  svg += `</svg>`;

  return svg;
}

module.exports = {
  generateSVG,
  calculateGridLayout,
  DEFAULT_CONFIG,
};
