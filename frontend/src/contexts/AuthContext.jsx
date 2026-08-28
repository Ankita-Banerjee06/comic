import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuthSession()?.user || null);
  const [token, setToken] = useState(() => loadAuthSession()?.token || null);
  // true only while we're confirming a session found in localStorage is
  // still valid server-side — false immediately when there's no session
  // to check, so a fresh visitor never sees a loading flash.
  const [loading, setLoading] = useState(() => Boolean(loadAuthSession()?.token));

  useEffect(() => {
    const stored = loadAuthSession();

    if (!stored?.token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((data) => {
        setUser(data.user);
        saveAuthSession({ token: stored.token, user: data.user });
      })
      .catch(() => {
        // stored token is no longer valid (logged out elsewhere, server
        // data reset, etc.) — drop the stale session rather than get stuck
        clearAuthSession();
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    const data = await registerUser({ name, email, password, role });
    saveAuthSession({ token: data.token, user: data.user });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginUser({ email, password });
    saveAuthSession({ token: data.token, user: data.user });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // clear locally even if the network call fails
    } finally {
      clearAuthSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        role: user?.role || null,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
