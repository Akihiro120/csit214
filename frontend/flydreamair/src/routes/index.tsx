import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { ActionButton } from '../components/ActionButton';
import { DateInputBox } from '../components/DateInputBox';
import { DropdownButton } from '../components/DropdownButton';
import { DropdownInputBox } from '../components/DropdownInputBox';
import { DropdownMenuItem } from '../components/DropdownMenuItem';
import { DropdownProvider } from '../components/DropdownProvider';
import { PassengersInputBox } from '../components/PassengerInputBox';
import { DatePicker } from '../components/DatePicker';
import { DateRange } from '../components/DateRange';
import { handleDateSelect, handleDatesSelect } from '../utils/DateHandler';
import { SelectedDate, SelectedDates } from '../type';
import CalendarSvg from '../resource/Calendar.svg?react';
import Landing from '../resource/Landing.svg?react';
import Passenger from '../resource/Passenger.svg?react';
import Takeoff from '../resource/Takeoff.svg?react';

export const Route = createFileRoute('/')({
    component: Home,
});

function Home() {
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
    const menuClass =
        'flex flex-col w-[10rem] border border-white rounded-sm bg-(--primary) rounded-md shadow-md overflow-hidden';

    // location state for searching
    const [fromLocation, setFromLocation] = useState('Sydney (SYD)');
    const [toLocation, setToLocation] = useState('Brisbane (BNE)');
    const [isReturn, setIsReturn] = useState(false);

    const [selectedDate, setSelectedDate] = useState<SelectedDate>({
        selectedDeptDate: null,
    });
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        selectedDeptDate: null,
        selectedRetDate: null,
    });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isDatePickerOpen) {
                    setIsDatePickerOpen(false);
                }
                if (isDateRangeOpen) {
                    setIsDateRangeOpen(false);
                }
            }
        };

        if (isDatePickerOpen || isDateRangeOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDatePickerOpen, setIsDatePickerOpen, isDateRangeOpen, setIsDateRangeOpen]);

    return (
        <DropdownProvider>
            {isDatePickerOpen && (
                <DatePicker
                    selectedDate={selectedDate}
                    setDateSelect={(day) => handleDateSelect(day, setSelectedDate)}
                    setVisability={setIsDatePickerOpen}
                    className="absolute z-10 shadow-md"
                />
            )}

            {isDateRangeOpen && (
                <DateRange
                    selectedDates={selectedDates}
                    setDateSelect={(day) => handleDatesSelect(day, setSelectedDates)}
                    setVisability={setIsDateRangeOpen}
                    className="absolute z-10 shadow-md"
                />
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formdata = new FormData(e.currentTarget);
                    console.log(Object.fromEntries(formdata.entries()));
                }}
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
                        />
                    }
                    hoverOverlayTheme="light"
                    itemList={destinations.map((destination) => {
                        if (toLocation !== destination) {
                            return (
                                <DropdownMenuItem
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
                        />
                    }
                    hoverOverlayTheme="light"
                    itemList={destinations.map((destination) => {
                        if (fromLocation !== destination) {
                            return (
                                <DropdownMenuItem
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
                    svg={<CalendarSvg />}
                    label="Departure Date"
                    value={
                        isReturn
                            ? selectedDates.selectedDeptDate?.toLocaleDateString() || ''
                            : selectedDate.selectedDeptDate?.toLocaleDateString() || ''
                    }
                    onClick={() => {
                        if (isReturn) {
                            setIsDateRangeOpen(true);
                        } else {
                            setIsDatePickerOpen(true);
                        }
                    }}
                />
                {isReturn && (
                    <DateInputBox
                        className=""
                        svg={<CalendarSvg />}
                        label="Return Date"
                        value={selectedDates.selectedRetDate?.toLocaleDateString() || ''}
                        onClick={() => {
                            setIsDateRangeOpen(true);
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

                    <ActionButton
                        className="self-center flex-1"
                        hoverOverlayTheme="light"
                        onClick={() => {
                            console.log('Search');
                        }}
                    >
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
                        type="checkbox"
                        name="isReturn"
                        className="hidden"
                        checked={isReturn}
                        onChange={() => {
                            setIsReturn((isReturn) => !isReturn);
                        }}
                        value="true"
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
