import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const register = async (email, password, role = 'user') => {
    const res = await api.post('/auth/register', { email, password, role });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
