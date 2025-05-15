import { SelectedDate, SelectedDates } from '../type';

export const handleDateSelect = (
    clickedDate: Date | null,
    setSelectedDate: React.Dispatch<React.SetStateAction<SelectedDate>>
) => {
    if (!clickedDate) return;
    setSelectedDate((prevDates) => {
        const { selectedDeptDate } = prevDates;

        // Case 1: No dates selected yet
        if (!selectedDeptDate) {
            return { selectedDeptDate: clickedDate };
        }
        return { selectedDeptDate: clickedDate };
    });
};

export const handleDatesSelect = (
    clickedDate: Date | null,
    setSelectedDates: React.Dispatch<React.SetStateAction<SelectedDates>>
) => {
    if (!clickedDate) return; // Guard against null clickedDate if a non-clickable day was somehow processed
    setSelectedDates((prevDates) => {
        const { selectedDeptDate, selectedRetDate } = prevDates;

        // Case 1: No dates selected yet
        if ((!selectedDeptDate && !selectedRetDate) || (selectedDeptDate && selectedRetDate)) {
            return { selectedDeptDate: clickedDate, selectedRetDate: null };
        }

        // Case 2: Only departure date is selected
        if (selectedDeptDate && !selectedRetDate) {
            // console.log('Selected departure date:', selectedDeptDate);
            // If clicked date is before departure date, swap em
            if (clickedDate.getTime() < selectedDeptDate.getTime()) {
                return { selectedDeptDate: clickedDate, selectedRetDate: selectedDeptDate };
            }
            // same date clicked
            if (clickedDate.getTime() === selectedDeptDate.getTime()) {
                return { selectedDeptDate: clickedDate, selectedRetDate: null };
            }
            // Otherwise, set as return date
            // console.log('Setting return date:', clickedDate);
            return { ...prevDates, selectedRetDate: clickedDate };
        }

        // Fallback: Should not be reached if the above logic is comprehensive.
        // If it is, it implies an unexpected state, so reset to the clickedDate as departure.
        return { selectedDeptDate: clickedDate, selectedRetDate: null };
    });
};
