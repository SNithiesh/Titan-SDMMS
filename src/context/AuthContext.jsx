import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginRequest, logoutRequest } from '../api/auth.api.js';

/**
 * AuthContext — Global authentication state for the entire app
 * Any component can call useAuth() to get currentUser and auth functions
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('titan_sdmms_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) { return null; }
  });

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  /**
   * Login: call backend API → get JWT → store token → set user
   */
  const login = useCallback(async (employeeId, password) => {
    setIsAuthLoading(true);
    setAuthError('');

    try {
      const result = await loginRequest(employeeId, password);

      if (result.status === 'success' && result.data?.accessToken) {
        const { accessToken, user } = result.data;

        // Store JWT token for API requests
        sessionStorage.setItem('titan_access_token', accessToken);
        localStorage.setItem('titan_access_token', accessToken);

        // Store user profile for UI (no sensitive data)
        localStorage.setItem('titan_sdmms_user', JSON.stringify(user));

        setCurrentUser(user);
        return { success: true, user };
      } else {
        const msg = result.message || 'Login failed';
        setAuthError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection error. Please check network.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  /**
   * Logout: notify server → clear all tokens → reset state
   */
  const logout = useCallback(async () => {
    await logoutRequest();
    setCurrentUser(null);
    setAuthError('');
  }, []);

  /**
   * Quick demo login (bypasses backend — for demo mode only)
   */
  const quickDemoLogin = useCallback((user) => {
    localStorage.setItem('titan_sdmms_user', JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthLoading,
      authError,
      setAuthError,
      login,
      logout,
      quickDemoLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state from any component
 * Usage: const { currentUser, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
