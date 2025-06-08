import type { Teacher, BookingColor, DurationOption, DayOfWeek, TimeSlot } from './types';

export const TEACHERS: Teacher[] = ['Oski', 'Flor', 'Joa'];

export const BOOKING_COLORS: BookingColor[] = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FED766', // Yellow
  '#9B59B6', // Purple
];

export const DURATION_OPTIONS: DurationOption[] = ['1 Mes', '3 Meses', '6 Meses', 'Indefinido'];

export const DAYS_OF_WEEK: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DAYS_OF_WEEK_ENGLISH_MAP: { [key in DayOfWeek]: number } = {
  'Domingo': 0, // Sunday
  'Lunes': 1,   // Monday
  'Martes': 2,  // Tuesday
  'Miércoles': 3, // Wednesday
  'Jueves': 4,  // Thursday
  'Viernes': 5, // Friday
  'Sábado': 6,  // Saturday
};


export const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 22; hour++) {
    slots.push({ time: `${String(hour).padStart(2, '0')}:00`, isHour: true });
    slots.push({ time: `${String(hour).padStart(2, '0')}:30`, isHour: false });
  }
  slots.push({ time: '22:00', isHour: true}); // Add final slot
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();
