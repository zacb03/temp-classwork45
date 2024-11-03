import { Box, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

// Update roomData to be an object with department-specific rooms
export const roomData: { [key: string]: { title: string }[] } = {
  'IT': [
    { title: "D202" },
    { title: "D312" },
    { title: "D201" },
  ],
  'Marketing': [
    { title: "Creative Studio" },
    { title: "Meeting Room" },
    { title: "Presentation Room" },
  ],
  'Robertson Library': [
    { title: "Study Area" },
    { title: "Reading Room" },
    { title: "Group Study Room" },
    { title: "Quiet Zone" },
  ],
  // ... add rooms for other departments ...
  'default': [
    { title: "Conference Room" },
    { title: "Meeting Room" },
    { title: "Boardroom" },
  ]
};

interface RoomProps {
  title: string;
  onSelect?: (title: string) => void;
  isSelected?: boolean;
}

export default function Room({ title, onSelect, isSelected }: RoomProps) {
  return (
    <div 
      className={cn(
        "p-6 flex justify-between items-center transition-colors rounded-sm duration-200 cursor-pointer border-b last:border-b-0",
        isSelected 
          ? [
              "first:rounded-t-lg last:rounded-b-lg",
              "bg-gray-100"
            ]
          : [
              "hover:bg-gray-100"
            ]
      )}
      onClick={() => onSelect?.(title)}
    >
      <div className="flex items-center gap-3">
        <Box size={20} className={isSelected ? "text-[#614CFB]" : "text-black"} />
        <div className={cn(
          "font-medium",
          isSelected ? "text-[#614CFB]" : "text-[#262626]"
        )}>{title}</div>
      </div>
      <ChevronRight 
        className={cn(
          isSelected 
            ? "text-[#614CFB] bg-gray-200" 
            : "text-black"
        )} 
        size={20} 
      />
    </div>
  );
}