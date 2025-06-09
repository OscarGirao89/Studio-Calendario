
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { MonthlySummary } from '@/components/summary/MonthlySummary';
import { BookingModal } from '@/components/booking/BookingModal';
import type { Teacher, Booking } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

const USER_CREDENTIALS_KEY = 'userAppCredentials';

export default function FusionSchedulePage() {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [bookingsLastUpdatedAt, setBookingsLastUpdatedAt] = useState<number>(Date.now());
  
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
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
  
  const handleBookingModalOpenChange = (open: boolean) => {
    setIsBookingModalOpen(open);
    if (!open) {
      setEditingBooking(null); 
      setBookingsLastUpdatedAt(Date.now());
    }
  };

  const handleChangePasswordModalOpenChange = (open: boolean) => {
    setIsChangePasswordModalOpen(open);
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const refreshBookings = () => {
    setBookingsLastUpdatedAt(Date.now());
  }

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher || isGuest) return;
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 3) { 
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
      setIsChangePasswordModalOpen(false);
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
        onChangePassword={() => setIsChangePasswordModalOpen(true)}
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
      </main>

      {isBookingModalOpen && currentTeacher && !isGuest && ( 
        <BookingModal
          isOpen={isBookingModalOpen}
          onOpenChange={handleBookingModalOpenChange}
          currentTeacher={currentTeacher} 
          bookingToEdit={editingBooking}
        />
      )}

      {isChangePasswordModalOpen && currentTeacher && !isGuest && (
        <Dialog open={isChangePasswordModalOpen} onOpenChange={handleChangePasswordModalOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl flex items-center">
                <KeyRound className="mr-3 h-6 w-6 text-primary" />
                Cambiar Contraseña
              </DialogTitle>
              <DialogDescription>
                Actualiza tu contraseña de acceso al sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="newPasswordModal">Nueva Contraseña</Label>
                <Input 
                  id="newPasswordModal" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  placeholder="Mínimo 3 caracteres"
                />
              </div>
              <div>
                <Label htmlFor="confirmPasswordModal">Confirmar Nueva Contraseña</Label>
                <Input 
                  id="confirmPasswordModal" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  placeholder="Repite la contraseña"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full sm:w-auto" disabled={isPasswordSaving}>
                  {isPasswordSaving ? 'Guardando...' : 'Guardar Contraseña'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
