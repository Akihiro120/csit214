import { useEffect, useState } from 'react';
import { ActionButton } from './ActionButton';

interface Props {
    className?: string;
    selectedDates: {
        selectedDeptDate: Date | null;
        selectedRetDate: Date | null;
    };
    setDateSelect: (day: Date | null) => void;
    setVisability: (isVisible: boolean) => void;
}

function generateDaysInMonth(year: number, month: number): (number | null)[][] {
    const firstOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstOfMonth.getDay();

    const calendarGrid: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];
    let dayCounter = 1;

    // padding days
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
    }

    // fill rest of grid
    while (dayCounter <= daysInMonth) {
        currentWeek.push(dayCounter);
        dayCounter++;

        // go to next week is current week is 7
        if (currentWeek.length === 7) {
            calendarGrid.push(currentWeek);
            currentWeek = [];
        }
    }

    // null padding on tail end
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        calendarGrid.push(currentWeek);
    }
    while (calendarGrid.length < 6) {
        calendarGrid.push([null, null, null, null, null, null, null]); // Add a full week of nulls
    }

    return calendarGrid;
}

export function DateRange({ className, selectedDates, setDateSelect, setVisability }: Props) {
    const today = new Date();
    const [currentDisplayYear, setCurrentDisplayYear] = useState(today.getFullYear());
    const [currentDisplayMonth, setCurrentDisplayMonth] = useState(today.getMonth());

    const [calendarGrid, setCalendarGrid] = useState<(number | null)[][]>([]);

    useEffect(() => {
        setCalendarGrid(generateDaysInMonth(currentDisplayYear, currentDisplayMonth + 1));
    }, [currentDisplayYear, currentDisplayMonth]);

    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    const handleDateHover = (date: Date | null) => {
        setHoveredDate(date);
    };

    const handleDateLeave = () => {
        setHoveredDate(null);
    };

    const isBetween = (currentDayDate: Date | null): boolean => {
        if (!currentDayDate) return false;

        const { selectedDeptDate, selectedRetDate } = selectedDates;

        if (selectedDeptDate && selectedRetDate) {
            const start = Math.min(selectedDeptDate.getTime(), selectedRetDate.getTime());
            const end = Math.max(selectedDeptDate.getTime(), selectedRetDate.getTime());
            return currentDayDate.getTime() > start && currentDayDate.getTime() < end;
        } else if (selectedDeptDate && hoveredDate) {
            if (hoveredDate.getTime() === selectedDeptDate.getTime()) return false;
            const start = Math.min(selectedDeptDate.getTime(), hoveredDate.getTime());
            const end = Math.max(selectedDeptDate.getTime(), hoveredDate.getTime());
            return currentDayDate.getTime() > start && currentDayDate.getTime() < end;
        }
        return false;
    };

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const [year, month] = event.target.value.split('-').map(Number);
        setCurrentDisplayYear(year);
        setCurrentDisplayMonth(month);
    };

    const getMonthOptions = () => {
        const options = [];
        const date = new Date();
        for (let i = 0; i < 9; i++) {
            const newDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
            const monthName = newDate.toLocaleString('default', { month: 'long' });
            const year = newDate.getFullYear();
            options.push(
                <option
                    key={`${year}-${newDate.getMonth()}`}
                    value={`${year}-${newDate.getMonth()}`}
                >
                    {monthName} {year}
                </option>
            );
        }
        return options;
    };

    return (
        <div
            className={`${className} flex flex-col gap-2 p-4 rounded-md text-black bg-white`}
            onMouseLeave={handleDateLeave}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div className="flex justify-center items-center">
                <select
                    value={`${currentDisplayYear}-${currentDisplayMonth}`}
                    onChange={handleMonthChange}
                    className="text-[24px] text-center text-(--primary) font-bold cursor-pointer outline-none"
                >
                    {getMonthOptions()}
                </select>
            </div>

            <div className="my-4 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                <div>Sun</div> <div>Mon</div> <div>Tue</div> <div>Wed</div> <div>Thu</div>{' '}
                <div>Fri</div> <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((week, weekIndex) =>
                    week.map((day, dayIndex) => {
                        let dayClassName = `
                            flex text-right p-2 w-[120px] h-[75px] rounded-[4px] transition-colors duration-100 ease-in-out box-border 
                        `;
                        if (!day) {
                            return <div className={dayClassName}></div>;
                        }
                        const dayDate = day
                            ? new Date(currentDisplayYear, currentDisplayMonth, day)
                            : null;

                        const isSelectedDept =
                            dayDate &&
                            selectedDates.selectedDeptDate &&
                            dayDate.getTime() === selectedDates.selectedDeptDate.getTime();
                        const isSelectedRet =
                            dayDate &&
                            selectedDates.selectedRetDate &&
                            dayDate.getTime() === selectedDates.selectedRetDate.getTime();
                        const isSelected = isSelectedDept || isSelectedRet;

                        const isCurrentlyHovered =
                            dayDate && hoveredDate && dayDate.getTime() === hoveredDate.getTime();
                        const isInBetween = isBetween(dayDate);
                        const isClickable = day !== null;

                        if (isClickable && dayDate) {
                            dayClassName += ` cursor-pointer text-black`;
                            if (isSelected) {
                                dayClassName += ` bg-[var(--calendarSelected)] text-white`;
                            } else if (isInBetween) {
                                dayClassName += ` bg-[var(--calendarBetween)]`;
                            } else if (
                                isCurrentlyHovered &&
                                selectedDates.selectedDeptDate &&
                                !selectedDates.selectedRetDate &&
                                dayDate.getTime() !== selectedDates.selectedDeptDate.getTime()
                            ) {
                                dayClassName += ` bg-[var(--calendarBetween)]`;
                            } else {
                                dayClassName += ` bg-[var(--calendarUnselected)] hover:bg-[var(--calendarBetween)]`;
                            }
                        } else {
                            dayClassName += ' bg-transparent pointer-events-none';
                        }

                        return (
                            <div
                                key={`week-${weekIndex}-day-${dayIndex}`}
                                className={dayClassName.trim() + ' shadow-sm/25'}
                                onClick={() => isClickable && dayDate && setDateSelect(dayDate)}
                                onMouseEnter={() =>
                                    isClickable && dayDate && handleDateHover(dayDate)
                                }
                            >
                                {day}
                            </div>
                        );
                    })
                )}
            </div>
            <div className="flex justify-end">
                <ActionButton
                    className="justify-right"
                    hoverOverlayTheme="light"
                    onClick={() => {
                        setVisability(false);
                    }}
                >
                    Continue
                </ActionButton>
            </div>
        </div>
    );
}
