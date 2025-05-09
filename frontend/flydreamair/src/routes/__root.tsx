import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const location = useLocation();
    return (
        <>
            <div className="h-full grid grid-rows-[auto_1fr]">
                <Navbar />
                {/*                 {location.pathname === '/' && <PlaneBackground />} */}
                <div className="flex justify-center items-center">
                    <Outlet />
                </div>
            </div>
        </>
    );
}
