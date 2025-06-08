
'use client';

import React, { useState, useEffect } from 'react';
import type { RecurringBooking } from '@/lib/types';
import { getMonthlyRecurringBookings } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks } from 'lucide-react';
import { getMonthName } from '@/lib/date-utils';

interface MonthlySummaryProps {
  currentDate: Date;
  bookingsLastUpdatedAt: number; // Timestamp to trigger re-fetch
}

export function MonthlySummary({ currentDate, bookingsLastUpdatedAt }: MonthlySummaryProps) {
  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const bookings = await getMonthlyRecurringBookings(currentDate);
        setRecurringBookings(bookings);
      } catch (error) {
        console.error('Error fetching monthly summary:', error);
        // TODO: Add user-facing error handling
      }
      setIsLoading(false);
    };
    fetchSummary();
  }, [currentDate, bookingsLastUpdatedAt]);

  return (
    <div className="p-4 md:p-6 mt-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-headline flex items-center">
            <ListChecks className="mr-3 h-6 w-6 text-primary" />
            Horario de Clases Fijas del Mes
          </CardTitle>
          <CardDescription>Resumen de clases recurrentes activas para {getMonthName(currentDate)}.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 border border-border rounded-md">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : recurringBookings.length === 0 ? (
            <p className="text-muted-foreground">No hay clases fijas programadas para este mes.</p>
          ) : (
            <ul className="space-y-3">
              {recurringBookings.map((booking) => (
                <li key={booking.id} className="p-3 border border-border rounded-md bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors">
                  <h4 className="font-semibold text-primary">{booking.className}</h4>
                  <p className="text-sm">Profesor: {booking.teacher}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.dayOfWeek}, {booking.startTime} - {booking.endTime}
                  </p>
                   <p className="text-xs text-muted-foreground/70">
                    Activa desde: {booking.startDate} {booking.endDate ? `hasta: ${booking.endDate}` : '(Indefinido)'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
