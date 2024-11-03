import { Search, ChevronDown, Box, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import ScheduleCalendar from '../components/ScheduleCalendar';
import Departments from '../components/Department';
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import Room, { roomData } from '../components/Room';

// Add this dynamic import with ssr disabled
const DotPattern = dynamic(
  () => import('@/components/ui/dot-pattern').then(mod => mod.DotPattern),
  { ssr: false }
)

// Updated sample events data
const sampleEvents = [
  // Conference Room events
  {
    id: '1',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    startTime: '09:00',
    endTime: '10:30',
    title: 'Team Meeting',
    location: 'Conference Room',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  {
    id: '2',
    date: new Date(),
    startTime: '14:00',
    endTime: '15:30',
    title: 'Project Review',
    location: 'Conference Room',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  // Meeting Room events
  {
    id: '3',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: '10:00',
    endTime: '11:00',
    title: 'Client Call',
    location: 'Meeting Room',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  // Boardroom events
  {
    id: '4',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    startTime: '15:00',
    endTime: '17:00',
    title: 'Board Meeting',
    location: 'Boardroom',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  // Executive Suite events
  {
    id: '5',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: '11:30',
    endTime: '13:00',
    title: 'Executive Lunch',
    location: 'Executive Suite',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  // Training Room events
  {
    id: '6',
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    title: 'New Employee Orientation',
    location: 'Training Room',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  // Auditorium events
  {
    id: '7',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: '18:00',
    endTime: '20:00',
    title: 'Company Town Hall',
    location: 'Auditorium',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
  // Breakout Space events
  {
    id: '8',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    startTime: '13:00',
    endTime: '14:00',
    title: 'Brainstorming Session',
    location: 'Breakout Space',
    className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
    isConfirmed: true,
  },
];

// Add this helper function at the top level
const generateEventId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'week'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [currentRooms, setCurrentRooms] = useState(roomData.default);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [events, setEvents] = useState(sampleEvents);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewToggle = () => {
    setViewType(viewType === 'day' ? 'week' : 'day');
  };

  const handleAddEvent = (date: Date, startTime?: string, duration?: number) => {
    if (startTime && duration && selectedRoom) {
      // Calculate end time
      const [hours, minutes] = startTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + duration);
      const endTime = endDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      const newEvent = {
        id: generateEventId(),
        date: date,
        startTime: startTime,
        endTime: endTime,
        title: `Booked Session`,
        location: selectedRoom,
        className: 'bg-[#E7E3FD] p-2 border-2 border-[#c7befa] text-[#614CFB] rounded-lg',
        isConfirmed: true,
      };

      setEvents(prevEvents => [...prevEvents, newEvent]);
    } else {
      console.log('Add event for', date);
    }
  };

  const handleViewEventDetails = (eventId: string) => {
    console.log('View details for event', eventId);
    // Implement event details view logic
  };

  const handleDepartmentSelect = (deptName: string) => {
    setSelectedDepartment(deptName);
    setCurrentRooms(roomData[deptName] || roomData.default);
  };

  const handleRoomSelect = (roomTitle: string) => {
    setSelectedRoom(currentRoom => currentRoom === roomTitle ? null : roomTitle);
  };

  const filteredEvents = useMemo(() => {
    if (!selectedRoom) return [];
    return events.filter(event => event.location === selectedRoom);
  }, [selectedRoom, events]);

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="min-h-screen"
    >
      {/* Left panel */}
      <ResizablePanel 
        defaultSize={40}
        minSize={30}
        maxSize={50}
      >
        <div className="bg-[#F5F5F5] flex flex-col items-start justify-start p-24 relative z-10 shadow-[2px_0_8px_0_rgba(0,0,0,0.1)] h-full">
          <span className="text-[#614CFB] text-base mt-8 font-medium">Syllabus ++</span>
          <h1 className="text-5xl font-bold mb-24 mt-2 text-[#262626] self-start">Booking System</h1>
          
          {/* Departments Component - increased width */}
          <div className="w-[95%]">  {/* Added wrapper div */}
            <Departments 
              selectedDepartment={selectedDepartment}
              onDepartmentSelect={handleDepartmentSelect}
            />
          </div>
          
          {/* Table - increased width */}
          <h2 className="text-xl font-semibold mt-8 mb-4 text-[#262626]">Rooms</h2>
          <div className="w-[95%] bg-white rounded-lg drop-shadow-md overflow-hidden">  {/* Changed from w-4/5 to w-[95%] */}
            {currentRooms.map((item, index) => (
              <Room 
                key={index} 
                title={item.title} 
                onSelect={handleRoomSelect}
                isSelected={selectedRoom === item.title}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-24 px-2">
            Room selection is subject to availability and may change without prior notice. The institution reserves the right to reassign rooms as necessary.
          </p>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right panel */}
      <ResizablePanel 
        defaultSize={60}
        minSize={50}
        maxSize={70}
      >
        <div className="bg-[#F5F5F5] p-20 pt-24 relative h-full">
          <DotPattern
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={1}
            className="absolute inset-0 opacity-[0.65] ml-3"
          />
          <ScheduleCalendar
            events={filteredEvents}
            viewType={viewType}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onViewToggle={handleViewToggle}
            onHome={() => setCurrentDate(new Date())}
            onAddEvent={handleAddEvent}
            onViewEventDetails={handleViewEventDetails}
            selectedRoom={selectedRoom}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
