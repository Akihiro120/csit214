import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/booking/search/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div className="text-4xl">This is the "/booking/search/" page!</div>;
}
