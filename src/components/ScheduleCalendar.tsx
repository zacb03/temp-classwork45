import React, { useEffect, useRef, useState } from 'react';
import { format, startOfWeek, addDays, isToday, isSameWeek } from 'date-fns';
import { ChevronLeftIcon, TableIcon, SearchIcon, CalendarPlusIcon, ListCollapseIcon, CalendarDaysIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast"

interface CalendarEvent {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  className: string;
  isConfirmed: boolean;
}

interface ScheduleCalendarProps {
  events: CalendarEvent[];
  viewType: 'day' | 'week';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewToggle: () => void;
  onHome: () => void;
  onAddEvent: (date: Date, startTime?: string, duration?: number) => void;
  onViewEventDetails: (eventId: string) => void;
  selectedRoom: string | null;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  events,
  viewType,
  currentDate,
  onDateChange,
  onViewToggle,
  onHome,
  onAddEvent,
  onViewEventDetails,
  selectedRoom
}) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // Start from 6 AM, 18 hours total

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showMoreEvents, setShowMoreEvents] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragEvent, setDragEvent] = useState<{
    x: number;
    y: number;
    startTime?: string;
    endTime?: string;
  } | null>(null);

  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const [isRecurring, setIsRecurring] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (selectedRoom) {
      setIsLoading(true);
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [selectedRoom]);

  useEffect(() => {
    const handleScroll = () => {
      if (calendarRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = calendarRef.current;
        const threshold = clientHeight * 0.8; // 80% of the viewport height

        // Check if any events are below the threshold
        const eventsBelow = events.some(event => {
          const eventElement = document.getElementById(`event-${event.id}`);
          if (eventElement) {
            const eventPosition = eventElement.offsetTop - scrollTop;
            return eventPosition > threshold;
          }
          return false;
        });

        setShowMoreEvents(eventsBelow);
      }
    };

    const scrollElement = calendarRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [events]);

  useEffect(() => {
    // Rooms open at 6
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []); // Empty dependency array to ensure this runs only once when the component mounts

  const formatHour = (hour: number) => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours - 6 + minutes / 60) / 18 * 100;
  };

  const renderCurrentTimeLine = () => {
    const top = getCurrentTimePosition();
    return (
      <div
        className="absolute left-0 right-0 border-t-2 border-[#614CFB] z-10"
        style={{ top: `${top}%` }}
      />
    );
  };



  const renderEvent = (event: CalendarEvent, date: Date) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    const top = Math.max(0, (startHour + startMinute / 60 - 6) / 18 * 100);
    const height = ((endHour + endMinute / 60) - Math.max(6, startHour + startMinute / 60)) / 18 * 100;
    
    return (
      <ContextMenu key={event.id}>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            id={`event-${event.id}`}
            className={`absolute left-0 right-0 ${event.className} p-1 text-xs overflow-hidden`}
            style={{ top: `${top}%`, height: `${height}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onDateChange(date);
            }}
          >
            <div className="font-bold truncate">{event.title}</div>
            <div className="truncate">{event.location}</div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem
            onSelect={() => onViewEventDetails(event.id)}
            className="flex items-center"
          >
            <ListCollapseIcon className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">View Details</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };



  const renderMoreEventsIndicator = () => (
    <AnimatePresence>
      {showMoreEvents && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="absolute left-1/2 transform -translate-x-1/2 bottom-8 bg-[#614CFB] text-white px-4 py-2 rounded-full flex items-center z-40"
        >
          <span className="mr-2">More Events</span>
          <ChevronDownIcon size={20} />
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderWeekView = () => {
    const shouldShowTimeLine = isSameWeek(new Date(), weekStartDate, { weekStartsOn: 1 });

    return (
      <ScrollArea className="h-full rounded-b-3xl bg-white relative">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
          <div className="w-24">
            {hours.map(hour => (
              <div key={hour} className="h-24 px-2 py-1 text-xs text-right font-medium text-gray-700">
                {formatHour(hour)}
              </div>
            ))}
          </div>
          {daysOfWeek.map((day, index) => {
            const date = addDays(weekStartDate, index);
            const isWeekend = day === 'Saturday' || day === 'Sunday';
            return (
              <ContextMenu key={day}>
                <ContextMenuTrigger>
                  <div 
                    className={`border-l shadow-inner flex-grow ${isWeekend ? 'bg-gray-50' : ''}`}
                    onClick={() => onDateChange(date)}
                  >
                    <div className="relative h-full">
                      {hours.map(hour => (
                        <div key={hour} className="h-24 border-b "></div>
                      ))}
                      {isToday(date) && renderCurrentTimeLine()}
                      {events
                        .filter(event => event.date.toDateString() === date.toDateString())
                        .map(event => renderEvent(event, date))}
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                  <ContextMenuItem
                    onSelect={() => onAddEvent(date)}
                    className="flex items-center"
                  >
                    <CalendarPlusIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Add Event</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
          {shouldShowTimeLine && renderCurrentTimeLine()}
        </div>
      </ScrollArea>
    );
  };

  const renderHeaders = () => {
    const weekEnd = addDays(weekStartDate, 6);
    
    const formatDateRange = () => {
      if (format(weekStartDate, 'MMM') === format(weekEnd, 'MMM')) {
        return format(weekStartDate, 'MMMM yyyy');
      } else {
        return `${format(weekStartDate, 'MMMM')} - ${format(weekEnd, 'MMMM yyyy')}`;
      }
    };

    return (
      <div className="flex flex-col w-full mb-4 p-4">
        <div className="flex justify-between items-center mb-2 px-6 py-6">
          <div className="text-lg font-semibold flex items-center text-gray-800">
            <CalendarDaysIcon className="mr-2 h-5 w-5" />
            <ChevronLeftIcon 
              className="h-5 w-5 mr-2 cursor-pointer hover:text-gray-600" 
              onClick={() => setWeekStartDate(date => addDays(date, -7))}
            />
            {formatDateRange()}
            <ChevronRightIcon 
              className="h-5 w-5 ml-2 cursor-pointer hover:text-gray-600"
              onClick={() => setWeekStartDate(date => addDays(date, 7))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={() => setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              Today
            </Button>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="default"
                  className="bg-[#614CFB] hover:bg-[#4e3dd4] h-10"
                >
                  <CalendarPlusIcon className="w-4 h-4 mr-1" />
                  Book a timeslot
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">New Booking</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a new booking for {format(currentDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <label htmlFor="start-time" className="text-sm font-medium">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="start-time"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="duration" className="text-sm font-medium">
                        For How Long
                      </label>
                      <select
                        id="duration"
                        className="w-full px-3 py-2 border rounded-md"
                        onChange={(e) => {
                          const startTime = (document.getElementById('start-time') as HTMLInputElement).value;
                          if (startTime) {
                            const [hours, minutes] = startTime.split(':').map(Number);
                            const durationMinutes = parseInt(e.target.value);
                            const endDate = new Date();
                            endDate.setHours(hours, minutes + durationMinutes);
                            const endTimeString = endDate.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            });
                            document.getElementById('end-time-display')!.textContent = `Ends at ${endTimeString}`;
                          }
                        }}
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                        <option value="240">4 hours</option>
                      </select>
                      <p id="end-time-display" className="text-sm text-gray-600 mt-1"></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="recurring"
                        onCheckedChange={(checked) => {
                          setIsRecurring(checked as boolean);
                        }}
                      />
                      <label
                        htmlFor="recurring"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recurring Booking
                      </label>
                    </div>
                    <AnimatePresence>
                      {isRecurring && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid gap-2"
                        >
                          <label htmlFor="end-date" className="text-sm font-medium">
                            Recurring Until
                          </label>
                          <input
                            type="date"
                            id="end-date"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Button 
                      className="w-full bg-[#614CFB] hover:bg-[#4e3dd4]"
                      onClick={() => {
                        handleBookTimeslot();
                        setIsPopoverOpen(false); // Close the popover
                      }}
                    >
                      Book your Timeslot
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="w-24"></div>
          {daysOfWeek.map((day, index) => {
            const date = addDays(weekStartDate, index);
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div
                key={day}
                className="text-center"
              >
                <div className="font-medium text-base text-gray-700">
                  <span className={`px-2 py-1 ${isToday ? 'bg-gray-100 text-gray-800 text-bold rounded' : ''}`}>
                    {format(date, 'EEE d')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  const handleBookTimeslot = () => {
    const startTimeInput = document.getElementById('start-time') as HTMLInputElement;
    const durationSelect = document.getElementById('duration') as HTMLSelectElement;

    if (startTimeInput.value && durationSelect.value) {
      // Ensure we're viewing the correct week
      const selectedWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      setWeekStartDate(selectedWeekStart);
      
      onAddEvent(currentDate, startTimeInput.value, parseInt(durationSelect.value));
      
      // Simple toast notification
      toast({
        title: "Timeslot Booked",
        description: `${format(currentDate, 'EEEE, MMMM d, yyyy')} at ${startTimeInput.value}`,

      });

      // Add confetti animation
      const end = Date.now() + 1 * 1000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      const frame = () => {
        if (Date.now() > end) return;

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.8 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.8 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
    }
  };

  return (
    <div className="h-[85vh] flex flex-col w-full max-w-full mx-auto relative">
      <AnimatePresence>
        {!selectedRoom ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
          >
            <p className="text-xl font-medium text-gray-600">
              Please select a room to begin
            </p>
          </motion.div>
        ) : isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
          >
            <Spinner />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-shrink-0 bg-white shadow rounded-t-2xl border-b-2">
        {renderHeaders()}
      </div>
      <div className="flex-grow overflow-hidden shadow rounded-b-2xl relative" ref={calendarRef}>
        {renderWeekView()}
        {renderMoreEventsIndicator()}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
