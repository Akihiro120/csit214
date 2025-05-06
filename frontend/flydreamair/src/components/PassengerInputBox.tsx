import { motion } from 'motion/react';
import { useState } from 'react';
import Minus from '../resource/Minus.svg?react';
import Plus from '../resource/Plus.svg?react';

interface Props {
    className?: string;
    svg: React.ReactNode;
    label: string;
}
export function PassengersInputBox({ className, svg, label }: Props) {
    const [passengers, setPassengers] = useState(1);
    function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        if (Number(newValue[1]) > 0) {
            setPassengers(Number(newValue[1]));
        } else {
            setPassengers(Number(newValue[0]));
        }
    }

    return (
        <label
            className={`${className} cursor-text grid grid-cols-[3rem_1fr_3rem_3rem] grid-rows-[auto_auto] justify-items-start rounded-sm border border-white p-1 gap-x-1 text-white`}
        >
            <div className="w-[2.5rem] h-[2.5rem] col-start-1 row-start-1 row-span-2 self-center justify-self-center">
                {svg}
            </div>
            <div className="text-sm text-[#ffffff99]">{label}</div>
            <div className="text-xl row-start-2 px-1">
                <input
                    required
                    type="number" // Use text type to better control input, pattern handles numeric check
                    min={1}
                    max={9}
                    className="w-4 pointer-events-none"
                    name="passengers"
                    value={passengers}
                    onChange={handleOnChange}
                />
                <span>Passengers</span>
            </div>
            <ChangeValueButton onClick={() => setPassengers((prev) => Math.min(prev + 1, 9))}>
                <Plus />
            </ChangeValueButton>
            <ChangeValueButton onClick={() => setPassengers((prev) => Math.max(prev - 1, 1))}>
                <Minus />
            </ChangeValueButton>
        </label>
    );
}

function ChangeValueButton({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick?: () => void;
}) {
    const [isActive, setIsActive] = useState(false);

    return (
        <button
            type="button"
            /* set to active on click */
            onMouseDown={() => {
                setIsActive(true);
            }}
            onMouseUp={() => {
                setIsActive(false);
            }}
            onClick={onClick}
            className="relative rounded-sm p-2 w-8 h-8 border border-white justify-self-center self-center row-span-2 text-3xl"
        >
            <motion.div
                variants={{
                    default: { opacity: 0 },
                    hover: { opacity: 0.16 },
                    active: { opacity: 0.22 },
                }}
                initial="default"
                whileHover={isActive ? 'active' : 'hover'}
                animate={isActive ? 'active' : 'default'}
                className={`absolute z-30 top-0 left-0 w-full h-full rounded-[inherit] bg-white`}
            ></motion.div>
            {children}
        </button>
    );
}
