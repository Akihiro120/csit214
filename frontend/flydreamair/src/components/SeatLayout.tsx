import { motion } from 'motion/react';
import { JSX, useState } from 'react';
import Seaticon from '../resource/Seaticon.svg?react';
import { Passenger } from '../type';
import { PassengerDetailPopup } from './PassengerDetailPopup';

interface Seat {
    id: string;
    booked: boolean;
}

interface SeatLayoutProps {
    seatMap: Seat[];
    className?: string;
    passengers?: Passenger[];
    setPassengers?: React.Dispatch<React.SetStateAction<Passenger[]>>;
}

export function SeatLayout({ seatMap, className, setPassengers }: SeatLayoutProps): JSX.Element {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const seatNumbers = Array(29)
        .fill(0)
        .map((_, index) => index + 1);
    seatNumbers.splice(12, 0, -1);
    seatNumbers.splice(16, 0, -2);

    return (
        <div
            className={`${className} grid grid-cols-[repeat(7, auto)] grid-rows-[min-content_50px_min-content] gap-y-5 gap-x-2`}
        >
            <motion.div
                className={`fixed inset-0 z-10 bg-black/50 flex items-center justify-center`}
                animate={isPopupOpen ? { opacity: 1 } : { opacity: 0, display: 'none' }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                    setIsPopupOpen(false);
                }}
            >
                <PassengerDetailPopup
                    setVisability={setIsPopupOpen}
                    seatNumber={selectedSeat}
                    className="w-[600px] h-[500px]"
                    setPassengers={setPassengers}
                />
            </motion.div>
            {/* middle aisle */}
            <div className="col-start-4 row-start-1 row-span-50 w-full grid grid-rows-[min-content_50px] auto-rows-min gap-y-5">
                {seatNumbers.map((seatNumber) => (
                    <div
                        key={seatNumber}
                        className="h-10 w-full flex items-center justify-center text-(--accent) font-bold"
                    >
                        {seatNumber > 0 ? seatNumber : null}
                    </div>
                ))}
            </div>
            {/* business class offset */}
            <div className="col-start-1 row-start-1 row-span-2"></div>
            <div className="col-start-7 row-start-1 row-span-2"></div>
            {/* exit rows */}
            <ExitRow className="row-start-13" />
            <ExitRow className="row-start-17" />
            {seatMap.map((seat) => (
                <Seat
                    key={seat.id}
                    id={seat.id}
                    booked={seat.booked}
                    setIsPopupOpen={setIsPopupOpen}
                    setSelectedSeat={setSelectedSeat}
                    selectedSeat={selectedSeat}
                />
            ))}
        </div>
    );
}
function Seat({
    id,
    booked,
    setIsPopupOpen,
    setSelectedSeat,
    selectedSeat,
}: {
    id: string;
    booked: boolean;
    setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedSeat: React.Dispatch<React.SetStateAction<string | null>>;
    selectedSeat: string | null;
}): JSX.Element {
    return (
        <Seaticon
            onClick={() => {
                setSelectedSeat(id);
                setIsPopupOpen(true);
            }}
            className={`${selectedSeat === id ? 'text-sky-500' : ''} ${booked ? 'text-gray-400 pointer-events-none' : 'text-green-600'} hover:text-green-500 hover:shadow-green-500 w-8 h-10 rounded cursor-pointer`}
        ></Seaticon>
    );
}
function ExitRow({ className }: { className: string }): JSX.Element {
    return (
        <div className={`relative ${className} col-start-1 col-span-7 h-10`}>
            <div className="absolute -left-4 -right-4 flex justify-between">
                <div className="flex items-center gap-4 font-bold text-(--accent)">
                    <div className="h-10 w-1 bg-(--accent) rounded-sm"></div>
                    <div>Exit</div>
                </div>
                <div className="flex items-center gap-4 font-bold text-(--accent)">
                    <div>Exit</div>
                    <div className="h-10 w-1 bg-(--accent) rounded-sm"></div>
                </div>
            </div>
        </div>
    );
}
