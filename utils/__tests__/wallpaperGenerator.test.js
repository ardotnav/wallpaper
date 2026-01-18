const { generateSVG, calculateGridLayout, DEFAULT_CONFIG } = require('../wallpaperGenerator');
const { getTotalDaysInYear } = require('../dateUtils');

describe('wallpaperGenerator', () => {
  describe('calculateGridLayout', () => {
    test('should calculate correct grid layout for non-leap year', () => {
      const totalDays = 365;
      const layout = calculateGridLayout(totalDays);
      
      expect(layout.rows).toBe(27); // Math.ceil(365/14) = 27
      expect(layout.cols).toBe(14);
      expect(layout.circleSpacing).toBeGreaterThan(0);
      expect(layout.circleRadius).toBeGreaterThan(0);
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

    test('should include circles for all days', () => {
      const date = new Date(2024, 0, 15);
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);
      
      // Count circle elements - includes day circles plus percent sign circles
      const circleMatches = svg.match(/<circle/g);
      expect(circleMatches).not.toBeNull();
      // Should have at least totalDays circles (plus some for percent sign)
      expect(circleMatches.length).toBeGreaterThanOrEqual(totalDays);
    });

    test('should have filled circles for completed days', () => {
      const date = new Date(2024, 0, 15); // Day 15, so 14 days completed
      const svg = generateSVG(date);
      
      // Count filled circles (circle elements with fill="#FFFFFF")
      // Includes 14 completed day circles + 2 circles from the % sign
      const filledCircleMatches = svg.match(/<circle[^>]*fill="#FFFFFF"/g) || [];
      expect(filledCircleMatches.length).toBe(14 + 2); // 14 completed days + 2 from % sign
    });

    test('should have empty circles for current and future days', () => {
      const date = new Date(2024, 0, 15); // Day 15 of 366, 14 completed
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);
      
      // Should have empty circles for current day + future days
      const emptyCircles = (svg.match(/<circle[^>]*fill="none"[^>]*stroke/g) || []).length;
      expect(emptyCircles).toBeGreaterThanOrEqual(totalDays - 14);
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
      
      // 0 filled day circles + 2 circles from % sign
      const filledCircleMatches = svg.match(/<circle[^>]*fill="#FFFFFF"/g) || [];
      expect(filledCircleMatches.length).toBe(0 + 2);
    });

    test('should handle year end correctly', () => {
      const date = new Date(2024, 11, 31); // December 31st (leap year, 365 days completed)
      const svg = generateSVG(date);
      const totalDays = getTotalDaysInYear(2024);
      
      // All completed day circles (totalDays - 1) + 2 from % sign should be filled
      const filledCircleMatches = svg.match(/<circle[^>]*fill="#FFFFFF"/g) || [];
      expect(filledCircleMatches.length).toBe((totalDays - 1) + 2);
      
      // 1 empty circle for the current day (Dec 31st)
      const emptyDayCircles = (svg.match(/<circle[^>]*fill="none"[^>]*stroke="#404040"/g) || []).length;
      expect(emptyDayCircles).toBe(1);
    });
  });
});
