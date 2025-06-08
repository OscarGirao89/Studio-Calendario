
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TEACHERS, BOOKING_COLORS, DURATION_OPTIONS, DAYS_OF_WEEK, TIME_SLOTS } from '@/lib/constants';
import type { Teacher, BookingType, BookingColor, DayOfWeek, DurationOption, Booking, SingleBooking, RecurringBooking } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addBookingAction, updateBookingAction } from '@/lib/actions';

const bookingFormSchema = z.object({
  id: z.string().optional(), // For identifying booking to update
  type: z.enum(['single', 'recurring'] as [BookingType, ...BookingType[]]),
  teacher: z.enum(TEACHERS as [Teacher, ...Teacher[]]),
  className: z.string().min(1, 'Nombre de la clase es requerido'),
  color: z.enum(BOOKING_COLORS as [BookingColor, ...BookingColor[]]),
  startTime: z.string().min(1, "Hora de inicio es requerida"),
  endTime: z.string().min(1, "Hora de fin es requerida"),
  date: z.date().optional(), 
  dayOfWeek: z.enum(DAYS_OF_WEEK as [DayOfWeek, ...DayOfWeek[]]).optional(), 
  duration: z.enum(DURATION_OPTIONS as [DurationOption, ...DurationOption[]]).optional(), 
}).refine(data => {
  if (data.type === 'single' && !data.date) {
    return false;
  }
  return true;
}, { message: 'Fecha es requerida para reserva única', path: ['date'] })
.refine(data => {
  if (data.type === 'recurring' && (!data.dayOfWeek || !data.duration)) {
    return false;
  }
  return true;
}, { message: 'Día y duración son requeridos para clase fija', path: ['dayOfWeek'] })
.refine(data => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, { message: 'Hora de inicio debe ser anterior a la hora de fin', path: ['endTime'] });


type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  currentTeacher: Teacher;
  onFormSubmit: () => void; 
  bookingToEdit?: Booking | null;
}

export function BookingForm({ currentTeacher, onFormSubmit, bookingToEdit }: BookingFormProps) {
  const { toast } = useToast();
  
  const defaultValues: Partial<BookingFormValues> = {
    type: 'single',
    teacher: currentTeacher,
    className: '',
    color: BOOKING_COLORS[0],
    startTime: '09:00',
    endTime: '10:00',
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (bookingToEdit) {
      const valuesToSet: Partial<BookingFormValues> = {
        id: bookingToEdit.id,
        type: bookingToEdit.type,
        teacher: bookingToEdit.teacher,
        className: bookingToEdit.className,
        color: bookingToEdit.color,
        startTime: bookingToEdit.startTime,
        endTime: bookingToEdit.endTime,
      };
      if (bookingToEdit.type === 'single') {
        valuesToSet.date = bookingToEdit.date ? parseISO((bookingToEdit as SingleBooking).date) : undefined;
      } else {
        const recurring = bookingToEdit as RecurringBooking;
        valuesToSet.dayOfWeek = recurring.dayOfWeek;
        valuesToSet.duration = recurring.duration;
      }
      form.reset(valuesToSet);
    } else {
      form.reset({...defaultValues, teacher: currentTeacher });
    }
  }, [bookingToEdit, form, currentTeacher]);


  const bookingType = form.watch('type');
  const isEditing = !!bookingToEdit;

  async function onSubmit(values: BookingFormValues) {
    const submissionData = {
      type: values.type,
      className: values.className,
      teacher: values.teacher,
      startTime: values.startTime,
      endTime: values.endTime,
      color: values.color,
      ...(values.type === 'single' && values.date && { date: format(values.date, 'yyyy-MM-dd') }),
      ...(values.type === 'recurring' && { dayOfWeek: values.dayOfWeek, duration: values.duration }),
    };

    if (isEditing && bookingToEdit && values.id) {
      // @ts-ignore 
      const result = await updateBookingAction(values.id, submissionData);
      if (result.success) {
        toast({ title: 'Reserva Actualizada', description: `Clase "${result.booking?.className}" actualizada.` });
        onFormSubmit();
        form.reset({...defaultValues, teacher: currentTeacher });
      } else {
        toast({ variant: 'destructive', title: 'Error al Actualizar Reserva', description: result.message });
      }

    } else {
      const bookingDataForAdd = {
        ...submissionData,
        createdBy: currentTeacher, 
      };
      
      // @ts-ignore 
      const result = await addBookingAction(bookingDataForAdd);

      if (result.success) {
        toast({ title: 'Reserva Creada', description: `Clase "${result.booking?.className}" agendada.` });
        onFormSubmit(); 
        form.reset({...defaultValues, teacher: currentTeacher });
      } else {
        toast({ variant: 'destructive', title: 'Error al Crear Reserva', description: result.message });
      }
    }
  }

  useEffect(() => {
    if (!isEditing) {
      form.setValue('teacher', currentTeacher);
    }
  }, [currentTeacher, isEditing, form]);


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
      <div className="space-y-2">
        <Label>Tipo de Reserva</Label>
        <RadioGroup
          value={form.watch('type')} 
          onValueChange={(value) => form.setValue('type', value as BookingType, { shouldValidate: true })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="type-single" disabled={isEditing}/>
            <Label htmlFor="type-single">Única</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="type-recurring" disabled={isEditing}/>
            <Label htmlFor="type-recurring">Clase Fija</Label>
          </div>
        </RadioGroup>
         {isEditing && <p className="text-xs text-muted-foreground">El tipo de reserva no se puede cambiar al editar.</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="teacher">Profesor que imparte</Label>
          <Select 
            value={form.watch('teacher')}
            onValueChange={(value) => form.setValue('teacher', value as Teacher)} 
          >
            <SelectTrigger id="teacher">
              <SelectValue placeholder="Seleccionar profesor" />
            </SelectTrigger>
            <SelectContent>
              {TEACHERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {form.formState.errors.teacher && <p className="text-sm text-destructive">{form.formState.errors.teacher.message}</p>}
        </div>
        <div>
          <Label htmlFor="className">Nombre de la Clase</Label>
          <Input id="className" {...form.register('className')} />
          {form.formState.errors.className && <p className="text-sm text-destructive">{form.formState.errors.className.message}</p>}
        </div>
      </div>

      {bookingType === 'single' && (
        <div>
          <Label htmlFor="date">Fecha</Label>
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !form.watch('date') && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('date') ? format(form.watch('date')!, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.watch('date')}
                onSelect={(date) => form.setValue('date', date, { shouldValidate: true })}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.date && <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>}
        </div>
      )}

      {bookingType === 'recurring' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dayOfWeek">Día de la semana</Label>
            <Select 
              value={form.watch('dayOfWeek')}
              onValueChange={(value) => form.setValue('dayOfWeek', value as DayOfWeek)}
            >
              <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Seleccionar día" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.dayOfWeek && <p className="text-sm text-destructive">{form.formState.errors.dayOfWeek.message}</p>}
          </div>
          <div>
            <Label htmlFor="duration">Duración</Label>
            <Select 
              value={form.watch('duration')}
              onValueChange={(value) => form.setValue('duration', value as DurationOption)}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Seleccionar duración" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Hora de Inicio</Label>
          <Select 
            value={form.watch('startTime')}
            onValueChange={(value) => form.setValue('startTime', value)} 
          >
            <SelectTrigger id="startTime">
              <SelectValue placeholder="Seleccionar hora" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.filter(ts => ts.time !== '22:00').map(slot => <SelectItem key={`start-${slot.time}`} value={slot.time}>{slot.time}</SelectItem>)}
            </SelectContent>
          </Select>
          {form.formState.errors.startTime && <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>}
        </div>
        <div>
          <Label htmlFor="endTime">Hora de Fin</Label>
          <Select 
            value={form.watch('endTime')}
            onValueChange={(value) => form.setValue('endTime', value)}
          >
            <SelectTrigger id="endTime">
              <SelectValue placeholder="Seleccionar hora" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.filter(ts => ts.time !== '08:00').map(slot => <SelectItem key={`end-${slot.time}`} value={slot.time}>{slot.time}</SelectItem>)}
            </SelectContent>
          </Select>
          {form.formState.errors.endTime && <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>}
        </div>
      </div>

      <div>
        <Label>Selector de Color</Label>
        <RadioGroup 
          value={form.watch('color')}
          onValueChange={(value) => form.setValue('color', value as BookingColor)}
          className="flex flex-wrap gap-2 pt-2"
        >
          {BOOKING_COLORS.map(color => (
            <Label key={color} htmlFor={`color-${color}`} className="cursor-pointer">
              <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
              <div
                className={cn(
                  "w-8 h-8 rounded-md border-2 border-transparent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  form.watch('color') === color && "ring-2 ring-primary border-foreground"
                )}
                style={{ backgroundColor: color }}
              />
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Reserva' : 'Guardar Reserva')}
      </Button>
    </form>
  );
}
