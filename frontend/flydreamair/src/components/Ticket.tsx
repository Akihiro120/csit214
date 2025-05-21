import { JSX } from 'react';
import Barcode from '../resource/Barcode.svg?react';
import { FlightSearchResult, SessionData } from '../type';
import { SearchResult } from './SearchResult';

interface Props {
    className?: string;
    sessionData: SessionData;
}

export function Ticket({ className, sessionData }: Props): JSX.Element {
    const passenger = sessionData.passengers ? sessionData.passengers[0] : null;
    return (
        <div
            className={`${className} flex flex-col drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] w-[300px]`}
        >
            {/* passenger name card */}
            <div className="flex justify-center items-center relative h-[100px] overflow-hidden rounded-t-2xl">
                <BottomCorners shadow="shadow-[0_0_0_200px_var(--accent)]" />
                <div className="text-2xl text-white">{passenger?.name ? passenger.name : ''}</div>
            </div>
            {/* flight details card */}
            {/* top corners cut */}
            <div className="flex justify-center items-center relative h-[30px] overflow-hidden">
                <TopCorners shadow="shadow-[0_0_0_200px_#ffffff]" />
            </div>
            {/* actual flight details */}
            <div className="flex flex-col items-center bg-white gap-6">
                <SearchResult className="w-full" lite flight={sessionData as FlightSearchResult} />
                <div className="flex justify-center gap-4 flex-wrap">
                    {passenger?.seat ? (
                        <TextField label="Seat" value={passenger.seat} className="w-[45%]" />
                    ) : null}
                    {passenger?.class ? (
                        <TextField label="Class" value={passenger.class} className="w-[45%]" />
                    ) : null}
                    {passenger?.extras && passenger.extras.meal ? (
                        <TextField label="Meal" value={passenger.extras.meal} className="flex-1" />
                    ) : null}
                    {passenger?.extras && passenger.extras.carry_on ? (
                        <TextField
                            label="Entertainment"
                            value={passenger && passenger.extras.entertainment}
                            className="flex-1"
                        />
                    ) : null}
                    {passenger?.extras && passenger.extras.baggage ? (
                        <TextField
                            label="Baggage"
                            value={passenger.extras.baggage}
                            className="flex-1"
                        />
                    ) : null}
                </div>
            </div>
            {/* bottom corners cut */}
            <div className="flex items-center relative h-[30px] overflow-hidden">
                <BottomCorners shadow="shadow-[0_0_0_200px_#ffffff]" />
            </div>
            {/* dashed line */}
            <div className="bg-white w-[284px] self-center">
                <div className="h-[1px] bg-repeat-x bg-[length:100%_1px] bg-[position:0_0] bg-[repeating-linear-gradient(to_right,var(--accent)_0,var(--accent)_8px,transparent_8px,transparent_12px)]"></div>
            </div>
            {/* barcode */}
            <div className="flex justify-center items-center relative h-[100px] overflow-hidden rounded-b-2xl">
                <Barcode />
                <TopCorners shadow="shadow-[0_0_0_200px_#ffffff]" />
            </div>
        </div>
    );
}
function TopCorners({ shadow }: { shadow: string }): JSX.Element {
    return (
        <>
            <div
                className={`absolute z-[-10] w-[16px] h-[16px] left-[-8px] top-[-8px] ${shadow} rounded-[1000px]`}
            ></div>
            <div
                className={`absolute z-[-10] w-[16px] h-[16px] right-[-8px] top-[-8px] ${shadow} rounded-[1000px]`}
            ></div>
        </>
    );
}

function BottomCorners({ shadow }: { shadow: string }): JSX.Element {
    return (
        <>
            <div
                className={`absolute z-[-10] w-[16px] h-[16px] left-[-8px] bottom-[-8px] ${shadow} rounded-[1000px]`}
            ></div>
            <div
                className={`absolute z-[-10] w-[16px] h-[16px] right-[-8px] bottom-[-8px] ${shadow} rounded-[1000px]`}
            ></div>
        </>
    );
}
function TextField({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className?: string;
}): JSX.Element {
    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="text-xs font-bold text-(--accent)">{label}</div>
            <div className="">{value}</div>
        </div>
    );
}
