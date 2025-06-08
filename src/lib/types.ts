export type Teacher = 'Oski' | 'Flor' | 'Joa';

export type BookingType = 'single' | 'recurring';

export type BookingColor = '#FF6B6B' | '#4ECDC4' | '#45B7D1' | '#FED766' | '#9B59B6'; // Example colors

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export type DurationOption = '1 Mes' | '3 Meses' | '6 Meses' | 'Indefinido';

export interface BaseBooking {
  id: string;
  className: string;
  teacher: Teacher;
  createdBy: Teacher;
  startTime: string; // HH:mm format e.g., "09:00"
  endTime: string; // HH:mm format e.g., "10:30"
  color: BookingColor;
}

export interface SingleBooking extends BaseBooking {
  type: 'single';
  date: string; // YYYY-MM-DD format
}

export interface RecurringBooking extends BaseBooking {
  type: 'recurring';
  dayOfWeek: DayOfWeek;
  startDate: string; // YYYY-MM-DD format
  endDate: string | null; // YYYY-MM-DD format or null for 'Indefinido'
  duration: DurationOption;
}

export type Booking = SingleBooking | RecurringBooking;

export interface TimeSlot {
  time: string; // HH:mm format
  isHour: boolean; // True if it's a full hour, e.g., 08:00, 09:00
}
