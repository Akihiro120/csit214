import { createContext, ReactNode, useState, useCallback, useEffect } from 'react';
import apiClient from './axios';

export interface AuthContextType {
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
    // Keep export
    children: ReactNode;
}

// callback function to set isLoading based on response
export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoading, setIsLoading] = useState(true);

    // Function to check the existing session status via GET
    const checkSession = useCallback(async (): Promise<boolean> => {
        try {
            const response = await apiClient.get('/api/booking/session');

            if (response.data && Object.keys(response.data).length > 0) {
                console.log('Existing session found via GET:', response.data);
                return true; // Session with data found
            } else {
                console.log('GET /api/booking/session returned empty data.');
                return false; // Session exists but is empty
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error checking session via GET:', error.message);
            } else {
                console.error('An unexpected error occurred:', error);
            }
            return false;
        }
    }, []);

    // Create a session if there isn't one.
    const initializeSession = useCallback(async (): Promise<void> => {
        try {
            console.log('Attempting POST /api/booking/session to initialize session.');
            const postResponse = await apiClient.post('/api/booking/session', {
                initialized: Date.now(),
            });
            console.log('Session initialized via POST, response:', postResponse.data);
        } catch (postError) {
            console.error('Error initializing session via POST:', postError);
        }
    }, []);

    // Effect to handle callbacks
    useEffect(() => {
        setIsLoading(true);
        const manageSession = async () => {
            const sessionExists = await checkSession();

            if (!sessionExists) {
                await initializeSession();
            }

            setIsLoading(false);
        };

        manageSession();
    }, [checkSession, initializeSession]); // Include functions in dependencies

    const value: AuthContextType = {
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
