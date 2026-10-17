import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await getMe();
          setUser(res?.data || res);
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const accessToken = res?.access_token || res?.data?.access_token;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    }
    try {
      const me = await getMe();
      setUser(me?.data || me);
    } catch {
      // User will be updated by useEffect
    }
    return res;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    const accessToken = res?.access_token || res?.data?.access_token;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
