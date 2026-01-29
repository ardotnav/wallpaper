const {
  getIndiaDate,
  getDayOfYear,
  getCompletedDays,
  isLeapYear,
  getYearProgress,
  getTotalDaysInYear,
  getMonthEndDays,
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

    test('should return a string with two decimal places', () => {
      const date = new Date(2024, 5, 15);
      const progress = getYearProgress(date);
      expect(progress).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('getMonthEndDays', () => {
    test('should return correct month end days for non-leap year', () => {
      const monthEndMap = getMonthEndDays(2023);
      
      expect(monthEndMap[31]).toBe('j');   // January
      expect(monthEndMap[59]).toBe('f');   // February (31 + 28)
      expect(monthEndMap[90]).toBe('m');   // March (59 + 31)
      expect(monthEndMap[120]).toBe('a');  // April (90 + 30)
      expect(monthEndMap[151]).toBe('m');  // May (120 + 31)
      expect(monthEndMap[181]).toBe('j');  // June (151 + 30)
      expect(monthEndMap[212]).toBe('j');  // July (181 + 31)
      expect(monthEndMap[243]).toBe('a');  // August (212 + 31)
      expect(monthEndMap[273]).toBe('s');  // September (243 + 30)
      expect(monthEndMap[304]).toBe('o');  // October (273 + 31)
      expect(monthEndMap[334]).toBe('n');  // November (304 + 30)
      expect(monthEndMap[365]).toBe('d');  // December (334 + 31)
    });

    test('should return correct month end days for leap year', () => {
      const monthEndMap = getMonthEndDays(2024);
      
      expect(monthEndMap[31]).toBe('j');   // January
      expect(monthEndMap[60]).toBe('f');   // February (31 + 29 leap year)
      expect(monthEndMap[91]).toBe('m');   // March (60 + 31)
      expect(monthEndMap[121]).toBe('a');  // April
      expect(monthEndMap[152]).toBe('m');  // May
      expect(monthEndMap[182]).toBe('j');  // June
      expect(monthEndMap[213]).toBe('j');  // July
      expect(monthEndMap[244]).toBe('a');  // August
      expect(monthEndMap[274]).toBe('s');  // September
      expect(monthEndMap[305]).toBe('o');  // October
      expect(monthEndMap[335]).toBe('n');  // November
      expect(monthEndMap[366]).toBe('d');  // December
    });

    test('should return exactly 12 month end days', () => {
      const monthEndMap = getMonthEndDays(2024);
      expect(Object.keys(monthEndMap).length).toBe(12);
    });
  });
});
