/* import { JSX } from "react";

interface Props {
	onclick: () => void;
	children?: React.ReactNode;
}

export function ActionButton({ onclick, children }: Props): JSX.Element {
	return (
		<button
			onClick={onclick}
			className="text-white bg-(--accent) hover:bg-(--hover-button) shadow-md/25 p-2 rounded-md"
		>
			{children}
		</button>
	);
}
 */
import { motion } from 'motion/react';
import React from 'react';

interface Props {
    className?: string;
    children: React.ReactNode;
    hoverOverlayTheme?: 'light' | 'dark';
    onClick?: () => void;
}

export function ActionButton({ className, children, hoverOverlayTheme, onClick }: Props) {
    const [isActive, setIsActive] = React.useState(false);

    return (
        <button
            /* set to active on click */
            onMouseDown={() => {
                setIsActive(true);
            }}
            onMouseUp={() => {
                setIsActive(false);
            }}
            onClick={onClick}
            className={`cursor-pointer relative bg-(--accent) text-white shadow-md/25 p-2 rounded-md ${className}`}
        >
            {/* darken background overlay */}
            {hoverOverlayTheme ? (
                <motion.div
                    variants={{
                        default: { opacity: 0 },
                        hover: { opacity: 0.16 },
                        active: { opacity: 0.22 },
                    }}
                    initial="default"
                    whileHover={isActive ? 'active' : 'hover'}
                    animate={isActive ? 'active' : 'default'}
                    className={`absolute z-30 top-0 left-0 w-full h-full rounded-[inherit] ${hoverOverlayTheme === 'light' ? 'bg-white' : 'bg-black'}`}
                ></motion.div>
            ) : null}
            {children}
        </button>
    );
}
