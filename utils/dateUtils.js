// Get the current date in India Standard Time (IST, UTC+5:30)
function getIndiaDate() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year').value);
  const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
  const day = parseInt(parts.find(p => p.type === 'day').value);
  return new Date(year, month, day);
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
  return ((completedDays / totalDays) * 100).toFixed(1);
}

// Get total days in a year
function getTotalDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

module.exports = {
  getIndiaDate,
  getDayOfYear,
  getCompletedDays,
  isLeapYear,
  getYearProgress,
  getTotalDaysInYear,
};
