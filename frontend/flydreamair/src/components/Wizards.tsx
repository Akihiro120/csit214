import { useLocation } from '@tanstack/react-router';
import { JSX } from 'react';
import Clock from '../resource/Clock.svg?react';
import Payment from '../resource/Payment.svg?react';
import Seat from '../resource/Seat.svg?react';
import Suitcase from '../resource/Suitcase.svg?react';

interface Props {
    className?: string;
}

export function Wizards({ className }: Props): JSX.Element {
    const location = useLocation();
    const progress = location.pathname;

    return (
        <div className={`${className} flex gap-2 items-center min-w-[300px]`}>
            <Clock className="text-(--accent)" />
            <Line highlight={progress !== '/booking/search'} />
            <Seat
                className={`transition-colors duration-250 ease-in-out ${progress !== '/booking/search' ? 'text-(--accent)' : 'text-[#313131]'}`}
            />
            <Line highlight={progress === '/booking/extras' || progress === '/booking/payment'} />
            <Suitcase
                className={`transition-colors duration-250 ease-in-out ${
                    progress === '/booking/extras' || progress == '/booking/payment'
                        ? 'text-(--accent)'
                        : 'text-[#313131]'
                }`}
            />
            <Line highlight={progress === '/booking/payment'} />
            <Payment
                className={`transition-colors duration-250 ease-in-out ${
                    progress == '/booking/payment' ? 'text-(--accent)' : 'text-[#313131]'
                }`}
            />
        </div>
    );
}
function Line({ className, highlight }: { className?: string; highlight?: boolean }): JSX.Element {
    return (
        <div
            className={`${className} h-[5px] w-[25px] shrink-0 rounded-[2px] ${highlight ? 'bg-(--accent)' : 'bg-[#313131]'}`}
        ></div>
    );
}
