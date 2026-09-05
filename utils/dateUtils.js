// Get the current calendar date in a requested IANA time zone. Invalid or
// unavailable zones fall back to IST, preserving the original behavior.
function getDateInTimeZone(timeZone = 'Asia/Kolkata') {
  const now = new Date();
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year').value);
  const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
  const day = parseInt(parts.find(p => p.type === 'day').value);
  return new Date(year, month, day);
}

function getIndiaDate() {
  return getDateInTimeZone('Asia/Kolkata');
}

// Calculate day of year (1-365/366)
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Get number of completed days (0 on Jan 1, 17 on Jan 18, etc.)
function getCompletedDays(date) {
  return getDayOfYear(date) - 1;
}

// Check if year is leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Calculate year progress percentage (based on completed days)
function getYearProgress(date) {
  const completedDays = getCompletedDays(date);
  const totalDays = isLeapYear(date.getFullYear()) ? 366 : 365;
  return ((completedDays / totalDays) * 100).toFixed(2);
}

// Get total days in a year
function getTotalDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

// Get the last day of each month as day-of-year numbers
// Returns an object mapping day number to month letter
function getMonthEndDays(year) {
  const monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthLetters = ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'];
  
  const monthEndMap = {};
  let dayOfYear = 0;
  
  for (let i = 0; i < 12; i++) {
    dayOfYear += monthDays[i];
    monthEndMap[dayOfYear] = monthLetters[i];
  }
  
  return monthEndMap;
}

module.exports = {
  getDateInTimeZone,
  getIndiaDate,
  getDayOfYear,
  getCompletedDays,
  isLeapYear,
  getYearProgress,
  getTotalDaysInYear,
  getMonthEndDays,
};
