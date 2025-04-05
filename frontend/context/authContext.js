"use client";
import { createContext, useContext, useState, useEffect } from 'react';

// Define user types
export const USER_TYPES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  BUSINESS: 'business'
};

// Create the context
const AuthContext = createContext(undefined);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(USER_TYPES.GUEST);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on load (from localStorage in this example)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser && storedUserType) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
    
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setUserType(USER_TYPES.GUEST);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check user type
  const isCustomer = () => userType === USER_TYPES.CUSTOMER;
  const isBusiness = () => userType === USER_TYPES.BUSINESS;

  // Auth context value
  const value = {
    user,
    userType,
    isLoading,
    isAuthenticated,
    isCustomer,
    isBusiness,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}