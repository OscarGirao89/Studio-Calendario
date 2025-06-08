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
import type { Teacher } from '@/lib/types';

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentTeacher: Teacher;
  debugMode: boolean;
}

export function BookingModal({ isOpen, onOpenChange, currentTeacher, debugMode }: BookingModalProps) {
  
  const handleFormSubmit = () => {
    onOpenChange(false); // Close modal on successful submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Nueva Reserva</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear una nueva reserva de sala.
          </DialogDescription>
        </DialogHeader>
        <BookingForm 
          currentTeacher={currentTeacher} 
          debugMode={debugMode}
          onFormSubmit={handleFormSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
