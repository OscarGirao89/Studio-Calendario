'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getWeekDateRange, getDaysInWeek, navigateWeek, formatDayMonth, formatDate, parseTimeString, combineDateAndTime } from '@/lib/date-utils';
import { TIME_SLOTS, DAYS_OF_WEEK } from '@/lib/constants';
import type { Booking, SingleBooking, RecurringBooking } from '@/lib/types';
import { EventCard } from './EventCard';
import { getBookingsForWeek } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { parseISO, getDay, isEqual, isWithinInterval, addDays, differenceInMinutes, getHours, getMinutes } from 'date-fns';
import { DAYS_OF_WEEK_ENGLISH_MAP } from '@/lib/constants';


interface WeeklyCalendarProps {
  initialDate?: Date;
  debugMode: boolean;
  bookingsLastUpdatedAt: number; // Timestamp to trigger re-fetch
}

export function WeeklyCalendar({ initialDate = new Date(), debugMode, bookingsLastUpdatedAt }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const daysInCurrentWeek = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      if (debugMode) console.log(`Fetching bookings for week starting: ${formatDate(daysInCurrentWeek[0])}`);
      try {
        const bookings = await getBookingsForWeek(daysInCurrentWeek[0], daysInCurrentWeek[6]);
        setWeekBookings(bookings);
        if (debugMode) console.log('Bookings fetched:', bookings);
      } catch (error) {
        if (debugMode) console.error('Error fetching bookings:', error);
        // TODO: Add user-facing error handling, e.g., toast
      }
      setIsLoading(false);
    };
    fetchBookings();
  }, [currentDate, debugMode, bookingsLastUpdatedAt, daysInCurrentWeek]);


  const handleNavigation = (direction: 'next' | 'prev' | 'today') => {
    setCurrentDate(navigateWeek(currentDate, direction));
  };

  const getEventPositionAndSpan = (booking: Booking, day: Date) => {
    const dayDateStr = formatDate(day);
    const startTime = parseTimeString(booking.startTime);
    const endTime = parseTimeString(booking.endTime);

    const startHour = getHours(startTime);
    const startMinute = getMinutes(startTime);
    const endHour = getHours(endTime);
    const endMinute = getMinutes(endTime);
    
    // Calculate row start: (hour - 8am_offset) * 2_slots_per_hour + (minute / 30_min_slot) + 1_for_grid_row_index
    const rowStart = (startHour - 8) * 2 + (startMinute === 30 ? 1 : 0) + 1;
    const rowEnd = (endHour - 8) * 2 + (endMinute === 30 ? 1 : 0) + 1;
    
    const durationInSlots = rowEnd - rowStart;

    return {
      gridRowStart: rowStart,
      gridRowEnd: rowStart + durationInSlots,
    };
  };
  
  const isEventOnDay = (booking: Booking, day: Date): boolean => {
    const dayStr = formatDate(day);
    if (booking.type === 'single') {
      return booking.date === dayStr;
    }
    // Recurring booking
    const recurringBooking = booking as RecurringBooking;
    const dayOfWeekNumeric = DAYS_OF_WEEK_ENGLISH_MAP[recurringBooking.dayOfWeek];
    if (getDay(day) !== dayOfWeekNumeric) return false;

    const bookingStartDate = parseISO(recurringBooking.startDate);
    const bookingEndDate = recurringBooking.endDate ? parseISO(recurringBooking.endDate) : null;
    
    return isWithinInterval(day, { start: bookingStartDate, end: bookingEndDate || addDays(bookingStartDate, 365*5) });
  };


  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-headline font-bold text-primary mb-2 sm:mb-0">
          {getWeekDateRange(currentDate)}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleNavigation('prev')} size="icon">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Semana Anterior</span>
          </Button>
          <Button variant="outline" onClick={() => handleNavigation('today')} className="px-3 h-10">
            <Calendar className="mr-2 h-4 w-4" /> Hoy
          </Button>
          <Button variant="outline" onClick={() => handleNavigation('next')} size="icon">
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Semana Siguiente</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-px bg-border border border-border rounded-lg shadow-md overflow-hidden">
        {/* Header Row: Time Slot Column + Day Names */}
        <div className="p-2 bg-card text-card-foreground font-semibold text-sm sticky left-0 z-10">Hora</div>
        {DAYS_OF_WEEK.map((dayName, index) => (
          <div key={dayName} className="p-2 bg-card text-card-foreground text-center font-semibold text-sm">
            <span className="hidden sm:inline">{dayName}</span>
            <span className="sm:hidden">{dayName.substring(0,1)}</span>
            <div className="text-xs text-muted-foreground">{formatDayMonth(daysInCurrentWeek[index])}</div>
          </div>
        ))}

        {/* Calendar Grid Content */}
        {TIME_SLOTS.map((slot, slotIndex) => (
          <React.Fragment key={slot.time}>
            {/* Time Slot Label */}
            <div className={cn(
              "p-2 text-xs text-muted-foreground text-right sticky left-0 bg-card z-10",
              slot.isHour ? "h-16 border-t border-border" : "h-16",
              slotIndex === 0 && "border-t-0"
            )}>
              {slot.isHour ? slot.time : ''}
            </div>

            {/* Cells for each day in this time slot */}
            {daysInCurrentWeek.map((day, dayIndex) => (
              <div
                key={`${formatDate(day)}-${slot.time}`}
                className={cn(
                  "relative bg-background/50 min-h-[4rem]", // min-h-16 equivalent for h-16 slots
                   slot.isHour && "border-t border-border/70",
                   slotIndex === 0 && "border-t-0"
                )}
              >
                {/* Render bookings that start in this cell's day and timeslot */}
                {isLoading ? (
                   slotIndex % 4 === 0 && dayIndex % 2 === 0 && <Skeleton className="absolute inset-1 rounded"/>
                ) : (
                  weekBookings
                    .filter(b => isEventOnDay(b, day) && b.startTime === slot.time)
                    .map(booking => {
                      const { gridRowStart, gridRowEnd } = getEventPositionAndSpan(booking, day);
                       // This style is to make the event span correctly based on its duration
                       // It's applied here because the div is relative to the cell it starts in
                      const eventStyle = {
                        gridRowStart: 1, // Event starts at the top of its cell
                        gridRowEnd: (gridRowEnd - gridRowStart) + 1, // Span relative to its own cell height
                        zIndex: 10 + gridRowStart // Simple z-indexing
                      };
                      return (
                        <div key={booking.id}
                             className="absolute inset-x-0 top-0" // Takes full width of cell, starts at top
                             style={{
                               height: `calc(${(gridRowEnd - gridRowStart)} * 4rem + ${(gridRowEnd - gridRowStart -1)} * 1px)`, // 4rem per slot + 1px per border
                               zIndex: 10 + gridRowStart,
                             }}
                        >
                          <EventCard booking={booking} />
                        </div>
                      );
                    })
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
