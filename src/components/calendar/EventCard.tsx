
import type { Booking, Teacher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3 } from 'lucide-react';

interface EventCardProps {
  booking: Booking;
  currentTeacher: Teacher | null; // Can be null for guest view
  onRequestDelete: (booking: Booking) => void;
  onRequestEdit: (booking: Booking) => void;
  onClick?: () => void; 
  isGuestView?: boolean;
}

export function EventCard({ booking, currentTeacher, onRequestDelete, onRequestEdit, onClick, isGuestView = false }: EventCardProps) {
  const cardStyle = {
    backgroundColor: booking.color,
    opacity: booking.type === 'single' ? 0.9 : 1,
  };

  const canModify = !isGuestView && currentTeacher === booking.createdBy;

  return (
    <div
      className={cn(
        "p-2 rounded-md text-xs text-primary-foreground shadow-md overflow-hidden h-full flex flex-col justify-between group",
        booking.type === 'recurring' && "recurring-event-stripes",
        canModify || (onClick && !isGuestView) ? "cursor-pointer" : "cursor-default" 
      )}
      style={cardStyle}
      onClick={!canModify && onClick && !isGuestView ? onClick : undefined}
      title={`${booking.className} (${booking.teacher}) - ${booking.startTime} a ${booking.endTime}`}
    >
      <div className="flex-grow">
        <p className="font-bold truncate">{booking.className}</p>
        <p className="truncate">{booking.teacher}</p>
      </div>
      <div className="flex justify-between items-end">
        <p className="text-[10px] opacity-80 truncate flex-shrink mr-1">Por: {booking.createdBy}</p>
        {canModify && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 text-primary-foreground hover:bg-black/20"
              onClick={(e) => { e.stopPropagation(); onRequestEdit(booking); }}
              title="Editar Reserva"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 text-primary-foreground hover:bg-black/20"
              onClick={(e) => { e.stopPropagation(); onRequestDelete(booking); }}
              title="Eliminar Reserva"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
