import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Ticket } from '../../components/Ticket';
import { Wizards } from '../../components/Wizards';
import { SessionData } from '../../type';
import apiClient from '../../utils/axios';

export const Route = createFileRoute('/booking')({
    component: RouteComponent,
});

function RouteComponent() {
    const location = useLocation();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiClient.get('/api/booking/session');

                // Assuming response.data is an object matching SessionData
                if (response.data && Object.keys(response.data).length > 0) {
                    console.log('Existing session found via GET:', response.data);
                    setSessionData(response.data.currentBooking as SessionData);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error checking session via GET:', error.message);
                } else {
                    console.error('An unexpected error occurred:', error);
                }
                // Consider navigating away on error as well if session is critical
                // navigate('/');
            }
        };
        fetchSession();
    }, [location.pathname]);

    return (
        <>
            <div className="self-start min-h-full w-full grid grid-cols-[1fr_300px] p-12 gap-12">
                <Outlet />
                <div className="justify-self-center flex flex-col gap-4">
                    <Wizards />
                    {location.pathname !== '/booking/search' && sessionData ? (
                        <Ticket sessionData={sessionData} />
                    ) : null}
                </div>
            </div>
        </>
    );
}
