
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookingForm } from './BookingForm';
import type { Teacher, Booking } from '@/lib/types';

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentTeacher: Teacher;
  debugMode: boolean;
  bookingToEdit?: Booking | null;
}

export function BookingModal({ 
  isOpen, 
  onOpenChange, 
  currentTeacher, 
  debugMode, 
  bookingToEdit 
}: BookingModalProps) {
  
  const handleFormSubmit = () => {
    onOpenChange(false); // Close modal on successful submission
  };

  const modalTitle = bookingToEdit ? "Editar Reserva" : "Nueva Reserva";
  const modalDescription = bookingToEdit 
    ? "Modifica los detalles de la reserva existente."
    : "Completa los detalles para crear una nueva reserva de sala.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{modalTitle}</DialogTitle>
          <DialogDescription>
            {modalDescription}
          </DialogDescription>
        </DialogHeader>
        <BookingForm 
          currentTeacher={currentTeacher} 
          debugMode={debugMode}
          onFormSubmit={handleFormSubmit}
          bookingToEdit={bookingToEdit}
        />
      </DialogContent>
    </Dialog>
  );
}

