import { JSX } from 'react';

interface Seat {
    id: string;
    booked: boolean;
}

interface SeatLayoutProps {
    seatMap: Seat[];
    className?: string;
}

export function SeatLayout({ seatMap, className }: SeatLayoutProps): JSX.Element {
    return <div className={`${className}`}>Hello</div>;
}
