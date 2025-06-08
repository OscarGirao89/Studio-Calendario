
'use client'; // Top-level page needs to be client for state management hooks

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { MonthlySummary } from '@/components/summary/MonthlySummary';
import { BookingModal } from '@/components/booking/BookingModal';
import type { Teacher } from '@/lib/types';
import { TEACHERS } from '@/lib/constants'; // To get a default teacher

export default function FusionSchedulePage() {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(TEACHERS[0]);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [bookingsLastUpdatedAt, setBookingsLastUpdatedAt] = useState<number>(Date.now());


  const handleTeacherChange = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    if (debugMode) console.log(`Current teacher changed to: ${teacher}`);
  };

  const handleDebugModeChange = (enabled: boolean) => {
    setDebugMode(enabled);
    if (enabled) console.log('Debug mode ENABLED');
    else console.log('Debug mode DISABLED');
  };

  const handleNewBooking = () => {
    setIsModalOpen(true);
  };
  
  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // When modal closes, typically after a booking, refresh bookings
      setBookingsLastUpdatedAt(Date.now());
    }
  };

  const refreshBookings = () => {
    setBookingsLastUpdatedAt(Date.now());
  }


  useEffect(() => {
    // This effect could be used to listen to real-time updates if using Firebase
    if (debugMode) console.log('Page loaded or key state changed.');
  }, [currentTeacher, debugMode]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentTeacher={currentTeacher}
        onTeacherChange={handleTeacherChange}
        debugMode={debugMode}
        onDebugModeChange={handleDebugModeChange}
        onNewBooking={handleNewBooking}
      />
      <main className="flex-grow">
        <WeeklyCalendar 
          initialDate={currentCalendarDate} 
          debugMode={debugMode}
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
          currentTeacher={currentTeacher}
          onBookingUpdated={refreshBookings}
        />
        <MonthlySummary 
          currentDate={currentCalendarDate} 
          debugMode={debugMode} 
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
        />
      </main>
      <BookingModal
        isOpen={isModalOpen}
        onOpenChange={handleModalOpenChange}
        currentTeacher={currentTeacher}
        debugMode={debugMode}
      />
    </div>
  );
}
