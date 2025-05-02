import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <>
            <div className="h-full grid grid-rows-[auto_1fr]">
                <Navbar />
                <div className="flex justify-center items-center">
                    <Outlet />
                </div>
            </div>
        </>
    );
}
