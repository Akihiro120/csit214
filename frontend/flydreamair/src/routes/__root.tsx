import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { PlaneBackground } from '../components/background/background';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const location = useLocation();
    return (
        <>
            <div className="h-screen overflow-hidden grid grid-rows-[auto_1fr]">
                <Navbar />
                <div className="h-full overflow-hidden flex justify-center items-center">
                    <Outlet />
                </div>
                {location.pathname === '/' && <PlaneBackground />}
            </div>
        </>
    );
}
