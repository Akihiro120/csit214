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
  const [user, setUser] = useState<User | null>(null); // Use the User type
  const [isLoading, setIsLoading] = useState(true); // Track initial load

  // Check session on initial load
  useEffect(() => {
    setIsLoading(true);
    apiClient.get<{ user?: User }>('/api/booking/session') // Add type hint for response data
      .then(response => {
        // Backend should ideally return session info, including user data if logged in
        setUser(response.data.user || null); 
      })
      .catch(error => {
        if (error.response?.status !== 401) {
            console.error("Error fetching session:", error);
        }
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  },
  []);

  // Define the value provided by the context, matching AuthContextType
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