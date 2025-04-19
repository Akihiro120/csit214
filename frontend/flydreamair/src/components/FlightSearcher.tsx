import { JSX, useState } from "react";
import { useNavigate } from '@tanstack/react-router';


export function FlightSearcher(): JSX.Element {
    const locations = ["ADL", "BNE", "DRW", "HBA", "MEL", "PER", "SYD", "WOL"];
    const [from, setFrom] = useState<string>("WOL"); // Default From: WOL
    const [to, setTo] = useState<string>("MEL");   // Default To: MEL
    const [date, setDate] = useState<string>("");
    // Initialize lists excluding the default selection of the *other* dropdown
    const [fromList, setFromList] = useState<string[]>([...locations.filter(loc => loc !== "MEL")]);
    const [toList, setToList] = useState<string[]>([...locations.filter(loc => loc !== "WOL")]);
    const navigate = useNavigate(); // Hook for navigation

    const handleFromChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newFrom = event.target.value;
        setFrom(newFrom);
        // Update the 'To' list to exclude the newly selected 'From' location
        setToList(locations.filter(loc => loc !== newFrom));
    };

    const handleToChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTo = event.target.value;
        setTo(newTo);
        // Update the 'From' list to exclude the newly selected 'To' location
        setFromList(locations.filter(loc => loc !== newTo));
    };

    //date select is text input
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDate(event.target.value);
    };

    // Submit handler
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        if (!from || !to || !date) {
            // Optional: Add some user feedback if fields are missing
            console.error("Please select departure, arrival, and date.");
            return;
        }
        // Construct the search query parameters
        const searchParams = new URLSearchParams({
            from,
            to,
            date,
            flex: 'true' // Add flex=true as requested
        });
        // Navigate to the search results page
        // Pass search parameters as an object literal
        navigate({ to: '/booking/search', search: { from, to, date, flex: 'true' } });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-gray-100 rounded-md shadow-md w-1/2 align-middle">
            <div className="flex flex-row gap-4">
                <select value={from} onChange={handleFromChange} className="border border-gray-300 rounded-md p-2">
                    {/* No default "From" option needed as state has a default */}
                    {fromList.map((location) => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
                <select value={to} onChange={handleToChange} className="border border-gray-300 rounded-md p-2">
                    {/* No default "To" option needed as state has a default */}
                    {toList.map((location) => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
            </div>
            <input type="date" value={date} onChange={handleDateChange} className="border border-gray-300 rounded-md p-2" required />
            <button type="submit" className="bg-blue-500 text-white rounded-md p-2">Search</button>
        </form>
    )
}
