import { createFileRoute } from '@tanstack/react-router'
import { DateRange } from '../../components/DateRange'
import { useState } from 'react'

export const Route = createFileRoute('/date/')({
  component: RouteComponent,
})

interface SelectedDates {
  selectedDeptDate: Date | null;
  selectedRetDate: Date | null;
}

function RouteComponent() {
  const [selectedDates, setSelectedDates] = useState<SelectedDates>({
    selectedDeptDate: null,
    selectedRetDate: null,
  });

  const handleDateSelect = (clickedDate: Date | null) => {
    if (!clickedDate) return; // Guard against null clickedDate if a non-clickable day was somehow processed

    setSelectedDates(prevDates => {
      const { selectedDeptDate, selectedRetDate } = prevDates;

      // Case 1: No dates selected yet
      if ((!selectedDeptDate && !selectedRetDate) || (selectedDeptDate && selectedRetDate)) {
        return { selectedDeptDate: clickedDate, selectedRetDate: null };
      }

      // Case 2: Only departure date is selected
      if (selectedDeptDate && !selectedRetDate) {
        console.log('Selected departure date:', selectedDeptDate);
        // If clicked date is before departure date, swap em
        if (clickedDate.getTime() < selectedDeptDate.getTime()) {
          return { selectedDeptDate: clickedDate, selectedRetDate: selectedDeptDate };
        }
        // same date clicked
        if (clickedDate.getTime() === selectedDeptDate.getTime()) {
          return { selectedDeptDate: clickedDate, selectedRetDate: null }; 
        }
        // Otherwise, set as return date
        console.log('Setting return date:', clickedDate);
        return { ...prevDates, selectedRetDate: clickedDate };
      }
      
      // Fallback: Should not be reached if the above logic is comprehensive.
      // If it is, it implies an unexpected state, so reset to the clickedDate as departure.
      return { selectedDeptDate: clickedDate, selectedRetDate: null };
    });
  };

  return (
    <div>
      <DateRange
        label="Select Departure & Return Dates"
        selectedDates={selectedDates}
        setDateSelect={handleDateSelect} 
      />
      <div className="mt-4 p-4 border rounded-md">
        <p>Departure Date: {selectedDates.selectedDeptDate?.toLocaleDateString() || 'Not selected'}</p>
        <p>Return Date: {selectedDates.selectedRetDate?.toLocaleDateString() || 'Not selected'}</p>
      </div>
    </div>
  );
}