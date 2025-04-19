import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FlightSearcher } from "../components/FlightSearcher";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<>
			Content in the root route goes here test
			<Outlet />
			<FlightSearcher />
			
		</>
	);
}
