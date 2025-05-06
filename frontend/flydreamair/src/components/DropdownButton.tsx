import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import { useDropdownContext } from '../context/dropdownContext';
import { DropdownMenu } from './DropdownMenu';

interface Props {
    id: string;
    buttonContent: React.ReactNode;
    buttonClass?: string;
    itemList: React.ReactNode;
    menuClass?: string;
    hoverOverlayTheme?: 'light' | 'dark';
}

export function DropdownButton({
    id,
    buttonContent,
    buttonClass,
    itemList,
    menuClass,
    hoverOverlayTheme,
}: Props) {
    const dropdownButtonRef = useRef<HTMLButtonElement>(null);
    const dropdownMenuRef = useRef<HTMLDivElement>(null);
    // check if DropdownButton is used within DropdownProvider
    const { activeButtonId, setActiveButtonId } = useDropdownContext();
    // reset all trackers if outside click is detected
    useEffect(() => {
        function outsideClickHandler(event: MouseEvent) {
            if (
                dropdownMenuRef.current &&
                !dropdownMenuRef.current.contains(event.target as Node) &&
                dropdownButtonRef.current &&
                !dropdownButtonRef.current.contains(event.target as Node) &&
                activeButtonId === id
            ) {
                setActiveButtonId(null);
            }
        }
        document.addEventListener('mousedown', outsideClickHandler);
        return () => {
            document.removeEventListener('mousedown', outsideClickHandler);
        };
    }, [dropdownMenuRef, activeButtonId, setActiveButtonId, id]);

    return (
        <>
            <button
                ref={dropdownButtonRef}
                // make it so that button doesn't submit a form
                type="button"
                // set to active on click
                onClick={() => {
                    if (activeButtonId !== id) {
                        setActiveButtonId(id);
                    } else {
                        setActiveButtonId(null);
                    }
                }}
                className={`relative ${buttonClass}`}
            >
                {buttonContent}
                {/* darken background overlay */}
                {hoverOverlayTheme ? (
                    <motion.div
                        variants={{
                            default: { opacity: 0 },
                            hover: { opacity: 0.16 },
                        }}
                        initial="default"
                        whileHover={activeButtonId === id ? 'default' : 'hover'}
                        animate={activeButtonId === id ? 'default' : 'default'}
                        className={`absolute z-30 top-0 left-0 w-full h-full rounded-[inherit] ${hoverOverlayTheme === 'light' ? 'bg-white' : 'bg-black'}`}
                    ></motion.div>
                ) : null}
            </button>
            <AnimatePresence>
                {activeButtonId === id && (
                    <DropdownMenu
                        dropdownMenuRef={dropdownMenuRef}
                        dropdownButtonRef={dropdownButtonRef}
                        className={menuClass}
                    >
                        {itemList}
                    </DropdownMenu>
                )}
            </AnimatePresence>
        </>
    );
}
