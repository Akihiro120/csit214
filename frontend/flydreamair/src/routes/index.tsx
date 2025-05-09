import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { ActionButton } from '../components/ActionButton';
import { DateInputBox } from '../components/DateInputBox';
import { DatePicker } from '../components/DatePicker';
import { DateRange } from '../components/DateRange';
import { DropdownButton } from '../components/DropdownButton';
import { DropdownInputBox } from '../components/DropdownInputBox';
import { DropdownMenuItem } from '../components/DropdownMenuItem';
import { DropdownProvider } from '../components/DropdownProvider';
import { PassengersInputBox } from '../components/PassengerInputBox';
import CalendarSvg from '../resource/Calendar.svg?react';
import Landing from '../resource/Landing.svg?react';
import Passenger from '../resource/Passenger.svg?react';
import Takeoff from '../resource/Takeoff.svg?react';
import { SelectedDate, SelectedDates } from '../type';
import { handleDateSelect, handleDatesSelect } from '../utils/DateHandler';
import apiClient from '../utils/axios';

export const Route = createFileRoute('/')({
    component: Home,
});

function Home() {
    const navigate = useNavigate();
    const destinations = [
        'Wollongong (WOL)',
        'Sydney (SYD)',
        'Melbourne (MEL)',
        'Adelaide (ADL)',
        'Darwin (DRW)',
        'Hobart (HBA)',
        'Perth (PER)',
        'Brisbane (BNE)',
    ];

    const destDictionary = {
        'Wollongong (WOL)': 'WOL',
        'Sydney (SYD)': 'SYD',
        'Melbourne (MEL)': 'MEL',
        'Adelaide (ADL)': 'ADL',
        'Darwin (DRW)': 'DRW',
        'Hobart (HBA)': 'HBA',
        'Perth (PER)': 'PER',
        'Brisbane (BNE)': 'BNE',
    };

    const menuClass =
        'flex flex-col w-[10rem] border border-white rounded-sm bg-(--primary) rounded-md shadow-md overflow-hidden';

    // location state for searching
    const [fromLocation, setFromLocation] = useState('Sydney (SYD)');
    const [toLocation, setToLocation] = useState('Brisbane (BNE)');
    const [isReturn, setIsReturn] = useState(true);

    const [selectedDate, setSelectedDate] = useState<SelectedDate>({
        selectedDeptDate: null,
    });
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        selectedDeptDate: null,
        selectedRetDate: null,
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isCalendarOpen) {
                    setIsCalendarOpen(false);
                }
            }
        };

        if (isCalendarOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCalendarOpen, setIsCalendarOpen]);

    return (
        <DropdownProvider>
            {isCalendarOpen &&
                (isReturn ? (
                    <DateRange
                        selectedDates={selectedDates}
                        setDateSelect={(day) => handleDatesSelect(day, setSelectedDates)}
                        setVisability={setIsCalendarOpen}
                        className="absolute z-10 shadow-md"
                    />
                ) : (
                    <DatePicker
                        selectedDate={selectedDate}
                        setDateSelect={(day) => handleDateSelect(day, setSelectedDate)}
                        setVisability={setIsCalendarOpen}
                        className="absolute z-10 shadow-md"
                    />
                ))}

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
                    const response = await apiClient.post('/api/flights', formData);
                    const searchParams = {
                        from: formData.from.toString(),
                        to: formData.to.toString(),
                        date: formData.deptDate.toString(),
                    };
                    if (response.status === 200) {
                        navigate({ to: '/booking/search', search: searchParams });
                    }
                }}
                method="post"
                action="/api/flights"
                className="grid grid-cols-2 grid-rows-3 gap-6 text-white bg-(--primary) w-[70%] p-6 rounded-3xl shadow-md/25"
            >
                {/* first row */}
                <DropdownButton
                    id="fly-from"
                    buttonContent={
                        <DropdownInputBox
                            svg={<Takeoff />}
                            id="fly-from"
                            label="Fly From"
                            name="from"
                            value={fromLocation}
                            destDictionary={destDictionary}
                        />
                    }
                    hoverOverlayTheme="light"
                    itemList={destinations.map((destination) => {
                        if (toLocation !== destination) {
                            return (
                                <DropdownMenuItem
                                    className="hover:bg-[#464870]"
                                    key={destination}
                                    onClick={() => {
                                        setFromLocation(destination);
                                    }}
                                    content={destination}
                                />
                            );
                        }
                    })}
                    menuClass={menuClass}
                />
                <DropdownButton
                    id="fly-to"
                    buttonContent={
                        <DropdownInputBox
                            svg={<Landing />}
                            id="fly-to"
                            label="Fly to"
                            name="to"
                            value={toLocation}
                            destDictionary={destDictionary}
                        />
                    }
                    hoverOverlayTheme="light"
                    itemList={destinations.map((destination) => {
                        if (fromLocation !== destination) {
                            return (
                                <DropdownMenuItem
                                    className="hover:bg-[#464870]"
                                    key={destination}
                                    onClick={() => {
                                        setToLocation(destination);
                                    }}
                                    content={destination}
                                />
                            );
                        }
                    })}
                    menuClass={menuClass}
                />

                <DateInputBox
                    className={!isReturn ? 'col-span-2' : ''}
                    name="deptDate"
                    svg={<CalendarSvg />}
                    label="Departure Date"
                    value={
                        isReturn
                            ? selectedDates.selectedDeptDate?.toISOString().substring(0, 10) || ''
                            : selectedDate.selectedDeptDate?.toISOString().substring(0, 10) || ''
                    }
                    onClick={() => {
                        setIsCalendarOpen(true);
                    }}
                />
                {isReturn && (
                    <DateInputBox
                        svg={<CalendarSvg />}
                        name="retDate"
                        label="Return Date"
                        value={selectedDates.selectedRetDate?.toISOString().substring(0, 10) || ''}
                        onClick={() => {
                            setIsCalendarOpen(true);
                        }}
                    />
                )}
                {/* third row */}
                <div className="flex justify-between w-full gap-10 col-span-2">
                    <PassengersInputBox
                        className="flex-2"
                        svg={<Passenger className="w-full h-full" />}
                        label="Total passengers"
                    />

                    <ToggleButton
                        className="flex-2"
                        isReturn={isReturn}
                        setIsReturn={setIsReturn}
                    />

                    <ActionButton className="self-center flex-1" hoverOverlayTheme="light">
                        Search
                    </ActionButton>
                </div>
            </form>
        </DropdownProvider>
    );
}

function ToggleButton({
    isReturn,
    setIsReturn,
    className,
}: {
    isReturn: boolean;
    setIsReturn: React.Dispatch<React.SetStateAction<boolean>>;
    className?: string;
}) {
    return (
        <label className={`flex items-center justify-center gap-2 ${className}`}>
            <div className={`border p-1 self-center rounded-sm`}>
                <div className={`grid grid-cols-2 bg-[#3D3F69] rounded-[2px]`}>
                    <input
                        readOnly
                        type="text"
                        name="isReturn"
                        className="hidden"
                        onClick={() => {
                            setIsReturn((isReturn) => !isReturn);
                        }}
                        value={isReturn.toString()}
                    />
                    <motion.div
                        layout
                        transition={{
                            duration: 0.2,
                        }}
                        className={`w-6 h-6 rounded-[2px] bg-[#B1B2C3] ${isReturn ? 'col-start-2' : 'col-start-1'}`}
                    ></motion.div>
                </div>
            </div>
            <div className="text-2xl min-w-[8rem]">{isReturn ? 'Return' : 'One way'}</div>
        </label>
    );
}
