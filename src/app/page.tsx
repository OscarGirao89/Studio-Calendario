
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { MonthlySummary } from '@/components/summary/MonthlySummary';
import { BookingModal } from '@/components/booking/BookingModal';
import type { Teacher, Booking } from '@/lib/types';

export default function FusionSchedulePage() {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [bookingsLastUpdatedAt, setBookingsLastUpdatedAt] = useState<number>(Date.now());
  const router = useRouter();

  useEffect(() => {
    const userIdentifier = localStorage.getItem('loggedInUser');
    if (!userIdentifier) {
      router.push('/login');
    } else if (userIdentifier === 'GuestUser') {
      setIsGuest(true);
      setCurrentTeacher(null);
    } else {
      setIsGuest(false);
      setCurrentTeacher(userIdentifier as Teacher);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setCurrentTeacher(null);
    setIsGuest(false);
    router.push('/login');
  };

  const handleNewBooking = () => {
    if (isGuest || !currentTeacher) return; 
    setEditingBooking(null); 
    setIsBookingModalOpen(true);
  };

  const handleEditBookingRequested = (booking: Booking) => {
    if (isGuest || !currentTeacher) return; 
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

  // Render a loading state while checking auth and redirecting, or if guest/user state is not yet determined
  if (!isGuest && !currentTeacher && typeof window !== 'undefined' && !localStorage.getItem('loggedInUser')) {
     // This condition helps avoid flashing the loading screen if already determined to be guest or a teacher
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
        isGuest={isGuest}
        onLogout={handleLogout}
        onNewBooking={handleNewBooking}
      />
      <main className="flex-grow">
        <WeeklyCalendar 
          initialDate={currentCalendarDate} 
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
          currentTeacher={currentTeacher} // Will be null for guests
          onBookingUpdated={refreshBookings}
          onEditBookingRequested={handleEditBookingRequested}
          isGuestView={isGuest}
        />
        <MonthlySummary 
          currentDate={currentCalendarDate} 
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
        />
      </main>
      {isBookingModalOpen && currentTeacher && !isGuest && ( 
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
