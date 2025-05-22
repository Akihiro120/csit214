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
            <div className="min-h-screen grid grid-rows-[auto_1fr]">
                <Navbar />
                <div className="h-full flex justify-center items-center">
                    <Outlet />
                </div>
                {location.pathname === '/csit214/' && <PlaneBackground />}
            </div>
        </>
    );
}
