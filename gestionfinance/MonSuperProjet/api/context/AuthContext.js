// api/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api'; // ton axios configuré

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loader global (au lancement)

  // 🔐 Vérifie si un token existe au démarrage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/auth/me'); // endpoint pour récupérer l’utilisateur
          setUser(res.data.user);
        }
      } catch (err) {
        console.log('Erreur restauration session :', err.message);
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  // 🔑 Connexion
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    } catch (err) {
      console.log('Erreur login :', err.response?.data || err.message);
      throw err;
    }
  };

  // 🚪 Déconnexion
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // 🆕 Inscription
  const register = async (email, password, role = 'user') => {
    try {
      const res = await api.post('/auth/register', { email, password, role });
      return res.data;
    } catch (err) {
      console.log('Erreur register :', err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
