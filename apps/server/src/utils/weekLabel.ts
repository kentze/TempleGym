import { toZonedTime } from 'date-fns-tz';
import { getISOWeek, getISOWeekYear } from 'date-fns';

const TZ = 'Asia/Tokyo';

export function getWeekLabel(date: Date = new Date()): string {
  const jst  = toZonedTime(date, TZ);
  const week = getISOWeek(jst);
  const year = getISOWeekYear(jst);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getNextResetTimestamp(): Date {
  const now            = toZonedTime(new Date(), TZ);
  const daysUntilSun   = (7 - now.getDay()) % 7 || 7;
  const nextSunday     = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSun);
  nextSunday.setHours(23, 59, 0, 0);
  return nextSunday;
}
