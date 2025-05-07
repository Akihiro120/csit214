import { createFileRoute } from '@tanstack/react-router';
import { DateRange } from '../../components/DateRange';
import { useState } from 'react';
import { SelectedDates } from '../../type';
import { handleDatesSelect } from '../../utils/DateHandler';

export const Route = createFileRoute('/dates/')({
    component: RouteComponent,
});


function RouteComponent() {
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        selectedDeptDate: null,
        selectedRetDate: null,
    });

    
    return (
        <div>
            <DateRange
                selectedDates={selectedDates}
                setDateSelect={(day) => handleDatesSelect(day, setSelectedDates)}
            />
            <div className="mt-4 p-4 border rounded-md">
                <p>
                    Departure Date:{' '}
                    {selectedDates.selectedDeptDate?.toLocaleDateString() || 'Not selected'}
                </p>
                <p>
                    Return Date:{' '}
                    {selectedDates.selectedRetDate?.toLocaleDateString() || 'Not selected'}
                </p>
            </div>
        </div>
    );
}
