'use server';

import type { Booking, SingleBooking, RecurringBooking, Teacher, BookingColor, DayOfWeek, DurationOption } from './types';
import { calculateEndDate, combineDateAndTime, formatDate } from './date-utils';
import { revalidatePath } from 'next/cache';
import { DAYS_OF_WEEK_ENGLISH_MAP } from './constants';
import { parseISO, getDay, isWithinInterval, isEqual, addDays } from 'date-fns';

// In-memory store for simulation
let bookings: Booking[] = [
  // Sample initial data for testing
  {
    id: '1',
    type: 'single',
    className: 'Salsa Beginners',
    teacher: 'Oski',
    createdBy: 'Oski',
    date: formatDate(new Date()),
    startTime: '18:00',
    endTime: '19:00',
    color: '#FF6B6B',
  },
  {
    id: '2',
    type: 'recurring',
    className: 'Ballet avanzado',
    teacher: 'Flor',
    createdBy: 'Flor',
    dayOfWeek: 'Miércoles',
    startTime: '20:00',
    endTime: '21:30',
    color: '#4ECDC4',
    startDate: formatDate(new Date()),
    endDate: formatDate(calculateEndDate(new Date(), '3 Meses')!),
    duration: '3 Meses',
  }
];
let nextId = 3;

// --- Helper for Conflict Detection ---
const checkConflict = (newBooking: Booking): Booking | null => {
  const newStartDateTime = combineDateAndTime(
    newBooking.type === 'single' ? newBooking.date : newBooking.startDate, // Use actual date for single, start date for recurring comparison base
    newBooking.startTime
  );
  const newEndDateTime = combineDateAndTime(
    newBooking.type === 'single' ? newBooking.date : newBooking.startDate,
    newBooking.endTime
  );

  for (const existingBooking of bookings) {
    if (newBooking.type === 'single') {
      const singleNewBooking = newBooking as SingleBooking;
      if (existingBooking.type === 'single') {
        // Single vs Single
        const singleExisting = existingBooking as SingleBooking;
        if (singleNewBooking.date === singleExisting.date) {
          const existingStart = combineDateAndTime(singleExisting.date, singleExisting.startTime);
          const existingEnd = combineDateAndTime(singleExisting.date, singleExisting.endTime);
          if (newStartDateTime < existingEnd && newEndDateTime > existingStart) return existingBooking;
        }
      } else {
        // Single vs Recurring
        const recurringExisting = existingBooking as RecurringBooking;
        const newBookingDateObj = parseISO(singleNewBooking.date);
        const bookingDayNum = DAYS_OF_WEEK_ENGLISH_MAP[recurringExisting.dayOfWeek];
        
        if (getDay(newBookingDateObj) === bookingDayNum) {
          const recurringStartDate = parseISO(recurringExisting.startDate);
          const recurringEndDate = recurringExisting.endDate ? parseISO(recurringExisting.endDate) : null;
          if (isWithinInterval(newBookingDateObj, { start: recurringStartDate, end: recurringEndDate || addDays(recurringStartDate, 365*5) })) { // Check if date is within recurring range
            const existingStart = combineDateAndTime(singleNewBooking.date, recurringExisting.startTime); // Compare on the specific date
            const existingEnd = combineDateAndTime(singleNewBooking.date, recurringExisting.endTime);
            if (newStartDateTime < existingEnd && newEndDateTime > existingStart) return existingBooking;
          }
        }
      }
    } else { // newBooking.type === 'recurring'
      const recurringNewBooking = newBooking as RecurringBooking;
      const newBookingDayNum = DAYS_OF_WEEK_ENGLISH_MAP[recurringNewBooking.dayOfWeek];

      if (existingBooking.type === 'single') {
        // Recurring vs Single
        const singleExisting = existingBooking as SingleBooking;
        const singleExistingDateObj = parseISO(singleExisting.date);
        if (getDay(singleExistingDateObj) === newBookingDayNum) {
           const recurringNewStartDate = parseISO(recurringNewBooking.startDate);
           const recurringNewEndDate = recurringNewBooking.endDate ? parseISO(recurringNewBooking.endDate) : null;
           if(isWithinInterval(singleExistingDateObj, { start: recurringNewStartDate, end: recurringNewEndDate || addDays(recurringNewStartDate, 365*5) })) {
            const existingStart = combineDateAndTime(singleExisting.date, singleExisting.startTime);
            const existingEnd = combineDateAndTime(singleExisting.date, singleExisting.endTime);
            const newBookingTimeOnExistingDateStart = combineDateAndTime(singleExisting.date, recurringNewBooking.startTime);
            const newBookingTimeOnExistingDateEnd = combineDateAndTime(singleExisting.date, recurringNewBooking.endTime);
            if (newBookingTimeOnExistingDateStart < existingEnd && newBookingTimeOnExistingDateEnd > existingStart) return existingBooking;
           }
        }
      } else {
        // Recurring vs Recurring
        const recurringExisting = existingBooking as RecurringBooking;
        if (recurringNewBooking.dayOfWeek === recurringExisting.dayOfWeek) {
          const newInstanceStart = combineDateAndTime(formatDate(new Date()), recurringNewBooking.startTime); // Use arbitrary date for time comparison
          const newInstanceEnd = combineDateAndTime(formatDate(new Date()), recurringNewBooking.endTime);
          const existingInstanceStart = combineDateAndTime(formatDate(new Date()), recurringExisting.startTime);
          const existingInstanceEnd = combineDateAndTime(formatDate(new Date()), recurringExisting.endTime);

          if (newInstanceStart < existingInstanceEnd && newInstanceEnd > existingInstanceStart) { // Times overlap
            // Check if date ranges overlap
            const newRangeStart = parseISO(recurringNewBooking.startDate);
            const newRangeEnd = recurringNewBooking.endDate ? parseISO(recurringNewBooking.endDate) : null;
            const existingRangeStart = parseISO(recurringExisting.startDate);
            const existingRangeEnd = recurringExisting.endDate ? parseISO(recurringExisting.endDate) : null;

            const newEndComparable = newRangeEnd || addDays(newRangeStart, 365*5); // 5 years for 'Indefinido'
            const existingEndComparable = existingRangeEnd || addDays(existingRangeStart, 365*5);

            if (newRangeStart < existingEndComparable && newEndComparable > existingRangeStart) return existingBooking;
          }
        }
      }
    }
  }
  return null; // No conflict
};


export async function addBookingAction(
  formData: Omit<Booking, 'id' | 'startDate' | 'endDate'> & { date?: string, dayOfWeek?: DayOfWeek, duration?: DurationOption }
): Promise<{ success: boolean; message?: string; booking?: Booking }> {
  
  const newBookingBase = {
    id: String(nextId++),
    className: formData.className,
    teacher: formData.teacher,
    createdBy: formData.createdBy,
    startTime: formData.startTime,
    endTime: formData.endTime,
    color: formData.color,
  };

  let finalNewBooking: Booking;

  if (formData.type === 'single') {
    if (!formData.date) return { success: false, message: 'Date is required for single booking.' };
    finalNewBooking = {
      ...newBookingBase,
      type: 'single',
      date: formData.date,
    } as SingleBooking;
  } else { // recurring
    if (!formData.dayOfWeek || !formData.duration) return { success: false, message: 'Day of week and duration are required for recurring booking.' };
    const sDate = new Date();
    const eDate = calculateEndDate(sDate, formData.duration);
    finalNewBooking = {
      ...newBookingBase,
      type: 'recurring',
      dayOfWeek: formData.dayOfWeek,
      startDate: formatDate(sDate),
      endDate: eDate ? formatDate(eDate) : null,
      duration: formData.duration,
    } as RecurringBooking;
  }
  
  const conflict = checkConflict(finalNewBooking);
  if (conflict) {
    return { success: false, message: `Conflict detected with class: "${conflict.className}" by ${conflict.teacher} on ${conflict.type === 'single' ? conflict.date : conflict.dayOfWeek} at ${conflict.startTime}-${conflict.endTime}.` };
  }

  bookings.push(finalNewBooking);
  revalidatePath('/'); // Revalidate the page to show new booking
  return { success: true, booking: finalNewBooking };
}

export async function getBookingsForWeek(weekStartDate: Date, weekEndDate: Date): Promise<Booking[]> {
  const weekStartStr = formatDate(weekStartDate);
  const weekEndStr = formatDate(weekEndDate);

  return bookings.filter(booking => {
    if (booking.type === 'single') {
      return booking.date >= weekStartStr && booking.date <= weekEndStr;
    } else { // recurring
      const bookingDayNum = DAYS_OF_WEEK_ENGLISH_MAP[booking.dayOfWeek];
      const bookingStartDateObj = parseISO(booking.startDate);
      const bookingEndDateObj = booking.endDate ? parseISO(booking.endDate) : null;

      // Check if any day in the week matches the recurring day and is within the booking's date range
      for (let i = 0; i < 7; i++) {
        const dayInWeek = addDays(weekStartDate, i);
        if (getDay(dayInWeek) === bookingDayNum) {
          const dayIsAfterOrOnStartDate = dayInWeek >= bookingStartDateObj || isEqual(dayInWeek, bookingStartDateObj);
          const dayIsBeforeOrOnEndDate = !bookingEndDateObj || dayInWeek <= bookingEndDateObj || isEqual(dayInWeek, bookingEndDateObj);
          if (dayIsAfterOrOnStartDate && dayIsBeforeOrOnEndDate) {
            return true; // This recurring booking happens at least once in the visible week
          }
        }
      }
      return false;
    }
  });
}


export async function getMonthlyRecurringBookings(currentDate: Date): Promise<RecurringBooking[]> {
  const monthStart = parseISO(formatDate(currentDate).substring(0, 8) + '01');
  const monthEnd = parseISO(formatDate(calculateEndDate(monthStart, '1 Mes') || new Date()));
  
  return bookings.filter(b => {
    if (b.type === 'recurring') {
      const bookingStartDate = parseISO(b.startDate);
      const bookingEndDate = b.endDate ? parseISO(b.endDate) : null;
      
      // Check if booking's active range overlaps with the current month
      const bookingEndComparable = bookingEndDate || addDays(bookingStartDate, 365*5); // Consider Indefinido active for a long time

      if (bookingStartDate < monthEnd && bookingEndComparable > monthStart) {
        return true;
      }
    }
    return false;
  }) as RecurringBooking[];
}

export async function deleteBookingAction(id: string): Promise<{ success: boolean }> {
  bookings = bookings.filter(b => b.id !== id);
  revalidatePath('/');
  return { success: true };
}
