import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'; // Import useNavigate

import { SearchResult } from '../../components/SearchResult';
import { FlightSearchResult } from '../../type';
// import { Navigate } from "@tanstack/react-router";
import Slider from '@mui/material/Slider';
import { AxiosError } from 'axios';
import { useState } from 'react';
import apiClient from '../../utils/axios';

export const Route = createFileRoute('/booking/search')({
    validateSearch: (search) => ({
        from: String(search.from || ''),
        to: String(search.to || ''),
        date: String(search.date || ''),
    }),
    component: Search,
});

function Search() {
    const { from = '', to = '', date = '' } = Route.useSearch();
    const navigate = useNavigate();
    const [priceRange, setPriceRange] = useState<number[]>([200, 1800]);
    const [deptTime, setDeptTime] = useState<number[]>([6, 22]);
    // load flights useQuery
    const { data, isLoading, error } = useQuery({
        queryKey: ['flights', { from, to, date }],
        queryFn: async () => {
            const apiUrl = new URL('/api/flights', window.location.origin);
            if (from) apiUrl.searchParams.append('from', from);
            if (to) apiUrl.searchParams.append('to', to);
            if (date) apiUrl.searchParams.append('date', date);

            const response = await fetch(apiUrl.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        enabled: !!from && !!to && !!date,

        // No Refetching required
        refetchOnWindowFocus: false,
    });

    if (isLoading) return <div>Loading flights...</div>;
    if (error) return <div>Error fetching flights: {error.message}</div>;
    if (data && data.code === 'ECONNREFUSED')
        return <div>Connection refused. Please try again.</div>;
    if (data.flights.length === 0) return <div>No flights found.</div>;

    const submitRequest = async (flightId: string) => {
        try {
            const postResponse = await apiClient.post('/api/booking/search', {
                flight_id: flightId,
            });

            if (postResponse.status >= 200 && postResponse.status < 300) {
                navigate({ to: '/booking/seats' });
            } else {
                alert(
                    `Failed to save search details. Server responded with status: ${postResponse.status}`
                );
            }
        } catch (error) {
            console.error('Error saving session data via POST:', error);
            let errorMessage = 'An error occurred while saving search details.';
            if (error instanceof AxiosError && error.response?.data?.error) {
                errorMessage = `Error: ${error.response.data.error}`;
            } else if (error instanceof Error) {
                errorMessage = `Error: ${error.message}`;
            }
            console.log(errorMessage);
        }
    };

    return (
        <div className="flex gap-4 items-start">
            <div className="flex flex-col gap-12 p-6 w-[300px] bg-(--pale-accent) rounded-sm sticky top-10">
                <RangeSlider
                    value={priceRange}
                    setValue={setPriceRange}
                    label="Price"
                    min={0}
                    max={4000}
                />
                <RangeSlider
                    value={deptTime}
                    setValue={setDeptTime}
                    label="Departure time"
                    min={0}
                    max={23}
                />
                <div className="flex flex-col gap-2">
                    <div className="text-xl">Number of stops</div>
                    <label htmlFor="0" className="flex gap-2 items-center cursor-pointer">
                        <input
                            className="cursor-pointer"
                            type="radio"
                            id="0"
                            name="stops"
                            value="0"
                        />
                        <div className="cursor-pointer">0 stop</div>
                    </label>
                    <label htmlFor="1" className="flex gap-2 items-center cursor-pointer">
                        <input
                            className="cursor-pointer"
                            type="radio"
                            id="1"
                            name="stops"
                            value="1"
                        />
                        <div className="cursor-pointer">1 stop</div>
                    </label>
                    <label htmlFor="2" className="flex gap-2 items-center cursor-pointer">
                        <input
                            className="cursor-pointer"
                            type="radio"
                            id="2"
                            name="stops"
                            value="2"
                        />
                        <div className="cursor-pointer">2 or more stop</div>
                    </label>
                </div>
            </div>
            <div className="grow-1 flex flex-col gap-4 bg-white" id="result">
                {data.flights.map((flight: FlightSearchResult) => {
                    const departureHour = parseInt(flight.dept_time.split(':')[0], 10);
                    if (
                        Number(flight.base_fare) < priceRange[0] ||
                        Number(flight.base_fare) > priceRange[1] ||
                        departureHour < deptTime[0] ||
                        departureHour > deptTime[1]
                    ) {
                        return null;
                    }
                    return (
                        <SearchResult
                            key={flight.flight_id}
                            flight={flight}
                            onclick={() => submitRequest(flight.flight_id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function RangeSlider({
    label,
    value,
    setValue,
    min,
    max,
}: {
    label: string;
    value: number[];
    setValue: (value: number[]) => void;
    min: number;
    max: number;
}) {
    const handleChange = (_: Event, newValue: number[]) => {
        setValue(newValue);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="text-xl">{label}</div>
            <div className="flex gap-4 items-center">
                <div className="text-sm w-10 text-center">
                    {label === 'Price' ? '$' + min : min + ':00'}
                </div>
                <Slider
                    value={value}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => {
                        if (label === 'Price') {
                            return '$' + value;
                        } else {
                            return value + ':00';
                        }
                    }}
                    min={min}
                    max={max}
                    sx={{
                        '& .MuiSlider-rail': {
                            backgroundColor: '#DBD5FF',
                            opacity: 1, // Ensure rail color is visible
                        },
                        '& .MuiSlider-track': {
                            backgroundColor: '#4c3eac',
                            borderColor: '#4c3eac', // Ensure border matches track color
                        },
                        '& .MuiSlider-thumb': {
                            backgroundColor: '#4c3eac',
                        },
                    }}
                />
                <div className="text-sm w-10 text-center">
                    {label === 'Price' ? '$' + max : max + ':00'}
                </div>
            </div>
        </div>
    );
}
