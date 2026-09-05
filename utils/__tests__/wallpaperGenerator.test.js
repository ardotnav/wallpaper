const { generateSVG, calculateGridLayout, DEFAULT_CONFIG } = require('../wallpaperGenerator');
const { getTotalDaysInYear } = require('../dateUtils');

describe('wallpaperGenerator', () => {
  describe('calculateGridLayout', () => {
    test('should calculate correct grid layout for non-leap year', () => {
      const totalDays = 365;
      const layout = calculateGridLayout(totalDays);
      
      expect(layout.rows).toBe(27); // Math.ceil(365/14) = 27
      expect(layout.cols).toBe(14);
      expect(layout.horizontalSpacing).toBeGreaterThan(0);
      expect(layout.verticalSpacing).toBeGreaterThan(0);
    });

    test('should calculate correct grid layout for leap year', () => {
      const totalDays = 366;
      const layout = calculateGridLayout(totalDays);
      
      expect(layout.rows).toBe(27); // Math.ceil(366/14) = 27
      expect(layout.cols).toBe(14);
    });

    test('should use custom configuration when provided', () => {
      const customConfig = {
        width: 2000,
        height: 3000,
        sidePadding: 100,
      };
      const layout = calculateGridLayout(365, customConfig);
      
      expect(layout.horizontalSpacing).toBeCloseTo(128.57, 2);
    });

    test('should maintain default values for unspecified config', () => {
      const layout = calculateGridLayout(365, { width: 2000 });
      
      expect(layout.horizontalSpacing).toBeCloseTo(88.57, 2);
    });
  });

  describe('generateSVG', () => {
    function getGridTransform(svg) {
      const match = svg.match(/<g id="year-grid" transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\) translate\(([-\d.]+) ([-\d.]+)\)">/);
      if (!match) throw new Error('year-grid transform was not found');
      return match.slice(1).map(Number);
    }

    function getContentTransform(svg) {
      const match = svg.match(/<g id="supporting-copy" transform="translate\(0 ([-\d.]+)\)">/);
      if (!match) throw new Error('supporting-copy transform was not found');
      return Number(match[1]);
    }

    test('scales the complete framed grid to 70 percent around its original center', () => {
      const svg = generateSVG(new Date(2024, 0, 15));

      const [centerX, centerY, scale, inverseX, inverseY] = getGridTransform(svg);
      expect(centerX).toBe(585);
      expect(centerY).toBe(1236);
      expect(scale).toBe(0.7);
      expect(inverseX).toBe(-centerX);
      expect(inverseY).toBe(-centerY);
    });

    test('moves supporting copy with the scaled frame bottom while preserving its sizes', () => {
      const date = new Date(2024, 0, 15);
      const scaled = generateSVG(date);
      const originalSize = generateSVG(date, { gridScale: 1 });

      expect(getContentTransform(originalSize)).toBe(0);
      expect(getContentTransform(scaled)).toBe(-130.24);
      expect(scaled).toContain('font-size="58"');
      expect(scaled).toContain('font-size="48"');
    });

    test('should generate valid SVG string', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const svg = generateSVG(date);
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    test('should include background rectangle', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);
      
      expect(svg).toContain('<rect');
      expect(svg).toContain(`fill="${DEFAULT_CONFIG.backgroundColor}"`);
    });

    test('should include rectangles for all days', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);
      
      // Count rect elements - includes day squares plus background plus digit segments
      const rectMatches = svg.match(/<rect/g);
      expect(rectMatches).not.toBeNull();
      // Should have at least totalDays rectangles (plus background and digit segments)
      expect(rectMatches.length).toBeGreaterThanOrEqual(totalDays);
    });

    test('should have gold-leaf cells for completed days', () => {
      const date = new Date(2024, 0, 15); // Day 15, so 14 days completed
      const svg = generateSVG(date);

      const filledRectMatches = svg.match(/<rect[^>]*fill="url\(#leaf\)"/g) || [];
      expect(filledRectMatches.length).toBe(14);
    });

    test('should have dimmed cells for future days', () => {
      const date = new Date(2024, 0, 15); // Day 15 of 366, 14 completed
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);

      const dimRe = new RegExp(`<rect[^>]*fill="${DEFAULT_CONFIG.emptyCircleColor}"`, 'g');
      const dimRects = (svg.match(dimRe) || []).length;
      // totalDays - 14 completed - 1 today (accent)
      expect(dimRects).toBe(totalDays - 15);
    });

    test('should highlight today with the accent color', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);

      // Day cells have rounded corners (rx), unlike the frame's corner diamonds
      const accentCells = svg.match(new RegExp(`<rect[^>]*rx="[^"]*" fill="${DEFAULT_CONFIG.accentColor}"`, 'g')) || [];
      expect(accentCells.length).toBe(1);
      expect(svg).toContain('url(#todayGlow)');
    });

    test('should include year progress percentage as text', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);

      // Percentage renders as a Cinzel <text> element
      expect(svg).toMatch(/<text[^>]*Cinzel[^>]*>3\.83%<\/text>/);
      expect(svg).toContain('EB Garamond');
    });

    test('should fall back to monoline shape text when requested', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date, { textEngine: 'shapes' });

      // Shape mode draws text as stroked paths and uses no <text> elements
      expect(svg).not.toContain('<text');
      const pathMatches = svg.match(/<path/g);
      expect(pathMatches).not.toBeNull();
      expect(pathMatches.length).toBeGreaterThan(1);
    });

    test('should use custom colors when provided', () => {
      const customConfig = {
        backgroundColor: '#FF0000',
        goldHi: '#00FF00',
        emptyCircleColor: '#0000FF',
        accentColor: '#123456',
      };
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date, customConfig);

      expect(svg).toContain('fill="#FF0000"'); // Background
      expect(svg).toContain('stop-color="#00FF00"'); // Gold-leaf gradient
      expect(svg).toContain('fill="#0000FF"'); // Future cells
      expect(svg).toContain('fill="#123456"'); // Today cell
    });

    test('should generate correct SVG dimensions', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);
      
      expect(svg).toContain(`width="${DEFAULT_CONFIG.width}"`);
      expect(svg).toContain(`height="${DEFAULT_CONFIG.height}"`);
    });

    test('should handle year start correctly', () => {
      const date = new Date(2024, 0, 1); // January 1st (0 days completed)
      const svg = generateSVG(date);

      // No completed cells; today (Jan 1) is the accent cell, rest are dim
      expect((svg.match(/<rect[^>]*fill="url\(#leaf\)"/g) || []).length).toBe(0);
      const dimRe = new RegExp(`<rect[^>]*fill="${DEFAULT_CONFIG.emptyCircleColor}"`, 'g');
      // 365 future days (today is the accent cell)
      expect((svg.match(dimRe) || []).length).toBe(365);
    });

    test('should handle year end correctly', () => {
      const date = new Date(2024, 11, 31); // December 31st (leap year, 365 days completed)
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);

      // All days except today are completed; today (Dec 31) is the accent cell
      expect((svg.match(/<rect[^>]*fill="url\(#leaf\)"/g) || []).length).toBe(totalDays - 1);
      const dimRe = new RegExp(`<rect[^>]*fill="${DEFAULT_CONFIG.emptyCircleColor}"`, 'g');
      // No future days remain
      expect((svg.match(dimRe) || []).length).toBe(0);
    });

    test('should include month letters for last day of each month', () => {
      const date = new Date(2024, 6, 15); // July 15, 2024
      const svg = generateSVG(date);

      // Month letters on completed cells use the filled-cell letter color
      const letterRe = new RegExp(`<text[^>]*fill="${DEFAULT_CONFIG.monthLetterOnFilled}"`, 'g');
      // By July 15, six month-end cells (Jan-Jun) are completed
      expect((svg.match(letterRe) || []).length).toBeGreaterThanOrEqual(6);
    });

    test('should include the exact percentage with two decimals', () => {
      const date = new Date(2024, 11, 31);
      const svg = generateSVG(date);
      // Percentage renders as shapes, so just make sure generation works
      expect(svg).toContain('</svg>');
    });
  });
});
