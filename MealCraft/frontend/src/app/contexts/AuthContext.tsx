import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userId: number | null;
  userName: string | null;
  login: (token: string, userId: number, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [userId, setUserId] = useState<number | null>(() => {
    const id = localStorage.getItem('user_id');
    return id ? Number(id) : null;
  });
  const [userName, setUserName] = useState<string | null>(
    () => localStorage.getItem('user_name')
  );

  const isAuthenticated = token !== null;

  const login = (newToken: string, newUserId: number, name: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_id', String(newUserId));
    localStorage.setItem('user_name', name);
    setToken(newToken);
    setUserId(newUserId);
    setUserName(name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    setToken(null);
    setUserId(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userId, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
