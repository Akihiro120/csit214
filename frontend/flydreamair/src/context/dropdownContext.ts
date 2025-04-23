import { createContext } from "react";

// Define the shape of the context data
export interface DropdownContextProps {
	activeButtonId: string | null;
	setActiveButtonId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create and export ONLY the context object
export const DropdownContext = createContext<DropdownContextProps | null>(null);
