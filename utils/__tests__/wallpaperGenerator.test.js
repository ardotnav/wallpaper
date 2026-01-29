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
      expect(layout.startX).toBeGreaterThan(0);
      expect(layout.startY).toBeGreaterThan(0);
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
      
      expect(layout.config.width).toBe(2000);
      expect(layout.config.height).toBe(3000);
      expect(layout.config.sidePadding).toBe(100);
    });

    test('should maintain default values for unspecified config', () => {
      const layout = calculateGridLayout(365, { width: 2000 });
      
      expect(layout.config.width).toBe(2000);
      expect(layout.config.height).toBe(DEFAULT_CONFIG.height);
      expect(layout.config.cols).toBe(DEFAULT_CONFIG.cols);
    });
  });

  describe('generateSVG', () => {
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

    test('should have filled rectangles for completed days', () => {
      const date = new Date(2024, 0, 15); // Day 15, so 14 days completed
      const svg = generateSVG(date);
      
      // Count filled rectangles (includes completed days + digit segments for percentage)
      const filledRectMatches = svg.match(/<rect[^>]*fill="#FFFFFF"[^>]*\/>/g) || [];
      // Should have at least 14 completed days (plus some digit segments)
      expect(filledRectMatches.length).toBeGreaterThanOrEqual(14);
    });

    test('should have empty rectangles for current and future days', () => {
      const date = new Date(2024, 0, 15); // Day 15 of 366, 14 completed
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);
      
      // Should have empty rectangles for current day + future days
      const emptyRects = (svg.match(/<rect[^>]*fill="none"[^>]*stroke/g) || []).length;
      expect(emptyRects).toBeGreaterThanOrEqual(totalDays - 14);
    });

    test('should include year progress percentage using shapes', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);
      
      // Percentage is rendered using rect elements for 7-segment digits
      // Count rects (background + digit segments)
      const rectMatches = svg.match(/<rect/g);
      expect(rectMatches).not.toBeNull();
      expect(rectMatches.length).toBeGreaterThan(1); // More than just background
    });

    test('should use custom colors when provided', () => {
      const customConfig = {
        backgroundColor: '#FF0000',
        filledCircleColor: '#00FF00',
        emptyCircleColor: '#0000FF',
      };
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date, customConfig);
      
      expect(svg).toContain('fill="#FF0000"'); // Background
      expect(svg).toContain('fill="#00FF00"'); // Filled circles
      expect(svg).toContain('stroke="#0000FF"'); // Empty circles
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
      
      // 0 filled day rectangles, but some digit segments for percentage display
      // All 366 day rectangles should be empty (unfilled)
      const emptyDayRects = (svg.match(/<rect[^>]*fill="none"[^>]*stroke/g) || []).length;
      expect(emptyDayRects).toBe(366); // All days are empty on Jan 1st
    });

    test('should handle year end correctly', () => {
      const date = new Date(2024, 11, 31); // December 31st (leap year, 365 days completed)
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);
      
      // All completed day rectangles (totalDays - 1) should be filled
      // Plus some digit segments for percentage display
      const filledRectMatches = svg.match(/<rect[^>]*fill="#FFFFFF"[^>]*\/>/g) || [];
      expect(filledRectMatches.length).toBeGreaterThanOrEqual(totalDays - 1);
      
      // 1 empty rectangle for the current day (Dec 31st)
      const emptyDayRects = (svg.match(/<rect[^>]*fill="none"[^>]*stroke/g) || []).length;
      expect(emptyDayRects).toBe(1);
    });

    test('should include month letters for last day of each month', () => {
      const date = new Date(2024, 6, 15); // July 15, 2024 (leap year)
      const svg = generateSVG(date);
      
      // Month letters are drawn as shapes (rects/polygons), not text
      // Check that we have polygon elements (used for M and N letters)
      const polygonMatches = svg.match(/<polygon/g) || [];
      // By July 15, we've passed Jan (j), Feb (f), Mar (m), Apr (a), May (m), Jun (j)
      // M appears twice (Mar, May) and each M has 2 polygons
      expect(polygonMatches.length).toBeGreaterThanOrEqual(4);
    });

    test('should have shapes for 12 month letters total for the year', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const svg = generateSVG(date);
      
      // Month letters use polygons for M and N shapes
      // M appears twice (Mar, May), N appears once (Nov) - each has 2 and 1 polygon respectively
      const polygonMatches = svg.match(/<polygon/g) || [];
      // 2 M letters * 2 polygons + 1 N letter * 1 polygon = 5 polygons minimum
      expect(polygonMatches.length).toBeGreaterThanOrEqual(5);
    });
  });
});
