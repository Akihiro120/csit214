import { createContext, useContext } from 'react';

// Define the shape of the context data
export interface DropdownContextProps {
    activeButtonId: string | null;
    setActiveButtonId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create and export ONLY the context object
export const DropdownContext = createContext<DropdownContextProps | null>(null);

export const useDropdownContext = () => {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('useDropdownContext must be used within a DropdownProvider');
    }
    return context;
};
