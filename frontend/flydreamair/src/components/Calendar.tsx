import { motion } from 'motion/react';
import { JSX, useState } from 'react';
import { useDropdownContext } from '../context/dropdownContext';
import DropdownArrow from '../resource/DropdownArrow.svg?react';
import { DropdownButton } from './DropdownButton';
import { DropdownMenuItem } from './DropdownMenuItem';

export function Calendar(): JSX.Element {
    const monthList = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const [currentMonth, setCurrentMonth] = useState('January');
    return (
        <div className="fixed z-100 flex items-center justify-center inset-0 bg-[rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-center gap-6 rounded-lg bg-white w-[70%] h-[70%] p-4">
                <DropdownButton
                    id="month"
                    buttonContent={<MonthDropdown id="month">{currentMonth}</MonthDropdown>}
                    itemList={monthList.map((month) => (
                        <DropdownMenuItem
                            key={month}
                            content={month}
                            onClick={() => {
                                setCurrentMonth(month);
                            }}
                        />
                    ))}
                />
            </div>
        </div>
    );
}
function MonthDropdown({ id, children }: { id: string; children: React.ReactNode }) {
    const { activeButtonId } = useDropdownContext();

    return (
        <div className="text-(--accent) text-4xl">
            {/* dropdown arrow */}
            <span>{children}</span>
            <motion.div
                variants={{
                    normal: { rotate: 0 },
                    active: { rotate: 180 },
                }}
                animate={activeButtonId === id ? 'active' : 'normal'}
                transition={{
                    type: 'tween',
                    duration: 0.2,
                }}
                className=" w-5 h-5 self-center justify-self-center col-start-3 row-start-1 row-span-2"
            >
                <DropdownArrow />
            </motion.div>
        </div>
    );
}
