import { format, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, addMonths, endOfMonth as dateFnsEndOfMonth, eachDayOfInterval, parseISO, isValid, setHours, setMinutes, setSeconds, setMilliseconds, getDay, isWithinInterval as dateFnsIsWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DayOfWeek } from './types';
import { DAYS_OF_WEEK_ENGLISH_MAP } from './constants';


export const getWeekDateRange = (date: Date): string => {
  const start = startOfWeek(date, { weekStartsOn: 1, locale: es }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1, locale: es });
  const startMonth = format(start, 'MMMM', { locale: es });
  const endMonth = format(end, 'MMMM', { locale: es });

  if (startMonth === endMonth) {
    return `${format(start, 'd')} - ${format(end, 'd MMMM yyyy', { locale: es })}`;
  }
  return `${format(start, 'd MMMM')} - ${format(end, 'd MMMM yyyy', { locale: es })}`;
};

export const getDaysInWeek = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1, locale: es });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const navigateWeek = (currentDate: Date, direction: 'next' | 'prev' | 'today'): Date => {
  if (direction === 'today') return new Date();
  return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
};

export const formatTime = (date: Date): string => format(date, 'HH:mm');
export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');
export const formatDayMonth = (date: Date): string => format(date, 'd MMM', { locale: es });

export const parseTimeString = (timeString: string, date: Date = new Date()): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return setHours(setMinutes(setSeconds(setMilliseconds(date, 0),0), minutes), hours);
};

export const calculateEndDate = (startDate: Date, duration: '1 Mes' | '3 Meses' | '6 Meses' | 'Indefinido'): Date | null => {
  if (duration === 'Indefinido') return null;
  const monthsToAdd = parseInt(duration.split(' ')[0]);
  return addMonths(startDate, monthsToAdd);
};

// Converts YYYY-MM-DD and HH:mm to a Date object
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const datePart = parseISO(dateStr);
  if (!isValid(datePart)) throw new Error(`Invalid date string: ${dateStr}`);
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  let newDate = setHours(datePart, hours);
  newDate = setMinutes(newDate, minutes);
  newDate = setSeconds(newDate, 0);
  newDate = setMilliseconds(newDate, 0);
  return newDate;
};

export const isRecurringBookingInWeek = (bookingStartDate: string, bookingEndDate: string | null, bookingDayOfWeek: DayOfWeek, weekDays: Date[]): boolean => {
  const sDate = parseISO(bookingStartDate);
  const eDate = bookingEndDate ? parseISO(bookingEndDate) : null;

  const bookingNumericDayOfWeek = DAYS_OF_WEEK_ENGLISH_MAP[bookingDayOfWeek];

  for (const dayInWeek of weekDays) {
    if (getDay(dayInWeek) === bookingNumericDayOfWeek) { // getDay returns 0 for Sun, 1 for Mon...
      // Check if this specific occurrence is within the booking's overall start/end range
      const dateIsAfterOrOnStartDate = dayInWeek >= sDate || formatDate(dayInWeek) === formatDate(sDate);
      const dateIsBeforeOrOnEndDate = !eDate || dayInWeek <= eDate || formatDate(dayInWeek) === formatDate(eDate);
      if (dateIsAfterOrOnStartDate && dateIsBeforeOrOnEndDate) {
        return true;
      }
    }
  }
  return false;
};

export const isDateWithinInterval = (dateToCheck: Date, intervalStart: Date, intervalEnd: Date | null): boolean => {
  if (!intervalEnd) return dateToCheck >= intervalStart; // For 'Indefinido'
  return dateFnsIsWithinInterval(dateToCheck, { start: intervalStart, end: intervalEnd });
};

export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: es });
};

export const getDaysInMonth = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1, locale: es });
  const end = dateFnsEndOfMonth(date);
  return eachDayOfInterval({ start, end });
};
