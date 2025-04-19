// Example: Authentication context or hook
// src/hooks/useAuth.js (or similar)
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import apiClient from './axios'; // Import the configured Axios instance

const AuthContext = createContext<any>(null); // Consider defining a more specific context type

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any>(null); // Consider defining a User type
  const [isLoading, setIsLoading] = useState(true); // Track initial load

  // Check session on initial load
  useEffect(() => {
    setIsLoading(true);
    // Use the configured apiClient instance which has withCredentials: true
    apiClient.get('/api/booking/session') 
      .then(response => {
        // Assuming your backend sends session data like { user: { ... } } or {} if no user
        setUser(response.data.user || null); 
      })
      .catch(error => {
        // It's okay if it fails (e.g., 401 Unauthorized), means not logged in
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

  // Define the value provided by the context
  const value = {
    user,
    setUser, // You might want functions like login/logout here too
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};