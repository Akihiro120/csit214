import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthProvider'; 

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // This error indicates that useAuth is being called outside of an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Context is guaranteed to be non-null here due to the check above
  return context;
};