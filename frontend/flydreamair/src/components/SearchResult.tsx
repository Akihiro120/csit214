import { JSX } from 'react';
import Landing from '../resource/Landing.svg?react';
import Takeoff from '../resource/Takeoff.svg?react';
import { FlightSearchResult } from '../type';

interface Props {
    className?: string;
    onclick?: () => void;
    flight?: FlightSearchResult;
    lite?: boolean;
}
export function SearchResult({ className, onclick, flight, lite }: Props): JSX.Element | null {
    if (!flight) {
        return null; // Or return some placeholder content
    }

    return (
        <div
            onClick={onclick}
            className={`${className} bg-white flex ${lite ? '' : 'outline-(--accent) hover:outline shadow-md/25 p-2 rounded-xl'}`}
        >
            <FlightLocation
                city={flight.dept_city}
                time={flight.dept_time}
                icon={<Takeoff className="w-10 h-10 text-(--accent)" />}
                lite={lite}
            />
            <div className="flex-1 flex flex-col">
                {/* duration */}
                {!lite && (
                    <div className="self-center">
                        {calculateDuration(flight.dept_time, flight.arr_time)}
                    </div>
                )}
                {/* arrow */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="h-0.5 bg-(--accent) w-full relative">
                        <div
                            className="absolute top-1/2 right-0 -translate-y-1/2 w-0 h-0
									  border-t-[5px] border-t-transparent
									  border-b-[5px] border-b-transparent
									  border-l-[8px] border-l-(--accent)"
                        ></div>
                    </div>
                </div>
                {/* price */}
                {!lite && <div className="self-center">${flight.base_fare}</div>}
            </div>
            <FlightLocation
                city={flight.arr_city}
                time={flight.arr_time}
                icon={<Landing className="w-10 h-10 text-(--accent)" />}
                lite={lite}
            />
        </div>
    );
}
function FlightLocation({
    city,
    time,
    icon,
    lite,
}: {
    city: string;
    time: string;
    icon: React.ReactNode;
    lite?: boolean;
}): JSX.Element {
    return (
        <div className="flex flex-col items-center px-2">
            <div className={lite ? 'p-1' : 'p-2'}>{city}</div>
            {icon}
            <div className={lite ? 'p-1' : 'p-2'}>{time}</div>
        </div>
    );
}

// helper function to calculate the duration between two times
function calculateDuration(deptTime: string, arrTime: string): string {
    // Helper function to parse time string (H:MM or HH:MM, 0:00 to 24:00) into minutes since midnight
    const parseTime = (timeStr: string): number => {
        const [hoursStr, minutesStr] = timeStr.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        return hours * 60 + minutes; // Total minutes since midnight
    };

    const startMinutes = parseTime(deptTime);
    let endMinutes = parseTime(arrTime);

    // Handle overnight case (or flights that cross midnight)
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Add minutes in a day
    }

    const durationMinutes = endMinutes - startMinutes;

    // Handle zero duration case explicitly
    if (durationMinutes === 0) {
        return '0m';
    }

    // Calculate hours and remaining minutes for the output format
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    // Format the output string
    let output = '';
    if (hours > 0) {
        output += `${hours}h`;
    }
    if (minutes > 0) {
        output += `${minutes}m`;
    }

    // If duration is non-zero but output is empty (e.g. duration was < 1 minute, resulting in 0h 0m),
    // it should still show 0m if that's the policy, but current logic implies positive minutes or hours.
    // Given the problem context, if durationMinutes > 0, either hours or minutes (or both) must be > 0.
    // So, output will not be empty if durationMinutes > 0.

    return output;
}
