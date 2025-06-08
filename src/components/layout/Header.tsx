
'use client';

import type { ChangeEvent } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { TEACHERS } from '@/lib/constants';
import type { Teacher } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentTeacher: Teacher;
  onTeacherChange: (teacher: Teacher) => void;
  onNewBooking: () => void;
}

export function Header({
  currentTeacher,
  onTeacherChange,
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
          <Label htmlFor="teacher-select" className="text-sm">Usuario:</Label>
          <Select value={currentTeacher} onValueChange={onTeacherChange}>
            <SelectTrigger id="teacher-select" className="w-[120px] h-9">
              <SelectValue placeholder="Profesor" />
            </SelectTrigger>
            <SelectContent>
              {TEACHERS.map((teacher) => (
                <SelectItem key={teacher} value={teacher}>
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onNewBooking} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>
    </header>
  );
}
