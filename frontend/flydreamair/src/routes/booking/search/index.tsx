import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";



export const Route = createFileRoute("/booking/search/")({
    validateSearch: (search) => ({
        from: String(search.from || ""),
        to: String(search.to || ""),
        date: String(search.date || ""),
    }),
    component: RouteComponent,
});


function RouteComponent() {
    // Get query parameters from the route
    const { from = "", to = "", date= "" } = Route.useSearch();

    // Fetch flights using TanStack Query
    const { data, isLoading, error } = useQuery({
        
        // Query key ensures caching and refetching when params change
        queryKey: ["flights", { from, to, date }],
        
        
        // Fetch function
        queryFn: async () => {
            // Construct the API URL with query parame∏ters
            const apiUrl = new URL("/api/flights", window.location.origin);
            if (from) apiUrl.searchParams.append("from", from);
            if (to) apiUrl.searchParams.append("to", to);
            if (date) apiUrl.searchParams.append("date", date);
            apiUrl.searchParams.append("flex", "true"); // Example limit

            // Fetch the data
            const response = await fetch(apiUrl.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        },
        // Only fetch if required parameters are present
        enabled: !!from && !!to && !!date,
        // No Refetching required
        refetchOnWindowFocus: false,

    });

    // Render loading, error, or data
    if (isLoading) return <div>Loading flights...</div>;
    if (error) return <div>Error fetching flights: {error.message}</div>;
    if (!data || data.length === 0) return <div>No flights found.</div>;

    // Render the flight data

    return (
        <div>
            <h1>Flight Search Results</h1>
            <ul>
                {data.map((flight: any) => ( // Using any here, please forgive me, until we define a full type Interfaces and shit. Need to get kevin to sort that before we do.
                    <li key={flight.flight_id}>
                        Flight Number: {flight.flight_number}
                        Flight Time: {flight.dept_time}
                        Departure: {flight.from}
                        Arrival: {flight.to}

                    </li>
                ))}
            </ul>
        </div>
    );
}
