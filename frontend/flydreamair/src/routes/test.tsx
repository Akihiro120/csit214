import { createFileRoute } from "@tanstack/react-router";
import { SearchResult } from "../components/SearchResult";
import { Ticket } from "../components/Ticket";
import { Wizards } from "../components/Wizards";

export const Route = createFileRoute("/test")({
	component: RouteComponent,
});

function RouteComponent() {
	const testFlight = {
		flight_id: "string",
		dept_city: "Sydney",
		arr_city: "Brisbane",
		base_fare: "$100",
		dept_time: "6:00 AM",
		arr_time: "7:00 AM",
	};
	const testTicketInfo = {
		name: "Customer Name",
		seat: "12A",
		class: "Economy",
		meal: "Steak",
		entertainment: "Movies+",
		baggage: "40kg",
	};
	return (
		<div className="flex flex-col gap-4 items-center justify-center h-screen">
			<SearchResult className="w-[400px]" flight={testFlight} />
			<Wizards className="w-[300px]" progress="date" />
			<Ticket className="" flight={testFlight} ticketInfo={testTicketInfo} />
		</div>
	);
}
