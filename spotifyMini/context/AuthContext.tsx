import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

import { API_URL } from '../app/config/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'artist';
  avatar?: string;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
  login: (payload: { token: string; user: AuthUser }) => Promise<void>;
  updateUser: (nextUser: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
};

const AUTH_TOKEN_KEY = 'spotifymini.auth.token';
const AUTH_USER_KEY = 'spotifymini.auth.user';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(AUTH_USER_KEY);

        setToken(storedToken ?? null);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.log(error);
      } finally {
        setIsReady(true);
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(async ({ token: nextToken, user: nextUser }: { token: string; user: AuthUser }) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, nextToken);
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const updateUser = useCallback(async (nextUser: AuthUser) => {
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      await clearSession();
    }
  }, [token, clearSession]);

  const handleUnauthorized = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ token, user, isReady, login, updateUser, logout, handleUnauthorized }}>
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
