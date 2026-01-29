const { QUOTES, getQuoteForDay, getTotalQuotes } = require('../quotes');

describe('Quotes Module', () => {
  describe('QUOTES array', () => {
    it('should have at least 50 quotes', () => {
      expect(QUOTES.length).toBeGreaterThanOrEqual(50);
    });

    it('should contain only non-empty strings', () => {
      QUOTES.forEach(quote => {
        expect(typeof quote).toBe('string');
        expect(quote.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have no duplicate quotes', () => {
      const uniqueQuotes = new Set(QUOTES);
      expect(uniqueQuotes.size).toBe(QUOTES.length);
    });
  });

  describe('getQuoteForDay', () => {
    it('should return first quote for day 1', () => {
      expect(getQuoteForDay(1)).toBe(QUOTES[0]);
    });

    it('should return second quote for day 2', () => {
      expect(getQuoteForDay(2)).toBe(QUOTES[1]);
    });

    it('should return different quotes for different days', () => {
      const quote1 = getQuoteForDay(1);
      const quote2 = getQuoteForDay(2);
      const quote10 = getQuoteForDay(10);
      
      expect(quote1).not.toBe(quote2);
      expect(quote2).not.toBe(quote10);
    });

    it('should cycle through quotes when running out', () => {
      const totalQuotes = QUOTES.length;
      
      // Day after we run out should cycle back to first quote
      expect(getQuoteForDay(totalQuotes + 1)).toBe(QUOTES[0]);
      expect(getQuoteForDay(totalQuotes + 2)).toBe(QUOTES[1]);
    });

    it('should handle day 365/366 correctly', () => {
      const quote365 = getQuoteForDay(365);
      const quote366 = getQuoteForDay(366);
      
      expect(typeof quote365).toBe('string');
      expect(typeof quote366).toBe('string');
    });

    it('should be deterministic (same day = same quote)', () => {
      expect(getQuoteForDay(50)).toBe(getQuoteForDay(50));
      expect(getQuoteForDay(100)).toBe(getQuoteForDay(100));
    });
  });

  describe('getTotalQuotes', () => {
    it('should return the correct number of quotes', () => {
      expect(getTotalQuotes()).toBe(QUOTES.length);
    });

    it('should return a positive number', () => {
      expect(getTotalQuotes()).toBeGreaterThan(0);
    });
  });
});
