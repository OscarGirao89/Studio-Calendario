
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/LogoIcon';
import type { Teacher } from '@/lib/types';
import { PlusCircle, LogOut } from 'lucide-react';

interface HeaderProps {
  loggedInUser: Teacher; // Changed from currentTeacher
  onLogout: () => void;   // Added for logout
  onNewBooking: () => void;
}

export function Header({
  loggedInUser,
  onLogout,
  onNewBooking,
}: HeaderProps) {
  return (
    <header className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sticky top-0 bg-background/95 backdrop-blur z-40">
      <div className="flex items-center space-x-3">
        <LogoIcon className="h-8 w-auto" />
        <h1 className="text-2xl font-headline font-bold text-primary">SucioStudio</h1>
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-foreground">Usuario:</span>
          <span className="text-sm font-semibold text-accent">{loggedInUser}</span>
        </div>
        <Button onClick={onNewBooking} size="sm" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
        <Button onClick={onLogout} size="sm" variant="ghost">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
