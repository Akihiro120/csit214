import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/booking")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<h1 className="mb-10">
				Common elements for booking sub pages, header is currently not include as it's a common element for ALL
				pages, can be changed
			</h1>
			<Outlet />
		</>
	);
}
