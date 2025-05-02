import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/booking")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Outlet />
		</>
	);
}
