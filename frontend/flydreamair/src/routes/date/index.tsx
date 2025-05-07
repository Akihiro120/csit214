import { createFileRoute } from '@tanstack/react-router';
import { DatePicker } from '../../components/DatePicker';
import { useState } from 'react';
import { SelectedDate } from '../../type';
import { handleDateSelect } from '../../utils/DateHandler';

export const Route = createFileRoute('/date/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [selectedDate, setSelectedDate] = useState<SelectedDate>({
        selectedDeptDate: null,
    });

    return (
        <div>
            <DatePicker
                selectedDate={selectedDate}
                setDateSelect={(day) => handleDateSelect(day, setSelectedDate)}
                setVisability={() => {}}
            />
            <div className="mt-4 p-4 border rounded-md">
                <p>
                    Departure Date:{' '}
                    {selectedDate.selectedDeptDate?.toLocaleDateString() || 'Not selected'}
                </p>
            </div>
        </div>
    );
}
