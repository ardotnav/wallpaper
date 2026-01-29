// Thoughtful, growth-focused quotes to inspire daily improvement
const QUOTES = [
  "What you do today shapes who you become tomorrow.",
  "The person you want to be is built one day at a time.",
  "Make today worth remembering.",
  "Your future is created by what you do now, not later.",
  "Every skill you admire was once practiced daily.",
  "Today's choices become tomorrow's reality.",
  "You don't have to be perfect. You have to be consistent.",
  "What would your best self do today?",
  "One focused hour can change your trajectory.",
  "Start before you feel ready.",
  "Your habits are shaping your future right now.",
  "Do something today that moves you forward.",
  "The compound effect of daily effort is extraordinary.",
  "You're not behind. You're exactly on time to start.",
  "Action creates clarity. Start moving.",
  "The best version of you is on the other side of consistency.",
  "Today is training for the life you want.",
  "What you practice daily, you become.",
  "Your potential grows when you push your limits.",
  "Make decisions your future self will be proud of.",
  "Discipline today, freedom tomorrow.",
  "You become what you repeatedly do.",
  "Every expert was once a beginner who kept going.",
  "The work you put in when no one is watching matters most.",
  "Your comfort zone is where growth goes to sleep.",
  "Today's effort is tomorrow's strength.",
  "Stop waiting for motivation. Create momentum.",
  "The only way to predict your future is to create it.",
  "What you allow is what will continue.",
  "Invest in yourself. The returns are limitless.",
  "The pain of staying the same outweighs the effort to change.",
  "You teach yourself what you're capable of through action.",
  "Consistency is the bridge between goals and results.",
  "Energy flows where attention goes. Choose wisely.",
  "Today's discomfort is tomorrow's growth.",
  "Be so committed that you inspire yourself.",
  "What you tolerate, you can't change.",
  "Your potential expands when you take action.",
  "Become someone you'd admire.",
  "Every day is a chance to level up.",
  "The work is the shortcut.",
  "Your standards determine your life.",
  "Focus on progress, not perfection.",
  "The seeds you plant today determine your harvest.",
  "Make your actions match your ambitions.",
  "You're capable of more than you've shown yourself.",
  "Success is rented, and rent is due every day.",
  "The right time is whenever you decide to start.",
  "Your future self is depending on you today.",
  "Growth begins at the edge of your comfort zone.",
  "Be patient with results, but impatient with action.",
  "Motivation fades. Systems last.",
  "You don't rise to your goals. You fall to your systems.",
  "Today is a page in your story. Write it well.",
  "Seek progress in everything you do.",
  "Your trajectory matters more than your position.",
  "Clarity comes from action, not thought.",
  "The obstacle in front of you is your next teacher.",
  "Be the person who follows through.",
  "Your identity is shaped by your daily choices.",
  "What feels like slow progress is still progress.",
  "The things worth having take time to build.",
  "Focused effort beats scattered intention.",
  "Build momentum. It's your greatest asset.",
  "Your goals don't care about your excuses.",
  "Improvement isn't always visible, but it's always happening.",
  "What would happen if you gave it your all today?",
  "You get what you work for, not what you wish for.",
  "Excellence is a habit, not an event.",
  "Your ceiling becomes your floor with consistent effort.",
  "Make the most of what's in front of you.",
  "Every action is a vote for the person you want to become.",
  "The best investment you can make is in yourself.",
  "Start where you are. Use what you have. Do what you can.",
  "Finish what you start. That's the difference.",
  "The days are long, but the years are short. Use them well.",
  "Show up even when you don't feel like it.",
  "Your breakthrough is hiding behind your next effort.",
  "Great things are built through unglamorous daily work.",
  "Be ruthless about what deserves your time.",
  "Your life gets better when you do.",
  "The path to mastery is paved with daily practice.",
  "Don't let yesterday take up too much of today.",
  "What you're doing today is shaping your legacy.",
];

/**
 * Get quote for a specific day of the year
 * Cycles through quotes when we run out
 * @param {number} dayOfYear - Day of year (1-366)
 * @returns {string} Quote for that day
 */
function getQuoteForDay(dayOfYear) {
  // Use modulo to cycle through quotes
  const index = (dayOfYear - 1) % QUOTES.length;
  return QUOTES[index];
}

/**
 * Get total number of unique quotes
 * @returns {number}
 */
function getTotalQuotes() {
  return QUOTES.length;
}

module.exports = {
  QUOTES,
  getQuoteForDay,
  getTotalQuotes,
};
