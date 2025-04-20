import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SearchResult, FlightSearchResult } from "../../../components/SearchResult";



export const Route = createFileRoute("/booking/search/")({
    validateSearch: (search) => ({
        from: String(search.from || ""),
        to: String(search.to || ""),
        date: String(search.date || ""),
    }),
    component: RouteComponent,
});


function handleFlightClick(flight: FlightSearchResult) {
    console.log("Flight selected:", flight.flight_id);
    // Handle post request with session, then redirect to booking/seats
    const request = fetch("/api/booking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            flight_id: flight.flight_id
        }),
        }
    )};
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
    if (data.code === "ECONNREFUSED") return <div>Connection refused. Please try again later.</div>;

    console.log(data);
    // Render the flight data


    return (
        <div>
            <h1>Flight Search Results</h1>
                {data.map((flight: FlightSearchResult) => (
                     <SearchResult
                            onclick={() => {
                                console.log("Flight selected:", flight.flight_id);
                            }}
                        flight={flight}
                    />
                ))}
        </div>
    );
}
