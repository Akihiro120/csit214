import { JSX } from "react";

interface Seat {
    id: string;
    booked: boolean;
}

interface SeatLayoutProps {
    seatMap: Seat[];
}

export function SeatLayout({ seatMap }: SeatLayoutProps): JSX.Element {
    const renderRow = (rowSeats: Seat[], isFirstClass: boolean) => {
        return (
            <div className="flex gap-2 mb-4">
                {/* Left side seats */}
                <div className="flex gap-2">
                    {rowSeats.slice(0, isFirstClass ? 2 : 3).map((seat) => (
                        <div
                            key={seat.id}
                            className={`w-8 h-8 border border-black ${
                                seat.booked ? "bg-gray-400" : "bg-blue-300"
                            }`}
                            title={seat.id}
                        >
                            {seat.id}
                        </div>
                    ))}
                </div>
                {/* Aisle */}
                <div className="w-4"></div>
                {/* Right side seats */}
                <div className="flex gap-2">
                    {rowSeats.slice(isFirstClass ? 2 : 3).map((seat) => (
                        <div
                            key={seat.id}
                            className={`w-8 h-8 border border-black ${
                                seat.booked ? "bg-gray-400" : "bg-blue-300"
                            }`}
                            title={seat.id}
                        >
                            {seat.id}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center">
            {/* First Class: 2 rows */}
            {seatMap.slice(0, 8).reduce((rows, _, index, array) => {
                if (index % 4 === 0) {
                    rows.push(renderRow(array.slice(index, index + 4), true));
                }
                return rows;
            }, [] as JSX.Element[])}

            {/* Business/Economy: 27 rows */}
            {seatMap.slice(8).reduce((rows, _, index, array) => {
                if (index % 6 === 0) {
                    rows.push(renderRow(array.slice(index, index + 6), false));
                }
                return rows;
            }, [] as JSX.Element[])}
        </div>
    );
}