
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from 'lucide-react';
import { getWeekDateRange, getDaysInWeek, navigateWeek, formatDayMonth, formatDate, parseTimeString } from '@/lib/date-utils';
import { TIME_SLOTS, DAYS_OF_WEEK } from '@/lib/constants';
import type { Booking, Teacher, SingleBooking, RecurringBooking } from '@/lib/types';
import { EventCard } from './EventCard';
import { getBookingsForWeek, deleteBookingAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { parseISO, getDay, isWithinInterval, addDays, differenceInMinutes, getHours, getMinutes } from 'date-fns';
import { DAYS_OF_WEEK_ENGLISH_MAP } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface WeeklyCalendarProps {
  initialDate?: Date;
  bookingsLastUpdatedAt: number;
  currentTeacher: Teacher;
  onBookingUpdated: () => void;
  onEditBookingRequested: (booking: Booking) => void;
}

export function WeeklyCalendar({ 
  initialDate = new Date(), 
  bookingsLastUpdatedAt, 
  currentTeacher, 
  onBookingUpdated,
  onEditBookingRequested 
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const { toast } = useToast();

  const daysInCurrentWeek = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const bookings = await getBookingsForWeek(daysInCurrentWeek[0], daysInCurrentWeek[6]);
        setWeekBookings(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las reservas." });
      }
      setIsLoading(false);
    };
    fetchBookings();
  }, [currentDate, bookingsLastUpdatedAt, daysInCurrentWeek, toast]);


  const handleNavigation = (direction: 'next' | 'prev' | 'today') => {
    setCurrentDate(navigateWeek(currentDate, direction));
  };

  const getEventPositionAndSpan = (booking: Booking, day: Date) => {
    const startTime = parseTimeString(booking.startTime);
    const endTime = parseTimeString(booking.endTime);

    const startHour = getHours(startTime);
    const startMinute = getMinutes(startTime);
    const endHour = getHours(endTime);
    const endMinute = getMinutes(endTime);
    
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
    const recurringBooking = booking as RecurringBooking;
    const dayOfWeekNumeric = DAYS_OF_WEEK_ENGLISH_MAP[recurringBooking.dayOfWeek];
    if (getDay(day) !== dayOfWeekNumeric) return false;

    const bookingStartDate = parseISO(recurringBooking.startDate);
    const bookingEndDate = recurringBooking.endDate ? parseISO(recurringBooking.endDate) : null;
    
    return isWithinInterval(day, { start: bookingStartDate, end: bookingEndDate || addDays(bookingStartDate, 365*5) });
  };

  const handleRequestDelete = (booking: Booking) => {
    setBookingToDelete(booking);
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    const result = await deleteBookingAction(bookingToDelete.id);
    if (result.success) {
      toast({ title: "Reserva Eliminada", description: `La clase "${bookingToDelete.className}" ha sido eliminada.` });
      onBookingUpdated(); 
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "No se pudo eliminar la reserva." });
    }
    setBookingToDelete(null);
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
            <CalendarIconLucide className="mr-2 h-4 w-4" /> Hoy
          </Button>
          <Button variant="outline" onClick={() => handleNavigation('next')} size="icon">
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Semana Siguiente</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-px bg-border border border-border rounded-lg shadow-md overflow-hidden">
        <div className="p-2 bg-card text-card-foreground font-semibold text-sm sticky left-0 z-10">Hora</div>
        {DAYS_OF_WEEK.map((dayName, index) => (
          <div key={dayName} className="p-2 bg-card text-card-foreground text-center font-semibold text-sm">
            <span className="hidden sm:inline">{dayName}</span>
            <span className="sm:hidden">{dayName.substring(0,1)}</span>
            <div className="text-xs text-muted-foreground">{formatDayMonth(daysInCurrentWeek[index])}</div>
          </div>
        ))}

        {TIME_SLOTS.map((slot, slotIndex) => (
          <React.Fragment key={slot.time}>
            <div className={cn(
              "p-2 text-xs text-muted-foreground text-right sticky left-0 bg-card z-10",
              slot.isHour ? "h-16 border-t border-border" : "h-16",
              slotIndex === 0 && "border-t-0"
            )}>
              {slot.isHour ? slot.time : ''}
            </div>

            {daysInCurrentWeek.map((day, dayIndex) => (
              <div
                key={`${formatDate(day)}-${slot.time}`}
                className={cn(
                  "relative bg-background/50 min-h-[4rem]", 
                   slot.isHour && "border-t border-border/70",
                   slotIndex === 0 && "border-t-0"
                )}
              >
                {isLoading ? (
                   slotIndex % 4 === 0 && dayIndex % 2 === 0 && <Skeleton className="absolute inset-1 rounded"/>
                ) : (
                  weekBookings
                    .filter(b => isEventOnDay(b, day) && b.startTime === slot.time)
                    .map(booking => {
                      const { gridRowStart, gridRowEnd } = getEventPositionAndSpan(booking, day);
                      const eventStyle = {
                        height: `calc(${(gridRowEnd - gridRowStart)} * 4rem + ${(gridRowEnd - gridRowStart -1)} * 1px)`, 
                        zIndex: 10 + gridRowStart,
                      };
                      return (
                        <div key={booking.id}
                             className="absolute inset-x-0 top-0"
                             style={eventStyle}
                        >
                          <EventCard 
                            booking={booking} 
                            currentTeacher={currentTeacher}
                            onRequestDelete={handleRequestDelete}
                            onRequestEdit={onEditBookingRequested}
                          />
                        </div>
                      );
                    })
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      {bookingToDelete && (
        <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar la clase "{bookingToDelete.className}" impartida por {bookingToDelete.teacher} (creada por {bookingToDelete.createdBy})? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBookingToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
