import { useState } from 'react';
import { DropdownContext } from '../context/dropdownContext';

export function DropdownProvider({ children }: { children: React.ReactNode }) {
    const [activeButtonId, setActiveButtonId] = useState<string | null>(null);

    return (
        <DropdownContext.Provider value={{ activeButtonId, setActiveButtonId }}>
            {children}
        </DropdownContext.Provider>
    );
}
