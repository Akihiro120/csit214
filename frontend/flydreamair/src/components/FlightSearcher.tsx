import { JSX, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import apiClient from '../utils/axios';

// using lots of useStates so less re-renders
export function FlightSearcher(): JSX.Element {
    const locations = ['ADL', 'BNE', 'DRW', 'HBA', 'MEL', 'PER', 'SYD', 'WOL'];
    const [date, setDate] = useState<string>('');
    const [toLocation, setTo] = useState<string>('');
    const [fromLocation, setFrom] = useState<string>('');
    const [numPassengers, setNumPassengers] = useState<number>(1);
    const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
    const navigate = useNavigate();

    // should all this logic be passed in to to this component from the index.tsx???? @Cyclone170
    const handleSearch = async () => {
        if (!date || !toLocation || !fromLocation || fromLocation === toLocation) {
            return;
        }

        const sessionData = {
            numPassengers,
            isRoundTrip,
        };
        const searchParams = {
            from: fromLocation,
            to: toLocation,
            date: date,
        };

        try {
            const response = await apiClient.post('/api/flights', sessionData);
            if (response.status >= 200 && response.status < 300) {
                console.log('Session data saved successfully:', response.data);
                navigate({ to: '/booking/search', search: searchParams });
            } else {
                alert(
                    `Failed to save search details. Server responded with status: ${response.status}`
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
            alert(errorMessage);
        }
    };

    return (
        <div>
            <h1>Flight Search</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}
            >
                <label>
                    From:
                    <select value={fromLocation} onChange={(e) => setFrom(e.target.value)}>
                        <option value="">Select a location</option>
                        {locations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    To:
                    <select value={toLocation} onChange={(e) => setTo(e.target.value)}>
                        <option value="">Select a location</option>
                        {locations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Date:
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label>
                    Number of Passengers:
                    <input
                        type="number"
                        value={numPassengers}
                        onChange={(e) => setNumPassengers(Number(e.target.value))}
                        min={1}
                        max={6}
                    />
                </label>
                <label>
                    Round Trip:
                    <input
                        type="checkbox"
                        checked={isRoundTrip}
                        onChange={(e) => setIsRoundTrip(e.target.checked)}
                    />
                </label>
                <button type="submit">Search</button>
            </form>
            <button onClick={handleSearch}>Search Flights</button>
        </div>
    );
}
