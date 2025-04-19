// Example: Authentication context or hook
// src/hooks/useAuth.js (or similar)
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import apiClient from './axios'; // Import the configured Axios instance

// Define a type for the user object (adjust as needed)
interface User {
  // Example properties: id, name, email, etc.
  [key: string]: string;
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  // Add login/logout functions here if needed
  // login: (credentials: any) => Promise<void>;
  // logout: () => Promise<void>;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    let ignore = false; // Flag to handle StrictMode double invocation
    setIsLoading(true);
    let sessionFoundOnGet = false; 

    // 1. Try GET first
    apiClient.get<{ user?: User; data?: any }>('/api/booking/session')
      .then(response => {
        if (ignore) return; // Check flag
        if (response.data && (response.data.user || response.data.data)) {
          console.log("Existing session found via GET:", response.data);
          setUser(response.data.user || null); 
          sessionFoundOnGet = true; 
        } else {
          console.log("GET /api/booking/session returned empty data.");
          setUser(null);
        }
      })
      .catch(error => {
        if (ignore) return; // Check flag
        if (error.response?.status !== 404 && !(error.response?.status === 200 && Object.keys(error.response.data || {}).length === 0)) {
           console.error("Error during initial GET /api/booking/session:", error);
        } else {
           console.log("Initial GET indicates no active session or session is empty.");
        }
        setUser(null);
      })
      .finally(() => {
        if (ignore) return; // Check flag

        // 2. Conditionally POST
        if (!sessionFoundOnGet) {
          console.log("Attempting POST /api/booking/session to initialize session.");
          apiClient.post('/api/booking/session', { initialized: Date.now() })
            .then(postResponse => {
              if (ignore) return; // Check flag
              console.log("Session initialized via POST, response:", postResponse.data);
            })
            .catch(postError => {
              if (ignore) return; // Check flag
              console.error("Error initializing session via POST:", postError);
            })
            .finally(() => {
              if (ignore) return; // Check flag
              setIsLoading(false); 
            });
        } else {
          setIsLoading(false);
        }
      });

    // Cleanup function: sets the ignore flag when the effect is cleaned up
    return () => {
      ignore = true;
    };
  }, []); // Empty dependency array ensures this runs only once on mount (per StrictMode cycle)

  const value: AuthContextType = {
    user,
    setUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Context is guaranteed to be non-null here due to the check
};