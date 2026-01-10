import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, username?: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('theria-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, username?: string): Promise<boolean> => {
    // Demo mode - accept any credentials
    const demoUser: User = {
      id: '1',
      username: username || email.split('@')[0],
      email,
      createdAt: new Date().toISOString(),
    };
    
    setUser(demoUser);
    localStorage.setItem('theria-user', JSON.stringify(demoUser));
    return true;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Demo mode - accept any registration
    const demoUser: User = {
      id: '1',
      username,
      email,
      createdAt: new Date().toISOString(),
    };
    
    setUser(demoUser);
    localStorage.setItem('theria-user', JSON.stringify(demoUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('theria-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
