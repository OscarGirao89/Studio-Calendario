
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { MonthlySummary } from '@/components/summary/MonthlySummary';
import { BookingModal } from '@/components/booking/BookingModal';
import type { Teacher, Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const USER_CREDENTIALS_KEY = 'userAppCredentials';

export default function FusionSchedulePage() {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [bookingsLastUpdatedAt, setBookingsLastUpdatedAt] = useState<number>(Date.now());
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher || isGuest) return;
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 3) { // Simple validation
      toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 3 caracteres.' });
      return;
    }

    setIsPasswordSaving(true);
    try {
      const storedCredentials = localStorage.getItem(USER_CREDENTIALS_KEY);
      let credentials = storedCredentials ? JSON.parse(storedCredentials) : {};
      credentials[currentTeacher.toLowerCase()] = newPassword;
      localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(credentials));
      toast({ title: 'Contraseña Actualizada', description: 'Tu contraseña ha sido cambiada exitosamente.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la contraseña.' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (typeof window !== 'undefined' && !localStorage.getItem('loggedInUser')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-foreground">Redirigiendo al login...</p>
      </div>
    );
  }
  
  if (!isGuest && !currentTeacher && typeof window !== 'undefined' && localStorage.getItem('loggedInUser') !== 'GuestUser' && localStorage.getItem('loggedInUser') !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-foreground">Cargando datos de usuario...</p>
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
          currentTeacher={currentTeacher} 
          onBookingUpdated={refreshBookings}
          onEditBookingRequested={handleEditBookingRequested}
          isGuestView={isGuest}
        />
        <MonthlySummary 
          currentDate={currentCalendarDate} 
          bookingsLastUpdatedAt={bookingsLastUpdatedAt}
        />

        {!isGuest && currentTeacher && (
          <div className="p-4 md:p-6 mt-8">
            <Card className="shadow-lg max-w-md mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="p-6">
                    <div className="flex items-center">
                      <KeyRound className="mr-3 h-6 w-6 text-primary" />
                      <CardTitle className="text-xl md:text-2xl font-headline">
                        Cambiar Contraseña
                      </CardTitle>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardDescription className="px-6 pb-4 -mt-3">
                      Actualiza tu contraseña de acceso al sistema.
                    </CardDescription>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <Label htmlFor="newPassword">Nueva Contraseña</Label>
                          <Input 
                            id="newPassword" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPasswordSaving}>
                          {isPasswordSaving ? 'Guardando...' : 'Guardar Contraseña'}
                        </Button>
                      </form>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
        )}

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
