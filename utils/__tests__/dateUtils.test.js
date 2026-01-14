const {
  getDayOfYear,
  isLeapYear,
  getYearProgress,
  getTotalDaysInYear,
} = require('../dateUtils');

describe('dateUtils', () => {
  describe('getDayOfYear', () => {
    test('should return 1 for January 1st', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      expect(getDayOfYear(date)).toBe(1);
    });

    test('should return 365 for December 31st in non-leap year', () => {
      const date = new Date(2023, 11, 31); // December 31, 2023
      expect(getDayOfYear(date)).toBe(365);
    });

    test('should return 366 for December 31st in leap year', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      expect(getDayOfYear(date)).toBe(366);
    });

    test('should return correct day for mid-year date', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      expect(getDayOfYear(date)).toBe(167);
    });
  });

  describe('isLeapYear', () => {
    test('should return true for leap years divisible by 4 but not 100', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2016)).toBe(true);
    });

    test('should return false for non-leap years', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2022)).toBe(false);
      expect(isLeapYear(2021)).toBe(false);
    });

    test('should return false for years divisible by 100 but not 400', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(1800)).toBe(false);
    });

    test('should return true for years divisible by 400', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1600)).toBe(true);
    });
  });

  describe('getTotalDaysInYear', () => {
    test('should return 365 for non-leap years', () => {
      expect(getTotalDaysInYear(2023)).toBe(365);
      expect(getTotalDaysInYear(2022)).toBe(365);
    });

    test('should return 366 for leap years', () => {
      expect(getTotalDaysInYear(2024)).toBe(366);
      expect(getTotalDaysInYear(2020)).toBe(366);
      expect(getTotalDaysInYear(2000)).toBe(366);
    });
  });

  describe('getYearProgress', () => {
    test('should return 0.3% for January 1st', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024 (leap year)
      const progress = getYearProgress(date);
      expect(parseFloat(progress)).toBeCloseTo(0.3, 1);
    });

    test('should return approximately 50% for mid-year in non-leap year', () => {
      const date = new Date(2023, 5, 30); // June 30, 2023
      const progress = parseFloat(getYearProgress(date));
      expect(progress).toBeGreaterThan(49);
      expect(progress).toBeLessThan(51);
    });

    test('should return approximately 50% for mid-year in leap year', () => {
      const date = new Date(2024, 6, 2); // July 2, 2024 (leap year, day 184)
      const progress = parseFloat(getYearProgress(date));
      expect(progress).toBeGreaterThan(49);
      expect(progress).toBeLessThan(51);
    });

    test('should return 100.0% for December 31st in non-leap year', () => {
      const date = new Date(2023, 11, 31); // December 31, 2023
      const progress = parseFloat(getYearProgress(date));
      expect(progress).toBeCloseTo(100.0, 1);
    });

    test('should return 100.0% for December 31st in leap year', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const progress = parseFloat(getYearProgress(date));
      expect(progress).toBeCloseTo(100.0, 1);
    });

    test('should return a string with one decimal place', () => {
      const date = new Date(2024, 5, 15);
      const progress = getYearProgress(date);
      expect(progress).toMatch(/^\d+\.\d$/);
    });
  });
});
