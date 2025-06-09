
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { MonthlySummary } from '@/components/summary/MonthlySummary';
import { BookingModal } from '@/components/booking/BookingModal';
import type { Teacher, Booking } from '@/lib/types';
// TEACHERS constant is not directly used here anymore for selection, but BookingForm might still use it if needed
// import { TEACHERS } from '@/lib/constants'; 

export default function FusionSchedulePage() {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [bookingsLastUpdatedAt, setBookingsLastUpdatedAt] = useState<number>(Date.now());
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser') as Teacher | null;
    if (!loggedInUser) {
      router.push('/login');
    } else {
      setCurrentTeacher(loggedInUser);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setCurrentTeacher(null);
    router.push('/login');
  };

  const handleNewBooking = () => {
    if (!currentTeacher) return; // Should not happen if logged in
    setEditingBooking(null); 
    setIsBookingModalOpen(true);
  };

  const handleEditBookingRequested = (booking: Booking) => {
    if (!currentTeacher) return; // Should not happen
    setEditingBooking(booking);
    setIsBookingModalOpen(true);
  };
  
  const handleModalOpenChange = (open: boolean) => {
    setIsBookingModalOpen(open);
    if (!open) {
      setEditingBooking(null); 
      setBookingsLastUpdatedAt(Date.now());
    }
  };

  const refreshBookings = () => {
    setBookingsLastUpdatedAt(Date.now());
  }

  if (!currentTeacher) {
    // Render a loading state or null while checking auth and redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        loggedInUser={currentTeacher}
        onLogout={handleLogout}
        onNewBooking={handleNewBooking}
      />
      <main className="flex-grow">
        <WeeklyCalendar 
          initialDate={currentCalendarDate} 
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
          currentTeacher={currentTeacher}
          onBookingUpdated={refreshBookings}
          onEditBookingRequested={handleEditBookingRequested}
        />
        <MonthlySummary 
          currentDate={currentCalendarDate} 
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
        />
      </main>
      {isBookingModalOpen && ( // Conditionally render modal to ensure currentTeacher is available
        <BookingModal
          isOpen={isBookingModalOpen}
          onOpenChange={handleModalOpenChange}
          currentTeacher={currentTeacher}
          bookingToEdit={editingBooking}
        />
      )}
    </div>
  );
}
