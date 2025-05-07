import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'; // Import useNavigate
import { SearchResult } from '../../../components/SearchResult';
import { FlightSearchResult } from '../../../type';
// import { Navigate } from "@tanstack/react-router";
import { AxiosError } from 'axios';
import apiClient from '../../../utils/axios';

export const Route = createFileRoute('/booking/search/')({
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
        <div className="flex flex-col gap-4 bg-white" id="result">
            <h1>Flight Search Results</h1>
            {data.flights.map((flight: FlightSearchResult) => (
                <SearchResult
                    key={flight.flight_id}
                    flight={flight}
                    onclick={() => submitRequest(flight.flight_id)}
                />
            ))}
        </div>
    );
}
