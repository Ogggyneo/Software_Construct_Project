import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'userId', 'userName']).then(pairs => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map.token) {
        setToken(map.token);
        setUserId(map.userId);
        setUserName(map.userName);
      }
    });
  }, []);

  const login = async (t: string, uid: string, name: string) => {
    await AsyncStorage.multiSet([['token', t], ['userId', uid], ['userName', name]]);
    setToken(t);
    setUserId(uid);
    setUserName(name);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'userId', 'userName']);
    setToken(null);
    setUserId(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, userName, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
