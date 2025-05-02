import { createFileRoute } from "@tanstack/react-router";
import { SearchResult } from "../components/SearchResult";

export const Route = createFileRoute("/test")({
	component: RouteComponent,
});

function RouteComponent() {
	const flight = {
		flight_id: "uuid",
		dept_city: "Sydney",
		arr_city: "Brisbane",
		base_fare: "$500",
		dept_time: "6:00am",
		arr_time: "7:00am",
	};
	return <SearchResult flight={flight} onclick={() => {}}></SearchResult>;
}
