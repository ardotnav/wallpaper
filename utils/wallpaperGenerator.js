const { getCompletedDays, getTotalDaysInYear, getYearProgress } = require('./dateUtils');

// Default configuration - grid expands to fill more space
const DEFAULT_CONFIG = {
  width: 1170,
  height: 2532,
  cols: 14,  // 2 weeks per row
  topPadding: 420,
  sidePadding: 320,
  percentageSpace: 80,
  bottomPadding: 360,
  backgroundColor: '#0A1628',  // Darker blue
  filledCircleColor: '#FFFFFF',
  emptyCircleColor: '#333333',
  textColor: '#FFFFFF',
};

/**
 * Calculate grid layout parameters
 */
function calculateGridLayout(totalDays, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const rows = Math.ceil(totalDays / cfg.cols);
  
  // Calculate available space
  const gridWidth = cfg.width - (cfg.sidePadding * 2);
  const gridHeight = cfg.height - cfg.topPadding - cfg.percentageSpace - cfg.bottomPadding;
  
  // Use horizontal spacing to fill the width (1/3 of screen)
  const cellWidth = gridWidth / cfg.cols;
  const cellHeight = gridHeight / rows;
  
  // Separate horizontal and vertical spacing
  const horizontalSpacing = cellWidth;
  const verticalSpacing = cellHeight;
  const circleRadius = Math.min(horizontalSpacing, verticalSpacing) * cfg.circleRadiusMultiplier;
  
  // Center the grid
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
 * Draw a digit using clean, rounded pill shapes
 * Modern, minimal aesthetic
 */
function drawDigit(digit, x, y, width, height, color) {
  const w = width;
  const h = height;
  const t = width * 0.18; // segment thickness
  const g = t * 0.4; // gap between segments
  const r = t / 2; // fully rounded
  
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
  
  // Horizontal segments
  const hLen = w - 2 * t - 2 * g;
  const hX = x + t + g;
  
  // Vertical segments  
  const vLen = h / 2 - t - g * 1.5;
  
  if (seg[0]) svg += `<rect x="${hX}" y="${y}" width="${hLen}" height="${t}" fill="${color}" rx="${r}"/>`;
  if (seg[1]) svg += `<rect x="${x}" y="${y + t + g}" width="${t}" height="${vLen}" fill="${color}" rx="${r}"/>`;
  if (seg[2]) svg += `<rect x="${x + w - t}" y="${y + t + g}" width="${t}" height="${vLen}" fill="${color}" rx="${r}"/>`;
  if (seg[3]) svg += `<rect x="${hX}" y="${y + h/2 - t/2}" width="${hLen}" height="${t}" fill="${color}" rx="${r}"/>`;
  if (seg[4]) svg += `<rect x="${x}" y="${y + h/2 + g}" width="${t}" height="${vLen}" fill="${color}" rx="${r}"/>`;
  if (seg[5]) svg += `<rect x="${x + w - t}" y="${y + h/2 + g}" width="${t}" height="${vLen}" fill="${color}" rx="${r}"/>`;
  if (seg[6]) svg += `<rect x="${hX}" y="${y + h - t}" width="${hLen}" height="${t}" fill="${color}" rx="${r}"/>`;
  
  return svg;
}

/**
 * Draw a decimal point
 */
function drawDot(x, y, size, color) {
  return `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}"/>`;
}

/**
 * Draw percent sign - two small circles and a diagonal
 */
function drawPercent(x, y, width, height, color) {
  const circleR = height * 0.12;
  const strokeW = height * 0.12;
  const padding = circleR + strokeW/2;
  
  let svg = '';
  svg += `<circle cx="${x + padding}" cy="${y + padding}" r="${circleR}" fill="${color}"/>`;
  svg += `<circle cx="${x + width - padding}" cy="${y + height - padding}" r="${circleR}" fill="${color}"/>`;
  svg += `<line x1="${x + width - strokeW}" y1="${y + strokeW}" x2="${x + strokeW}" y2="${y + height - strokeW}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
  
  return svg;
}

/**
 * Generate percentage display using shapes
 */
function generatePercentageText(percentage, centerX, centerY, height, color) {
  const text = String(percentage);
  const digitW = height * 0.55;
  const digitGap = height * 0.15;
  const dotSize = height * 0.15;
  const percentW = height * 0.55;
  const percentGap = height * 0.2;
  
  // Calculate total width
  let totalWidth = 0;
  for (const char of text) {
    if (char === '.') {
      totalWidth += dotSize + digitGap * 0.5;
    } else {
      totalWidth += digitW + digitGap;
    }
  }
  totalWidth += percentGap + percentW;
  totalWidth -= digitGap; // Remove trailing gap
  
  let currentX = centerX - totalWidth / 2;
  const topY = centerY - height / 2;
  
  let svg = '';
  
  for (const char of text) {
    if (char === '.') {
      svg += drawDot(currentX + dotSize/2, topY + height - dotSize/2, dotSize, color);
      currentX += dotSize + digitGap * 0.5;
    } else if (char >= '0' && char <= '9') {
      svg += drawDigit(char, currentX, topY, digitW, height, color);
      currentX += digitW + digitGap;
    }
  }
  
  currentX += percentGap - digitGap;
  svg += drawPercent(currentX, topY, percentW, height, color);
  
  return svg;
}

/**
 * Generate SVG markup for the wallpaper
 * Clean, minimal design
 */
function generateSVG(date, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const year = date.getFullYear();
  const completedDays = getCompletedDays(date);
  const totalDays = getTotalDaysInYear(year);
  const yearProgress = getYearProgress(date);
  
  const layout = calculateGridLayout(totalDays, cfg);
  
  let svg = `<svg width="${cfg.width}" height="${cfg.height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Pure black background
  svg += `<rect width="${cfg.width}" height="${cfg.height}" fill="${cfg.backgroundColor}"/>`;
  
  // Draw grid squares for each day - math notebook style
  // Use uniform spacing (smaller of the two) for both directions
  const uniformSpacing = Math.min(layout.horizontalSpacing, layout.verticalSpacing);
  const boxSize = uniformSpacing * 0.88; // Bigger boxes
  const gap = uniformSpacing - boxSize;
  const strokeWidth = 1;
  
  // Recalculate start positions for uniform grid centered in available space
  const totalGridWidth = layout.cols * uniformSpacing;
  const totalGridHeight = layout.rows * uniformSpacing;
  const gridStartX = (cfg.width - totalGridWidth) / 2;
  const gridStartY = cfg.topPadding + (cfg.height - cfg.topPadding - cfg.percentageSpace - cfg.bottomPadding - totalGridHeight) / 2;
  
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const dayNumber = row * layout.cols + col + 1;
      const x = gridStartX + col * uniformSpacing + gap / 2;
      const y = gridStartY + row * uniformSpacing + gap / 2;

      if (dayNumber <= totalDays) {
        if (dayNumber <= completedDays) {
          // Filled square for completed days
          svg += `<rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" fill="${cfg.filledCircleColor}"/>`;
        } else {
          // Empty square with border for future days
          svg += `<rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" fill="none" stroke="${cfg.emptyCircleColor}" stroke-width="${strokeWidth}"/>`;
        }
      }
    }
  }
  
  // Update gridBottom for percentage positioning
  const gridBottomNew = gridStartY + layout.rows * uniformSpacing;

  // Year percentage - clean typography, centered below grid
  const fontSize = 48;
  const textY = gridBottomNew + cfg.percentageSpace / 2;
  svg += generatePercentageText(yearProgress, cfg.width / 2, textY, fontSize, cfg.textColor);
  
  svg += `</svg>`;
  
  return svg;
}

module.exports = {
  generateSVG,
  calculateGridLayout,
  DEFAULT_CONFIG,
};
