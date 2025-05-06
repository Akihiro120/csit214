import { JSX } from 'react';
export interface FlightSearchResult {
    flight_id: string;
    dept_city: string;
    arr_city: string;
    base_fare: string;
    dept_time: string;
    arr_time: string;
}

interface Props {
    onclick: () => void;
    flight?: FlightSearchResult;
}

export function SearchResult({ onclick, flight }: Props): JSX.Element | null {
    if (!flight) {
        return null; // Or return some placeholder content
    }

    return (
        <div
            onClick={onclick}
            className="text---accent stroke-accent bg-(white) hover:stroke-1 shadow-md/25 p-2 rounded-md"
        >
            <div className="text-sm text-gray-500">Departing: {flight.dept_city}</div>
            <div className="text-sm text-gray-500">Departure Time: {flight.dept_time}</div>
            <div className="text-sm text-gray-500">Arrival: {flight.arr_city}</div>
            <div className="text-sm text-gray-500">Arrival Time: {flight.arr_time}</div>
            <div className="text-sm text-gray-500">Price: ${flight.base_fare}</div>
        </div>
    );
}
