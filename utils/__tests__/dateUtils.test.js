const {
  getIndiaDate,
  getDayOfYear,
  getCompletedDays,
  isLeapYear,
  getYearProgress,
  getTotalDaysInYear,
} = require('../dateUtils');

describe('dateUtils', () => {
  describe('getIndiaDate', () => {
    test('should return a valid Date object', () => {
      const date = getIndiaDate();
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });

    test('should return a date representing midnight', () => {
      const date = getIndiaDate();
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });
  });

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

  describe('getCompletedDays', () => {
    test('should return 0 for January 1st (no days completed yet)', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      expect(getCompletedDays(date)).toBe(0);
    });

    test('should return 17 for January 18th (17 days completed)', () => {
      const date = new Date(2024, 0, 18); // January 18, 2024
      expect(getCompletedDays(date)).toBe(17);
    });

    test('should return 364 for December 31st in non-leap year', () => {
      const date = new Date(2023, 11, 31); // December 31, 2023
      expect(getCompletedDays(date)).toBe(364);
    });

    test('should return 365 for December 31st in leap year', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      expect(getCompletedDays(date)).toBe(365);
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
    test('should return 0.0% for January 1st (no days completed)', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024 (leap year)
      const progress = getYearProgress(date);
      expect(parseFloat(progress)).toBe(0.0);
    });

    test('should return correct progress for January 18th (17 days completed)', () => {
      const date = new Date(2024, 0, 18); // January 18, 2024 (leap year)
      const progress = parseFloat(getYearProgress(date));
      // 17 / 366 * 100 = 4.644...
      expect(progress).toBeCloseTo(4.6, 1);
    });

    test('should return approximately 50% for mid-year in non-leap year', () => {
      const date = new Date(2023, 7, 1); // August 1, 2023 (day 213, 212 completed)
      const progress = parseFloat(getYearProgress(date));
      // 212 / 365 * 100 = 58.08...
      expect(progress).toBeGreaterThan(49);
      expect(progress).toBeLessThan(60);
    });

    test('should return approximately 50% for mid-year in leap year', () => {
      const date = new Date(2024, 6, 3); // July 3, 2024 (leap year, day 185, 184 completed)
      const progress = parseFloat(getYearProgress(date));
      // 184 / 366 * 100 = 50.27...
      expect(progress).toBeGreaterThan(49);
      expect(progress).toBeLessThan(52);
    });

    test('should return ~99.7% for December 31st in non-leap year (364 days completed)', () => {
      const date = new Date(2023, 11, 31); // December 31, 2023
      const progress = parseFloat(getYearProgress(date));
      // 364 / 365 * 100 = 99.726...
      expect(progress).toBeCloseTo(99.7, 1);
    });

    test('should return ~99.7% for December 31st in leap year (365 days completed)', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const progress = parseFloat(getYearProgress(date));
      // 365 / 366 * 100 = 99.726...
      expect(progress).toBeCloseTo(99.7, 1);
    });

    test('should return a string with one decimal place', () => {
      const date = new Date(2024, 5, 15);
      const progress = getYearProgress(date);
      expect(progress).toMatch(/^\d+\.\d$/);
    });
  });
});
