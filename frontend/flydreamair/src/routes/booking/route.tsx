import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Ticket } from '../../components/Ticket';
import { Wizards } from '../../components/Wizards';

export const Route = createFileRoute('/booking')({
    component: RouteComponent,
});

function RouteComponent() {
    const testFlight = {
        flight_id: 'string',
        dept_city: 'Sydney',
        arr_city: 'Brisbane',
        base_fare: '$100',
        dept_time: '6:00 AM',
        arr_time: '7:00 AM',
    };
    const testTicketInfo = {
        name: 'Customer Name',
        seat: '12A',
        class: 'Economy',
        meal: 'Steak',
        entertainment: 'Movies+',
        baggage: '40kg',
    };

    return (
        <>
            <div className="self-start min-h-full w-full grid grid-cols-[1fr_300px] p-12 gap-12">
                <Outlet />
                <div className="justify-self-center flex flex-col gap-4">
                    <Wizards />
                    <Ticket flight={testFlight} ticketInfo={testTicketInfo} />
                </div>
            </div>
        </>
    );
}
