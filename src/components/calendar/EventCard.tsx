import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  booking: Booking;
  onClick?: () => void; // For potential edit/delete later
}

export function EventCard({ booking, onClick }: EventCardProps) {
  const cardStyle = {
    backgroundColor: booking.color,
    opacity: booking.type === 'single' ? 0.9 : 1,
  };

  return (
    <div
      className={cn(
        "p-2 rounded-md text-xs text-primary-foreground shadow-md overflow-hidden h-full flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow",
        booking.type === 'recurring' && "recurring-event-stripes"
      )}
      style={cardStyle}
      onClick={onClick}
      title={`${booking.className} (${booking.teacher}) - ${booking.startTime} a ${booking.endTime}`}
    >
      <div>
        <p className="font-bold truncate">{booking.className}</p>
        <p className="truncate">{booking.teacher}</p>
      </div>
      <p className="text-[10px] opacity-80 truncate">Por: {booking.createdBy}</p>
    </div>
  );
}
