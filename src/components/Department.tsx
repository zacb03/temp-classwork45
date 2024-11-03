import { 
  ChevronDown, 
  Laptop, 
  HandCoins, 
  Users, 
  FlaskConical, 
  Sigma, 
  LibraryBig, 
  Scale, 
  Landmark 
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Draggable from 'react-draggable';

interface Department {
  name: string;
  location: string;
  icon?: React.ReactNode;
}

interface DepartmentsProps {
  selectedDepartment: string | null;
  onDepartmentSelect: (deptName: string) => void;
  onRoomsChange?: (rooms: { title: string }[]) => void;
}

// Add this before the Departments component
const roomData: { [key: string]: { title: string }[] } = {
  IT: [
    { title: 'Computer Lab 1' },
    { title: 'Server Room' },
    { title: 'Tech Support' }
  ],
  Marketing: [
    { title: 'Conference Room' },
    { title: 'Creative Studio' }
  ],
  Library: [
    { title: 'Main Reading Hall' },
    { title: 'Study Room 1' },
    { title: 'Study Room 2' }
  ],
  // Add default rooms for when department isn't found
  default: [
    { title: 'Room 101' },
    { title: 'Room 102' }
  ]
};

export default function Departments({ selectedDepartment, onDepartmentSelect, onRoomsChange }: DepartmentsProps) {
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [departments, setDepartments] = useState([
    { name: 'IT', location: 'D-Block', icon: <Laptop size={20} className="mr-2 shrink-0" /> },
    { name: 'Marketing', location: 'O-Block', icon: <HandCoins size={20} className="mr-2 shrink-0" /> },
    { name: 'Library', location: 'All Students', icon: <LibraryBig size={20} className="mr-2 shrink-0" /> },
    { name: 'Engineering', location: 'E-Block', icon: <Sigma size={20} className="mr-2 shrink-0" /> },
    { name: 'Finance', location: 'F-Block', icon: <Landmark size={20} className="mr-2 shrink-0" /> },
    { name: 'Law', location: 'H-Block', icon: <Scale size={20} className="mr-2 shrink-0" /> },
    { name: 'Chemistry', location: 'R-Block', icon: <FlaskConical size={20} className="mr-2 shrink-0" /> },
    { name: 'Psychology', location: 'S-Block', icon: <Users size={20} className="mr-2 shrink-0" /> },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const draggedItemRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumnCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Adjusted breakpoints for resizable panel
        if (containerWidth < 400) {
          setColumnCount(1);
        } else if (containerWidth < 600) {
          setColumnCount(2);
        } else {
          setColumnCount(3);
        }
      }
    };

    // Create a ResizeObserver to watch for container width changes
    const resizeObserver = new ResizeObserver(updateColumnCount);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen for window resize events
    window.addEventListener('resize', updateColumnCount);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateColumnCount);
    };
  }, []);

  const handleDepartmentSelect = (deptName: string) => {
    onDepartmentSelect(deptName);
    
    if (onRoomsChange) {
      const departmentRooms = roomData[deptName] || roomData.default;
      onRoomsChange(departmentRooms);
    }

    const selectedIndex = departments.findIndex(d => d.name === deptName);
    // Adjust the index check based on current column count
    if (selectedIndex >= columnCount) {
      setDepartments(prev => {
        const selected = prev.find(d => d.name === deptName)!;
        const filtered = prev.filter(d => d.name !== deptName);
        return [selected, ...filtered];
      });
    }

    if (showAllDepartments && selectedIndex >= columnCount) {
      setShowAllDepartments(false);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (deptName: string) => {
    setIsDragging(false);
    handleDepartmentSelect(deptName);
  };

  const renderDepartment = (dept: Department, index: number, isExpandedSection: boolean = false) => {
    const isDeptSelected = selectedDepartment === dept.name;
    
    return (
      <Draggable
        disabled={!isDeptSelected}
        onStart={handleDragStart}
        onStop={() => handleDragStop(dept.name)}
        position={isDeptSelected ? undefined : { x: 0, y: 0 }}
      >
        <motion.div
          layout="position"
          key={dept.name}
          initial={isExpandedSection ? { opacity: 0, y: 20 } : false}
          animate={isExpandedSection ? { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.2, delay: index * 0.1 }
          } : undefined}
          exit={isExpandedSection ? { 
            opacity: 0, 
            y: 20,
            transition: { duration: 0.2 }
          } : undefined}
          className={`px-6 py-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 h-[80px] flex flex-col justify-center ${
            isDeptSelected ? 'border-2 border-[#614CFB] z-10' : ''
          }`}
          onClick={() => !isDragging && handleDepartmentSelect(dept.name)}
          style={{ 
            cursor: isDeptSelected ? 'grab' : 'pointer',
            position: 'relative'
          }}
        >
          <div className="font-medium flex items-center" style={{ 
            color: isDeptSelected ? '#614CFB' : '#1f2937'
          }}>
            {dept.icon}
            {dept.name}
          </div>
          <div className="text-sm text-gray-600">{dept.location}</div>
        </motion.div>
      </Draggable>
    );
  };

  return (
    <div className="w-full mb-8" ref={containerRef}>
      <div 
        className="flex justify-between items-center mb-4 cursor-pointer"
        onClick={() => setShowAllDepartments(!showAllDepartments)}
      >
        <h2 className="text-xl font-semibold text-[#262626]">Departments</h2>
        <ChevronDown className={`text-gray-400 transform transition-transform ${showAllDepartments ? 'rotate-180' : ''}`} size={20} />
      </div>
      
      <motion.div 
        className={`grid gap-3`}
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
        layout
      >
        {departments.slice(0, columnCount).map((dept, index) => renderDepartment(dept, index, false))}
        
        <AnimatePresence mode="wait" initial={false}>
          {showAllDepartments && (
            <motion.div
              key="additional-departments"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="contents"
            >
              {departments.slice(columnCount).map((dept, index) => renderDepartment(dept, index + columnCount, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}