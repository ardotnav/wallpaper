const { getCompletedDays, getTotalDaysInYear, getYearProgress } = require('./dateUtils');

// Default configuration
const DEFAULT_CONFIG = {
  width: 1170,
  height: 2532,
  cols: 14,  // 2 weeks per row
  topPadding: 500,  // Space for status bar + date + time
  sidePadding: 100,  // Side margins
  percentageSpace: 120,  // Space between grid and percentage text
  bottomPadding: 350,  // Space for widgets + home indicator (below percentage)
  circleRadiusMultiplier: 0.32,
  backgroundColor: '#000000',
  filledCircleColor: '#FFFFFF',
  emptyCircleColor: '#404040',  // Subtle but visible
  textColor: '#FFFFFF',
  strokeWidth: 1.5,
};

/**
 * Calculate grid layout parameters
 */
function calculateGridLayout(totalDays, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const rows = Math.ceil(totalDays / cfg.cols);
  
  // Calculate available space (reserve space for percentage text)
  const gridWidth = cfg.width - (cfg.sidePadding * 2);
  const gridHeight = cfg.height - cfg.topPadding - cfg.percentageSpace - cfg.bottomPadding;
  
  // Calculate spacing based on available space
  const cellWidth = gridWidth / cfg.cols;
  const cellHeight = gridHeight / rows;
  const circleSpacing = Math.min(cellWidth, cellHeight);
  const circleRadius = circleSpacing * cfg.circleRadiusMultiplier;
  
  // Center the grid in the available space (grid area only, not including percentage)
  const totalGridWidth = cfg.cols * circleSpacing;
  const totalGridHeight = rows * circleSpacing;
  const startX = cfg.sidePadding + (gridWidth - totalGridWidth) / 2;
  const startY = cfg.topPadding + (gridHeight - totalGridHeight) / 2;
  
  return {
    rows,
    cols: cfg.cols,
    circleSpacing,
    circleRadius,
    startX,
    startY,
    config: cfg,
  };
}

/**
 * Draw a single digit using simple rectangles (7-segment style)
 */
function drawDigit(digit, x, y, width, height, color) {
  const w = width;
  const h = height;
  const t = Math.max(width * 0.16, 7); // segment thickness
  const g = t * 0.2; // gap
  
  // Segment positions: top, top-left, top-right, middle, bottom-left, bottom-right, bottom
  const segments = {
    '0': [1, 1, 1, 0, 1, 1, 1],
    '1': [0, 0, 1, 0, 0, 1, 0],
    '2': [1, 0, 1, 1, 1, 0, 1],
    '3': [1, 0, 1, 1, 0, 1, 1],
    '4': [0, 1, 1, 1, 0, 1, 0],
    '5': [1, 1, 0, 1, 0, 1, 1],
    '6': [1, 1, 0, 1, 1, 1, 1],
    '7': [1, 0, 1, 0, 0, 1, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1],
  };
  
  const seg = segments[digit];
  if (!seg) return '';
  
  let svg = '';
  const r = t / 2.5; // corner radius
  
  // Top horizontal
  if (seg[0]) svg += `<rect x="${x + t}" y="${y}" width="${w - 2*t}" height="${t}" fill="${color}" rx="${r}"/>`;
  // Top-left vertical
  if (seg[1]) svg += `<rect x="${x}" y="${y + t + g}" width="${t}" height="${h/2 - t - g*2}" fill="${color}" rx="${r}"/>`;
  // Top-right vertical
  if (seg[2]) svg += `<rect x="${x + w - t}" y="${y + t + g}" width="${t}" height="${h/2 - t - g*2}" fill="${color}" rx="${r}"/>`;
  // Middle horizontal
  if (seg[3]) svg += `<rect x="${x + t}" y="${y + h/2 - t/2}" width="${w - 2*t}" height="${t}" fill="${color}" rx="${r}"/>`;
  // Bottom-left vertical
  if (seg[4]) svg += `<rect x="${x}" y="${y + h/2 + g}" width="${t}" height="${h/2 - t - g*2}" fill="${color}" rx="${r}"/>`;
  // Bottom-right vertical
  if (seg[5]) svg += `<rect x="${x + w - t}" y="${y + h/2 + g}" width="${t}" height="${h/2 - t - g*2}" fill="${color}" rx="${r}"/>`;
  // Bottom horizontal
  if (seg[6]) svg += `<rect x="${x + t}" y="${y + h - t}" width="${w - 2*t}" height="${t}" fill="${color}" rx="${r}"/>`;
  
  return svg;
}

/**
 * Draw a decimal point
 */
function drawDot(x, y, size, color) {
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" rx="${size/3}"/>`;
}

/**
 * Draw a percent sign using two circles and a diagonal line
 */
function drawPercent(x, y, width, height, color) {
  const circleR = height * 0.14;  // Radius of the small circles
  const strokeW = Math.max(height * 0.1, 5);  // Line thickness
  
  let svg = '';
  
  // Top-left small circle (filled)
  const topCircleX = x + circleR + strokeW/2;
  const topCircleY = y + circleR + strokeW/2;
  svg += `<circle cx="${topCircleX}" cy="${topCircleY}" r="${circleR}" fill="${color}"/>`;
  
  // Bottom-right small circle (filled)
  const bottomCircleX = x + width - circleR - strokeW/2;
  const bottomCircleY = y + height - circleR - strokeW/2;
  svg += `<circle cx="${bottomCircleX}" cy="${bottomCircleY}" r="${circleR}" fill="${color}"/>`;
  
  // Diagonal line from top-right to bottom-left
  const lineX1 = x + width - strokeW;
  const lineY1 = y + strokeW;
  const lineX2 = x + strokeW;
  const lineY2 = y + height - strokeW;
  svg += `<line x1="${lineX1}" y1="${lineY1}" x2="${lineX2}" y2="${lineY2}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
  
  return svg;
}

/**
 * Generate SVG for percentage text using simple shapes (no fonts needed)
 */
function generatePercentageText(percentage, centerX, centerY, height, color) {
  const text = String(percentage);
  const digitWidth = height * 0.5;
  const digitSpacing = digitWidth * 1.2;
  const dotWidth = height * 0.18;
  const percentWidth = height * 0.6;
  const gap = height * 0.15; // Gap before % sign
  
  // Calculate character widths
  let totalWidth = 0;
  for (const char of text) {
    if (char === '.') {
      totalWidth += dotWidth + digitSpacing * 0.2;
    } else {
      totalWidth += digitSpacing;
    }
  }
  totalWidth += gap + percentWidth; // Gap + % sign
  
  let currentX = centerX - totalWidth / 2;
  const topY = centerY - height / 2;
  
  let svg = '';
  
  for (const char of text) {
    if (char === '.') {
      svg += drawDot(currentX, topY + height - dotWidth - 4, dotWidth, color);
      currentX += dotWidth + digitSpacing * 0.2;
    } else if (char >= '0' && char <= '9') {
      svg += drawDigit(char, currentX, topY, digitWidth, height, color);
      currentX += digitSpacing;
    }
  }
  
  // Draw percent sign with gap
  currentX += gap;
  svg += drawPercent(currentX, topY, percentWidth, height, color);
  
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
  
  const layout = calculateGridLayout(totalDays, cfg);
  
  let svg = `<svg width="${cfg.width}" height="${cfg.height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Dark background
  svg += `<rect width="${cfg.width}" height="${cfg.height}" fill="${cfg.backgroundColor}"/>`;
  
  // Draw circles for each day
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const dayNumber = row * layout.cols + col + 1;
      const x = layout.startX + col * layout.circleSpacing + layout.circleSpacing / 2;
      const y = layout.startY + row * layout.circleSpacing + layout.circleSpacing / 2;

      if (dayNumber <= totalDays) {
        if (dayNumber <= completedDays) {
          // Filled circle for completed days
          svg += `<circle cx="${x}" cy="${y}" r="${layout.circleRadius}" fill="${cfg.filledCircleColor}"/>`;
        } else {
          // Empty circle for current and future days
          svg += `<circle cx="${x}" cy="${y}" r="${layout.circleRadius}" fill="none" stroke="${cfg.emptyCircleColor}" stroke-width="${cfg.strokeWidth}"/>`;
        }
      }
    }
  }

  // Draw year percentage centered in the space between grid and bottom widgets
  const textHeight = 55;
  const gridBottom = layout.startY + layout.rows * layout.circleSpacing;
  const textY = gridBottom + cfg.percentageSpace / 2;  // Center in percentage space
  
  svg += generatePercentageText(yearProgress, cfg.width / 2, textY, textHeight, cfg.textColor);
  
  svg += `</svg>`;
  
  return svg;
}

module.exports = {
  generateSVG,
  calculateGridLayout,
  DEFAULT_CONFIG,
};
