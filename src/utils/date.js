export function getDailyDateString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type) => parts.find(p => p.type === type).value;
  
  let year = parseInt(getPart('year'));
  let month = parseInt(getPart('month'));
  let day = parseInt(getPart('day'));
  let hour = parseInt(getPart('hour'));
  
  // 8 AM rollover logic
  if (hour < 8) {
    const d = new Date(Date.UTC(year, month - 1, day - 1));
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  }
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
