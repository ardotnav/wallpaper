// Calculate day of year (1-365/366)
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Check if year is leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Calculate year progress percentage
function getYearProgress(date) {
  const dayOfYear = getDayOfYear(date);
  const totalDays = isLeapYear(date.getFullYear()) ? 366 : 365;
  return ((dayOfYear / totalDays) * 100).toFixed(1);
}

// Get total days in a year
function getTotalDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

module.exports = {
  getDayOfYear,
  isLeapYear,
  getYearProgress,
  getTotalDaysInYear,
};
